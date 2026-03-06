const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const pool = require("./config/pool");
const jwt = require("jsonwebtoken");
const { updateConversationNameService, getConversationMembers } = require("./services/conversationService");
const { updateUserStatusService } = require("./services/userService");
const cookie = require("cookie")
const {createMessageService} = require("./services/messageService")

const JWT_SECRET = process.env.JWT_SECRET;
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const disconnectTimers = new Map();
// ================================
// 🔧 HTTP + Socket.IO Server Setup
// ================================

module.exports = (server) =>{
  io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // fallback nếu websocket bị block
  pingInterval: 25000, // gửi ping mỗi 25s
  pingTimeout: 60000, // timeout 60s nếu client không phản hồi
  maxHttpBufferSize: 1e7, // 10MB (phòng trường hợp gửi ảnh)
})


// ================================
// 🔐 JWT Authentication Middleware
// ================================
io.use((socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  const token = cookies.token;
  if (!token) {
    console.log("no token")
    return next(new Error("Token Not Found"));
  }
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
  if (disconnectTimers.has(userId)) {
    clearTimeout(disconnectTimers.get(userId));
    disconnectTimers.delete(userId);
    console.log(`✅ User ${userId} đã reconnect trong 5 phút → huỷ offline`);
  }
  console.log(`✅ User connected: ${socket.id} (${userId})`);
  socket.join(userId);

  try {
    const relatedUsers = await updateUserStatusService(userId,'online');
    for (const u of relatedUsers) {
      io.to(u.user_id).emit("user_status_change", { user_id: userId, status: "online" });
    }
  } catch (err) {
    console.error("UPDATE ONLINE ERROR:", err);
  }
  

  // ===========================
  // 📨 Message Sending Handler
  // ===========================
  socket.on("send_message", async (data) => {
    const user = socket.user;
    if (!user) return socket.emit("log", { statusCode: 401, message: "User not found" });
    if (!(data.text || data.attachment_url))
      return socket.emit("log", { statusCode: 400, message: "Message content is null" });

    try {
      const result = await createMessageService(user.id, data);
      socket.emit("receive_message", result); // tự update cho người gửi 
      socket.to(data.conversation_id).emit("receive_message", result); // broadcast tới room để người trong convo được update

      // Cập nhật last_message cho những người k đang trong convo và gửi thông báo 
      const members = await getConversationMembers(user.id, data.conversation_id);
      for (const m of members) {
        if (m.id != user.id)
          io.to(m.id).emit("notification", { ...result, conversation_id: data.conversation_id });
      }

      socket.emit("log", { statusCode: 200, message: "Message sent successfully" });
    } catch (err) {
      console.error("CREATE MESSAGE ERROR:", err);
      socket.emit("log",
        {status :err.status || 500,
         message: err.message || "Internal Server Error" })
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

  if (disconnectTimers.has(userId)) {
    clearTimeout(disconnectTimers.get(userId));
  }
  const timeoutId = setTimeout(async () => {
    try {
      console.log(`🕐 5 phút trôi qua, xác nhận user ${userId} vẫn offline.`);
      const relatedUsers = await updateUserStatusService(userId, "offline");
      for (const u of relatedUsers) {
        io.to(u.user_id).emit("user_status_change", {
          user_id: userId,
          status: "offline",
        });
      }
      disconnectTimers.delete(userId); // dọn sạch
    } catch (err) {
      console.error("UPDATE OFFLINE ERROR:", err);
    }
  }, 5 * 60 * 1000); // 5 phút

  disconnectTimers.set(userId, timeoutId);
  });
});

}
