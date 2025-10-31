// services/userService.js
const bcrypt = require("bcrypt");
const pool = require("../config/pool");

// ========================
// Lấy thông tin user theo ID
// ========================
async function getUserByIdService(id) {
  const [rows] = await pool.query(
    `SELECT id, username, fullname, avatar, bio, role, status, created_at
     FROM users
     WHERE id = ? AND deactivated_at IS NULL`,
    [id]
  );
  if (rows.length === 0) throw { status: 404, message: "User not found" };
  return rows[0];
}

// ========================
// Lấy danh sách tất cả user khác (trừ chính mình)
// ========================
async function getAllOtherUsersService(userId) {
  const [rows] = await pool.query(
    `SELECT id, username, fullname, avatar_url, status
     FROM users
     WHERE deactivated_at IS NULL AND id != ?`,
    [userId]
  );
  return rows;
}

// ========================
// Lấy danh sách hội thoại của user
// ========================
async function getMyConversationsService(userId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
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
      JOIN conversation_members mem ON c.id = mem.conversation_id
      LEFT JOIN messages m 
        ON m.id = (
          SELECT id FROM messages 
          WHERE conversation_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
      WHERE mem.user_id = ?
      ORDER BY m.created_at DESC;
      `,
      [userId]
    );

    for (const convo of rows) {
      const [members] = await conn.query(
        `SELECT user_id FROM conversation_members WHERE conversation_id = ?`,
        [convo.id]
      );
      convo.members = members.map((m) => m.user_id);
    }

    await conn.commit();
    return rows;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// ========================
// Cập nhật thông tin cá nhân
// ========================
async function updateMyProfileService(userId, data) {
  const { fullname, bio, email, phonenumber } = data;

  let query = `UPDATE users SET `;
  const values = [];
  const updates = [];

  if (fullname) {
    updates.push("fullname = ?");
    values.push(fullname);
  }
  if (bio) {
    updates.push("bio = ?");
    values.push(bio);
  }
  if (email) {
    updates.push("email = ?");
    values.push(email);
  }
  if (phonenumber) {
    updates.push("phonenumber = ?");
    values.push(phonenumber);
  }

  if (updates.length === 0)
    throw { status: 400, message: "No fields to update" };

  updates.push("updated_at = NOW()");
  query += updates.join(", ") + " WHERE id = ? AND deactivated_at IS NULL";
  values.push(userId);

  await pool.query(query, values);
  return { fullname, bio, email, phonenumber };
}

// ========================
// Xóa mềm tài khoản (soft delete)
// ========================
async function deleteMyAccountService(userId, password) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT password_hash FROM users WHERE id = ? AND deactivated_at IS NULL`,
      [userId]
    );
    if (rows.length === 0) throw { status: 404, message: "User not found" };

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) throw { status: 401, message: "Incorrect current password" };

    await conn.query(
      `UPDATE users SET deactivated_at = NOW() WHERE id = ? AND deactivated_at IS NULL`,
      [userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

const updateUserStatusService = async (userId, status) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("UPDATE users SET status = ? WHERE id = ?", [status, userId]);
      await conn.commit();

      const [relatedUsers] = await conn.query(`
        SELECT DISTINCT cm2.user_id
        FROM conversation_members cm1
        JOIN conversation_members cm2 
          ON cm1.conversation_id = cm2.conversation_id
        WHERE cm1.user_id = ?;
      `, [userId]);
      return relatedUsers;
    }  catch (err) {
        await conn.rollback();
        throw err;
    } finally {
      conn.release();
    }
}

module.exports = {
  getUserByIdService,
  getAllOtherUsersService,
  getMyConversationsService,
  updateMyProfileService,
  deleteMyAccountService,
  updateUserStatusService,
};
