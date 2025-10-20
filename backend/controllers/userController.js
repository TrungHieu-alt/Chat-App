const bcrypt = require("bcrypt");
const pool = require("../config/pool");

// ========================
// Sử dụng cho trang xem thông tin profile của bản thân và người khác
// ========================
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT id, username, fullname, avatar, bio, role, status, created_at
       FROM users
       WHERE id = ? and deactivated_at is null`,
      [id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


// ========================
// Lấy tất cả user (trừ chính mình và user bị xóa mềm)
// ========================
const getAllOtherUsers = async (req, res) => {
  const user = req.user;
  
  try {
    const [rows] = await pool.query(
      `SELECT id, username, fullname, avatar_url, status
       FROM users
       WHERE deactivated_at IS NULL AND id != ?`,
      [user.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "No other users found" });

    return res.status(200).json(rows);
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


const getMyConversations = async (req, res) => {
  const user = req.user;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.online_count,
        m.id AS last_message_id,
        m.sender_id AS last_message_sender_id,
        m.text AS last_message_text,
        m.created_at AS last_message_time
      FROM conversations c
      JOIN conversation_members mem 
        ON c.id = mem.conversation_id
      LEFT JOIN messages m 
        ON m.id = (
          SELECT id 
          FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      WHERE mem.user_id = ?
      ORDER BY m.created_at DESC;
      `,
      [user.id]
    );

    if (rows.length === 0) {
      await connection.commit();
      return res
        .status(404)
        .json({ message: "No conversations found for this user" });
    }

    for (const convo of rows) {
      const [members] = await connection.query(
        `SELECT user_id FROM conversation_members WHERE conversation_id = ?`,
        [convo.id]
      );
      convo.members = members.map((m) => m.user_id);
    }

    await connection.commit();
    return res.status(200).json(rows);
  } catch (error) {
    await connection.rollback();
    console.error("GET CONVERSATIONS ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};


// ========================
// Chỉnh sửa profile trong cài đặt
// ========================
const updateMyProfile = async (req, res) => {
  const user = req.user;
  const { fullname, bio, email, phonenumber } = req.body;

  try {
    let query = `UPDATE users SET `;
    const values = [];
    const updates = [];
    const updatedFields = {};
    if (fullname) {
      updates.push("fullname = ?");
      values.push(fullname);
      updatedFields.fullname = fullname;
    }


    if (bio) {
      updates.push("bio = ?");
      values.push(bio);
      updatedFields.bio = bio;
    }

    if (email) {
      updates.push("email = ?");
      values.push(email);
      updatedFields.email = email;
    }

    if (phonenumber) {
      updates.push("phonenumber = ?");
      values.push(phonenumber);
      updatedFields.phonenumber = phonenumber;
    }

    if (updates.length === 0)
      return res.status(400).json({ message: "No fields to update" });
    updates.push("updated_at = NOW()");
    query += updates.join(", ") + " WHERE id = ? and deactivated_at is null";
    values.push(user.id);

    await pool.query(query, values);
  

    return res.status(200).json({
       message: "Profile updated successfully",
       user: updatedFields,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// ========================
// Xóa tài khoản của mình 
// ========================
const deleteMyAccount = async (req, res) => {
  const user = req.user;
  const {password} = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT password_hash FROM users WHERE id = ? and deactivated_at is null",
      [user.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const currentHash = rows[0].password_hash;
    const match = await bcrypt.compare(password, currentHash);
    if (!match) {
      await conn.rollback();
      return res.status(401).json({ message: "Incorrect current password" });
    }
    await conn.query(`UPDATE users SET deactivated_at = NOW() WHERE id = ? AND deactivated_at IS NULL`, [user.id]);

    // Optionally: xóa các bảng liên quan nhờ ON DELETE CASCADE
    return res.status(200).json({ message: "Account soft deleted successfully" });
  } catch (error) {
    console.error("SOFT DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
    finally {
    conn.release();
  }
};

module.exports = {
  getUserById,
  updateMyProfile,
  deleteMyAccount,
  getMyConversations,
  getAllOtherUsers
};
