// services/conversationService.js
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/pool");

async function createConversationService(userId, { type, name, members, avatar_url }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const conversationId = uuidv4();
    await conn.query(
      `INSERT INTO conversations (id, type, name, avatar_url, created_by)
       VALUES (?, ?, ?, ?, ?)`,
      [conversationId, type, name, avatar_url || null, userId]
    );

    await conn.query(
      `INSERT INTO conversation_members (conversation_id, user_id, role)
       VALUES (?, ?, 'admin')`,
      [conversationId, userId]
    );

    if (members?.length) {
      const memberValues = members.map((uid) => [conversationId, uid]);
      await conn.query(
        `INSERT INTO conversation_members (conversation_id, user_id) VALUES ?`,
        [memberValues]
      );
    }

    await conn.commit();
    return { conversation_id: conversationId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getConversationMembers(userId ,conversationId) {
  const [check] = await pool.query(
    `SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
    [conversationId, userId]
  );
  if (check.length === 0) throw { status: 403, message: "Access denied" };

  const [members] = await pool.query(
    `SELECT u.id, u.fullname, u.avatar_url, cm.role
     FROM conversation_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.conversation_id = ?`,
    [conversationId]
  );

  return members;
}

async function getConversationMessagesService(userId, conversationId) {
  // ✅ Kiểm tra user có thuộc cuộc trò chuyện không
  const [check] = await pool.query(
    `SELECT 1 FROM conversation_members 
     WHERE conversation_id = ? AND user_id = ?`,
    [conversationId, userId]
  );
  if (check.length === 0) throw { status: 403, message: "Access denied" };

  // ✅ Lấy toàn bộ tin nhắn (bao gồm text + media)
  const [messages] = await pool.query(
    `SELECT 
        id,
        sender_id,
        type,
        text,
        attachment_url,
        attachment_meta,
        created_at
     FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC`,
    [conversationId]
  );

  // ✅ Parse JSON metadata (tránh lỗi null hoặc string)
  for (const msg of messages) {
    try {
      msg.attachment_meta = msg.attachment_meta
        ? JSON.parse(msg.attachment_meta)
        : null;
    } catch {
      msg.attachment_meta = null;
    }
  }

  // ✅ Lấy danh sách thành viên (để FE tự join)
  const [members] = await pool.query(
    `SELECT 
        u.id, u.fullname, u.avatar_url, cm.role
     FROM conversation_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.conversation_id = ?`,
    [conversationId]
  );

  return { members, messages };
}


async function getConversationByIdService(userId, conversationId) {
  const [check] = await pool.query(
    `SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?`,
    [conversationId, userId]
  );
  if (check.length === 0) throw { status: 403, message: "User not in conversation" };

  const [conv] = await pool.query(
    `SELECT c.*, u.username AS created_by_name
     FROM conversations c
     JOIN users u ON u.id = c.created_by
     WHERE c.id = ?`,
    [conversationId]
  );

  const [members] = await pool.query(
    `SELECT u.id, u.username, u.avatar_url
     FROM conversation_members cm
     JOIN users u ON cm.user_id = u.id
     WHERE cm.conversation_id = ?`,
    [conversationId]
  );

  return { conversation: conv[0], members };
}

async function updateConversationNameService(userId, conversationId, name) {
  const [result] = await pool.query(
    `UPDATE conversations
     SET name = ?
     WHERE id = ? AND created_by = ?`,
    [name, conversationId, userId]
  );

  if (result.affectedRows === 0)
    throw { status: 403, message: "Forbidden or not found" };
}

async function deleteConversationService(userId, conversationId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [check] = await conn.query(
      `SELECT 1 FROM conversations WHERE id = ? AND created_by = ?`,
      [conversationId, userId]
    );
    if (check.length === 0)
      throw { status: 403, message: "You cannot delete this conversation" };

    await conn.query(
      `DELETE FROM conversation_members WHERE conversation_id = ?`,
      [conversationId]
    );
    await conn.query(`DELETE FROM conversations WHERE id = ?`, [conversationId]);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = {
  createConversationService,
  getConversationMessagesService,
  getConversationByIdService,
  updateConversationNameService,
  deleteConversationService,
  getConversationMembers,
};
