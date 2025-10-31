// services/authService.js
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/pool");
const {normalizeDate} = require("../utils");


async function loginService(username, password) {
  const [rows] = await pool.query(
    "SELECT id, fullname, username, avatar_url, email, bio, phonenumber, created_at, password_hash FROM users WHERE username = ? AND deactivated_at IS NULL",
    [username]
  );

  const user = rows[0];
  if (!user) throw { status: 404, message: "User not found" };

  const success = await bcrypt.compare(password, user.password_hash);
  if (!success) throw { status: 401, message: "Incorrect password" };


  return {
    user: {
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      avatar_url: user.avatar_url,
      email: user.email,
      phonenumber: user.phonenumber,
      bio: user.bio,
      created_at: normalizeDate(user.created_at),
    },
  };
}

async function signupService({ fullname, username, password, phonenumber, avatar_url }) {
  const [existing] = await pool.query(
    "SELECT id FROM users WHERE username = ? AND deactivated_at IS NULL",
    [username]
  );
  if (existing.length > 0) throw { status: 400, message: "Username already exists" };

  const id = uuidv4();
  const password_hash = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (id, fullname, username, password_hash, phonenumber, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
    [id, fullname, username, password_hash, phonenumber || null, avatar_url]
  );

  if (result.affectedRows === 0) throw new Error("Insert failed");


  return {
    user: {
      id,
      username,
      fullname,
      phonenumber,
      avatar_url,
      created_at: normalizeDate(new Date()),
    },
  };
}

async function updatePasswordService(userId, oldPassword, newPassword) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT password_hash FROM users WHERE id = ? AND deactivated_at IS NULL",
      [userId]
    );
    if (rows.length === 0) throw { status: 404, message: "User not found" };

    const match = await bcrypt.compare(oldPassword, rows[0].password_hash);
    if (!match) throw { status: 401, message: "Incorrect current password" };

    const newHash = await bcrypt.hash(newPassword, 10);
    await conn.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [newHash, userId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
module.exports = {
  loginService,
  signupService,
  updatePasswordService,
};
