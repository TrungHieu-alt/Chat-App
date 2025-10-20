const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const pool = require("./config/pool");
const jwt = require("jsonwebtoken");
const PORT = 5001;

const JWT_SECRET = process.env.JWT_SECRET;

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Token Not Found"));
  try {
    const decodedJwt = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decodedJwt.id };
    next();
  } catch (e) {
    console.log(e);
    next(new Error("Invalid token"));
  }
});

// connect/disconnect listener
io.on("connection", async (socket) => {
  try {
    const userId = socket.user.id;
    console.log(`✅ User connected: ${socket.id} (${userId})`);
    socket.join(userId);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE users SET status = 'online' WHERE id = ?", [userId]);
      await conn.commit();

      // Lấy toàn bộ user liên quan (tức là có chung conversation)
      const [relatedUsers] = await conn.query(`
        SELECT DISTINCT cm2.user_id
        FROM conversation_members cm1
        JOIN conversation_members cm2 
          ON cm1.conversation_id = cm2.conversation_id
        WHERE cm1.user_id = ?;
      `, [userId]);

      // Emit 1 event duy nhất cho từng user liên quan
      for (const u of relatedUsers) {
        io.to(u.user_id).emit("user_status_change", { user_id: userId, status: "online" });
      }

    } catch (err) {
      await conn.rollback();
      console.error("UPDATE ONLINE TRANSACTION ERROR:", err);
    } finally {
      conn.release();
    }
  } catch (e) {
    console.error(e);
  }


  // join vào để nhận thông báo tin nhắn khi chưa join room chat
  //send message logic
  socket.on("send_message", async (data) => {
    const conn = await pool.getConnection();
    const user = socket.user;
    if (!(data.text || data.attachment_url)) {
      return socket.emit("log", {
        statusCode: 400,
        message: "message content is null",
      });
    }

    try {
      await conn.beginTransaction();
      const [isIn] = await conn.query(
        `Select 1 from conversation_members where user_id = ? AND conversation_id = ?`,
        [user.id, data.conversation_id]
      );
      if (isIn.length === 0) {
        await conn.rollback();
        conn.release();
        return socket.emit("log", {
          statusCode: 403,
          message: "user is not in this conversation",
        });
      }
      const id = uuidv4();

      const [result] = await conn.query(
        `INSERT INTO messages 
            (id, conversation_id, sender_id, type, text, attachment_url, attachment_meta)
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
        `SELECT m.id, m.sender_id, m.created_at, m.text
                FROM messages m
                WHERE m.id = ?`,
        [id]
      );
      socket.emit("receive_message", rows[0]); // gửi cho fe để update tin nhắn
      socket.to(data.conversation_id).emit("receive_message", rows[0]); // gửi cho mọi người khác trong room
      const [members] = await conn.query(
        `SELECT mem.user_id
                FROM conversation_members mem
                WHERE mem.conversation_id = ?`,
        [data.conversation_id]
      );

      // gửi thông báo ngắn cho các mem khác cũng nhận được khi chưa join room chat
      for (const member of members) {
        io.to(member.user_id).emit("notification", {
          ...rows[0],
          conversation_id: data.conversation_id,
        });
      }

      return socket.emit("log", {
        statusCode: 200,
        message: "send Message successfully",
      });
    } catch (error) {
      console.error("ERROR when create message:", error);
      await conn.rollback();
      return socket.emit("log", {
        statusCode: 500,
        message: "Internal server error",
      });
    } finally {
      conn.release();
    }
  });

  socket.on("join_room", (conversation_id) => {
    socket.join(conversation_id);
    socket.emit(
      "log",
      `User ${socket.user.id} joined room ${conversation_id}`
    );
  });

  socket.on("createConversation", (newConversation) => {
    const user = socket.user;
    const members = newConversation.members;
    for (const member of members) {
      io.to(member).emit("onConversation", {
        ...newConversation,
        members: [...newConversation.members, user.id],
      });
    }
  });

  socket.on("disconnect", async () => {
    const userId = socket.user.id;
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
      console.error("UPDATE OFFLINE TRANSACTION ERROR:", err);
    } finally {
      conn.release();
    }
  });
});

console.log(`⚡ Socket.IO server running at ws://localhost:${PORT}/`);
