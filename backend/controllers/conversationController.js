const { v4: uuidv4 } = require("uuid");
const pool = require("../config/pool");

const createConversation = async (req, res) => {
  const user = req.user;
  const { type, name, members, avatar_url } = req.body;

  if (!name) return res.status(400).json({ message: "Chat name is required" });
  if (!["inbox", "group"].includes(type))
    return res.status(400).json({ message: "Invalid conversation type" });
  if (!members || members.length === 0)
    return res.status(400).json({ message: "Members list is required" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const conversationId = uuidv4();

    await conn.query(
      `INSERT INTO conversations (id, type, name, avatar_url, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [conversationId, type, name, avatar_url || null, user.id]
    );


    await conn.query(
      `INSERT INTO conversation_members (conversation_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [conversationId, user.id]
    );
    const memberValues = members.map((uid) => [conversationId, uid]);
    await conn.query(
      `INSERT INTO conversation_members (conversation_id, user_id) VALUES ?`,
      [memberValues]
    );

    await conn.commit();

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation_id: conversationId,
    });
  } catch (error) {
    await conn.rollback();
    console.error("CREATE CONVERSATION ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    conn.release();
  }
};


  const getConversationMessages = async (req, res) =>{
    const { id } = req.params;
    const user = req.user
    console.log
    try {
      const [check] = await pool.query(
        `SELECT 1 FROM conversation_members 
        WHERE conversation_id = ? AND user_id = ?`,
        [id, user.id]
      );
      if (check.length === 0)
        return res.status(403).json({ message: "Access denied" });

      // 2️⃣ Lấy tin nhắn
      const [rows] = await pool.query(
        `SELECT m.id, m.text, m.sender_id, m.created_at
        FROM messages m
        WHERE m.conversation_id = ?
        ORDER BY m.created_at ASC`,
        [id]
      );

      const [members] = await pool.query(
        `SELECT u.id, u.fullname, u.avatar_url, cm.role
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = ?`,
        [id]
      );  
      if (members.length === 0)
        return res.status(403).json({ message: "Failed when get members" });

      return res.status(200).json({
        message: "get conversation messages ok",
        members,
        messages: rows,
      })


    } catch (e) {
      console.error("GET CONVERSATION MESSAGES ERROR:", e);
      return res.status(500).json({ message: "Internal Server Error" });
    }

  }

const getConversationById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
 

  try {
    // Kiểm tra user có trong hội thoại không
    const [check] = await pool.query(
      `SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
      [id, user.id]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: "User not in conversation" });
    }

    const [conv] = await pool.query(
      `SELECT c.*, u.username AS created_by_name
       FROM conversations c
       JOIN users u ON u.id = c.created_by
       WHERE c.id = ?`,
      [id]
    );

    const [members] = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM conversation_members cm
       JOIN users u ON cm.user_id = u.id
       WHERE cm.conversation_id = ?`,
      [id]
    );

    return res.status(200).json({
      conversation: conv[0],
      members,
    });
  } catch (error) {
    console.error("GET CONVERSATION ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========================
// UPDATE conversation name
// ========================
const updateConversationName = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const [result] = await pool.query(
      `UPDATE conversations
       SET name = ?
       WHERE id = ? AND created_by = ?`,
      [name, id, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Forbidden or not found" });
    }

    return res.status(200).json({ message: "Conversation renamed successfully" });
  } catch (error) {
    console.error("UPDATE CONVERSATION ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========================
// DELETE conversation
// ========================
const deleteConversation = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Chỉ người tạo được xóa
    const [check] = await conn.query(
      `SELECT 1 FROM conversations WHERE id = ? AND created_by = ?`,
      [id, user.id]
    );

    if (check.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(403).json({ message: "You cannot delete this conversation" });
    }

    await conn.query(`DELETE FROM conversation_members WHERE conversation_id = ?`, [id]);
    await conn.query(`DELETE FROM conversations WHERE id = ?`, [id]);

    await conn.commit();

    return res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("DELETE CONVERSATION ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    conn.release();
  }
};

module.exports = {
  createConversation,
  getConversationById,
  getConversationMessages,
  updateConversationName,
  deleteConversation,
};
