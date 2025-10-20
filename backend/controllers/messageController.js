
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/pool');

//Xem tin nhắn
const getMessageById = async (req, res) => {
    const { id } = req.params; // lấy id từ URL, ví dụ /messages/:id

    if (!id) {
        return res.status(400).json({ message: "Missing message id" });
    }

    try {
        // Truy vấn message + thông tin người gửi
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

        if (rows.length === 0) {
        return res.status(404).json({ message: "Message not found" });
        }

        return res.status(200).json({ data: rows[0] });
    } catch (error) {
        console.error("GET MESSAGE ERROR:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Nhắn tin
const createMessage = async (req,res) => {
    const conn = await pool.getConnection();
    const user = req.user;
    if(!user) {
        return res.status(401).json({message : "User not found"})
    }

    
    const data = req.body;
    
    if (!(data.text || data.attachment_url)) {
        return res.status(400).json({message : "message content is null"})
    }


    try {
        await conn.beginTransaction();
        const [isIn] = await conn.query(
            `Select 1 from conversation_members where user_id = ? AND conversation_id = ?`,[user.id, data.conversation_id]
        )
        if(isIn.length === 0) {
            await conn.rollback();
            conn.release(); 
            return res.status(403).json({message:"User is not in conversation"})
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


            // ✅ trả lại tin nhắn vừa tạo (để frontend hiển thị luôn)
            const [rows] = await pool.query(
                `SELECT m.id, m.sender_id, m.created_at, m.text
                FROM messages m
                WHERE m.id = ?`,
                [id]
            );
        return res.status(201).json({
            message: "Message created successfully",
            data: rows[0],
        });
    } catch (error) {
        console.error("ERROR when create message:", error);
        await conn.rollback();
        return res.status(500).json({ message: "Internal Server Error" });
    } finally {
        conn.release();
    }

}

// Chỉnh sửa tin nhắn
const updateMessageById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { text } = req.body;

  // Kiểm tra input
  if (!id) return res.status(400).json({ message: "Missing target message id" });
  if (!text) return res.status(400).json({ message: "New text content is required" });

  try {
    // Chỉ cho phép update tin của chính mình
    const [result] = await pool.query(
      `UPDATE messages 
       SET text = ?, updated_at = NOW() 
       WHERE id = ? AND sender_id = ?  AND TIMESTAMPDIFF(HOUR, created_at, NOW()) <= 1;`,
      [text, id, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found or not owned by user" });
    }

    // Lấy lại message đã cập nhật (trả cho frontend)
    const [rows] = await pool.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [id]
    );

    return res.status(200).json({
      message: "Message updated successfully",
      data: rows[0],
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Thu Hồi tin nhắn 
const deleteMessageById = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!id) return res.status(400).json({ message: "Missing message id" });

  try {
    // Chỉ xóa tin nhắn của chính user
    const [result] = await pool.query(
      `DELETE FROM messages WHERE id = ? AND sender_id = ?`,
      [id, user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Message not found or not owned by user" });
    }

    return res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getMessageById, createMessage, updateMessageById, deleteMessageById };
