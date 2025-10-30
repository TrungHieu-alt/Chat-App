// services/messageService.js
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/pool");
const {uploadMediaService} = require("./s3BucketService")
// 🔹 Lấy tin nhắn theo ID
async function getMessageByIdService(id) {
  const [rows] = await pool.query(
    `SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        u.username AS sender_name,
        u.avatar_url AS sender_avatar,
        m.type,
        m.text,
        m.attachment_url,
        m.attachment_meta,
        m.created_at
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     WHERE m.id = ?`,
    [id]
  );
  if (rows.length === 0) throw { status: 404, message: "Message not found" };
  return rows[0];
}


/**
 * Tạo tin nhắn, có thể kèm file media.
 * @param {string} userId
 * @param {object} data - { conversation_id, text?, type?, file?, attachment_url?, attachment_meta? }
 */
async function createMessageService(userId, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // ✅ Kiểm tra user có trong conversation không
    const [isIn] = await conn.query(
      `SELECT 1 FROM conversation_members WHERE user_id = ? AND conversation_id = ?`,
      [userId, data.conversation_id]
    );
    if (isIn.length === 0) {
      throw { status: 403, message: "User is not in conversation" };
    }

    const id = uuidv4();
    let media = null;

    // ✅ Nếu có file upload thì xử lý qua mediaService (S3 + DB)
    if (data.file) {
      media = await uploadMediaService(data.file, userId, conn);
      data.attachment_url = media.s3_url;
      data.attachment_meta = {
        file_name: media.file_name,
        file_type: data.file.mimetype,
        file_size: data.file.size,
      };
    }

    // ✅ Thêm message vào DB
    await conn.query(
      `INSERT INTO messages 
        (id, conversation_id, sender_id, type, text, attachment_url, attachment_meta)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.conversation_id,
        userId,
        data.type || (media ? "media" : "text"),
        data.text || null,
        data.attachment_url || null,
        JSON.stringify(data.attachment_meta || null),
      ]
    );

    await conn.commit();

  const [rows] = await pool.query(
    `SELECT id, sender_id, created_at, text, attachment_url, attachment_meta, type
    FROM messages WHERE id = ?`,
    [id]
  );

  const message = rows[0];

  if (typeof message.attachment_meta === "string") {
    try {
      message.attachment_meta = JSON.parse(message.attachment_meta);
    } catch {
      message.attachment_meta = null;
    }
  } else {
    message.attachment_meta = null;
  }

return message;
  } catch (err) {
    await conn.rollback();
    console.error("❌ createMessageService error:", err);
    throw err;
  } finally {
    conn.release();
  }
}



  // 🔹 Cập nhật tin nhắn
async function updateMessageByIdService(userId, id, text) {
    const [result] = await pool.query(
      `UPDATE messages 
      SET text = ?, updated_at = NOW()
      WHERE id = ? AND sender_id = ? 
      AND TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 1`,
      [text, id, userId]
    );

    if (result.affectedRows === 0)
      throw { status: 404, message: "Message not found or not owned by user" };

    const [rows] = await pool.query(
      `SELECT m.*, u.username, u.avatar_url
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.id = ?`,
      [id]
    );

    return rows[0];
  }

// 🔹 Xóa tin nhắn
async function deleteMessageByIdService(userId, id) {
  const [result] = await pool.query(
    `DELETE FROM messages WHERE id = ? AND sender_id = ?`,
    [id, userId]
  );

  if (result.affectedRows === 0)
    throw { status: 404, message: "Message not found or not owned by user" };
}

module.exports = {
  getMessageByIdService,
  createMessageService,
  updateMessageByIdService,
  deleteMessageByIdService,
};
