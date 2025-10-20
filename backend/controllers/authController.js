
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/pool');
const jwt = require('jsonwebtoken');



const JWT_SECRET = process.env.JWT_SECRET;

const normalizeDate = (iso) =>{
    const date = new Date(iso);

    const formatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    });

    return formatted;
} 

const login = async (req,res) => {
    try {
        const {username, password} = req.body;
        const [rows] = await pool.query('SELECT id, fullname, username, avatar_url, email, bio, phonenumber, created_at , password_hash FROM users WHERE username = ? and deactivated_at is null', [username]);
        const user = rows[0];
        if(!user) return res.status(404).json({message: "User not found"});

        const success = await bcrypt.compare(password, user.password_hash);
        if(success) {

                const created_at = normalizeDate(user.created_at);
                const token = jwt.sign(
                { id: user.id, fullname: user.fullname }, 
                JWT_SECRET,                               
                { expiresIn: '2h' }                       
                );
            return res.status(200).json({
                message : "Logic sucessfully",
                token,
                user : {
                    fullname: user.fullname,
                    username,
                    avatar_url: user.avatar_url,
                    email: user.email,
                    phonenumber: user.phonenumber,
                    bio: user.bio,
                    created_at,
                    id: user.id
                },
            });
        }
        else {
            return res.status(401).json({message: "Incorrect password"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
}

const signup = async (req,res) => {
    try {    
        const {fullname ,username, password, phonenumber, avatar_url} = req.body;
        const [existing] = await pool.query("SELECT id from users where username = ? and deactivated_at is null",[username]);
        if(existing.length > 0) {
            return res.status(400).json({message : "Username already exists"})
        }
        
        const id = uuidv4();
        const password_hash = await bcrypt.hash(password,10);

        const [result] = await pool.query("INSERT INTO users (id, fullname, username, password_hash, phonenumber, avatar_url) VALUES (?, ?, ?, ?, ?, ?)",
            [id, fullname, username, password_hash, phonenumber || null, avatar_url]
        )
        if (result.affectedRows === 0) throw new Error('Insert failed');
        console.log('insert OK')

        const today = new Date();
        const options = { month: "long", day: "numeric", year: "numeric" };
        const created_at = today.toLocaleDateString("en-US", options);


        const token = jwt.sign(
        { id, fullname}, 
        JWT_SECRET,                               
        { expiresIn: '15m' }                       
        );
        return res.status(201).json({
            message: 'User registered successfully',
            id,
            user:{
                username,
                fullname,
                phonenumber,
                avatar_url: avatar_url,
                created_at
            },
            token,   
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

const updatePassword = async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT password_hash FROM users WHERE id = ? and deactivated_at is null ",
      [user.id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    const currentHash = rows[0].password_hash;
    const match = await bcrypt.compare(oldPassword, currentHash);
    if (!match) {
      await conn.rollback();
      return res.status(401).json({ message: "Incorrect current password" });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await conn.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [newHash, user.id]
    );

    await conn.commit();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("UPDATE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  } finally {
    conn.release();
  }
};


module.exports  = {login, signup, updatePassword};