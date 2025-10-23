const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const pool = require("./config/pool");
const jwt = require("jsonwebtoken");

const PORT = process.env.SOCKET_PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET;

// ================================
// 🔧 HTTP + Socket.IO Server Setup
// ================================
const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*", // ví dụ "https://chat-app.vercel.app"
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // fallback nếu websocket bị block
  pingInterval: 25000, // gửi ping mỗi 25s
  pingTimeout: 60000, // timeout 60s nếu client không phản hồi
  maxHttpBufferSize: 1e7, // 10MB (phòng trường hợp gửi ảnh)
});

// ================================
// 🔐 JWT Authentication Middleware
// ================================
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Token Not Found"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error("❌ JWT VERIFY FAILED:", err);
    next(new Error("Invalid Token"));
  }
});

// ================================
// ⚡ Socket Event Handlers
// ================================
io.on("connection", async (socket) => {
  const userId = socket.user.id;
  console.log(`✅ User connected: ${socket.id} (${userId})`);
  socket.join(userId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE users SET status = 'online' WHERE id = ?", [userId]);
    await conn.commit();

    // gửi status cho user liên quan
    const [relatedUsers] = await conn.query(`
      SELECT DISTINCT cm2.user_id
      FROM conversation_members cm1
      JOIN conversation_members cm2 
        ON cm1.conversation_id = cm2.conversation_id
      WHERE cm1.user_id = ?;
    `, [userId]);

    for (const u of relatedUsers) {
      io.to(u.user_id).emit("user_status_change", { user_id: userId, status: "online" });
    }
  } catch (err) {
    await conn.rollback();
    console.error("UPDATE ONLINE ERROR:", err);
  } finally {
    conn.release();
  }

  // ===========================
  // 📨 Message Sending Handler
  // ===========================
  socket.on("send_message", async (data) => {
    const conn = await pool.getConnection();
    const user = socket.user;
    if (!(data.text || data.attachment_url)) {
      return socket.emit("log", { statusCode: 400, message: "Message content is null" });
    }

    try {
      await conn.beginTransaction();
      const [isIn] = await conn.query(
        `SELECT 1 FROM conversation_members WHERE user_id = ? AND conversation_id = ?`,
        [user.id, data.conversation_id]
      );
      if (isIn.length === 0) {
        await conn.rollback();
        conn.release();
        return socket.emit("log", { statusCode: 403, message: "User is not in this conversation" });
      }

      const id = uuidv4();
      await conn.query(
        `INSERT INTO messages (id, conversation_id, sender_id, type, text, attachment_url, attachment_meta)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.conversation_id,
          user.id,
          data.type || "text",
          data.text || null,
          data.attachment_url || null,
          JSON.stringify(data.attachment_meta || null),
        ]
      );
      await conn.commit();

      const [rows] = await conn.query(
        `SELECT id, sender_id, created_at, text FROM messages WHERE id = ?`,
        [id]
      );

      socket.emit("receive_message", rows[0]); // FE tự update
      socket.to(data.conversation_id).emit("receive_message", rows[0]); // broadcast tới room

      const [members] = await conn.query(
        `SELECT user_id FROM conversation_members WHERE conversation_id = ?`,
        [data.conversation_id]
      );
      for (const m of members) {
        io.to(m.user_id).emit("notification", { ...rows[0], conversation_id: data.conversation_id });
      }

      socket.emit("log", { statusCode: 200, message: "Message sent successfully" });
    } catch (err) {
      await conn.rollback();
      console.error("SEND MESSAGE ERROR:", err);
      socket.emit("log", { statusCode: 500, message: "Internal server error" });
    } finally {
      conn.release();
    }
  });

  // ===========================
  // 🧩 Other socket events
  // ===========================
  socket.on("join_room", (conversation_id) => {
    socket.join(conversation_id);
    socket.emit("log", `User ${socket.user.id} joined room ${conversation_id}`);
  });

  socket.on("createConversation", (newConversation) => {
    const user = socket.user;
    for (const member of newConversation.members) {
      io.to(member).emit("onConversation", {
        ...newConversation,
        members: [...newConversation.members, user.id],
      });
    }
  });

  socket.on("disconnect", async () => {
    console.log(`❌ User disconnected: ${socket.id} (${userId})`);
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE users SET status = 'offline' WHERE id = ?", [userId]);
      await conn.commit();

      const [relatedUsers] = await conn.query(`
        SELECT DISTINCT cm2.user_id
        FROM conversation_members cm1
        JOIN conversation_members cm2 
          ON cm1.conversation_id = cm2.conversation_id
        WHERE cm1.user_id = ?;
      `, [userId]);

      for (const u of relatedUsers) {
        io.to(u.user_id).emit("user_status_change", { user_id: userId, status: "offline" });
      }
    } catch (err) {
      await conn.rollback();
      console.error("UPDATE OFFLINE ERROR:", err);
    } finally {
      conn.release();
    }
  });
});

// ================================
// 🚀 Server start (bind 0.0.0.0)
// ================================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`⚡ Socket.IO server running at ws://0.0.0.0:${PORT}`);
});
