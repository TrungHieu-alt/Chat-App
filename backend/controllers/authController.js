// controllers/authController.js
const {
  loginService,
  signupService,
  updatePasswordService,
} = require("../services/authService");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

async function login(req, res) {
  try {
    const { username, password } = req.body;
    const data = await loginService(username, password);
    const token = jwt.sign(
      { id: data.user.id, fullname: data.user.fullname },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.cookie("token", token, {
      httpOnly: true, // không thể đọc qua JS => chống XSS
      secure: process.env.NODE_ENV === "production", // chỉ gửi qua HTTPS
      sameSite: "strict", // tránh CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    res.status(200).json({
      message: "Login successful",
      ...data,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
}

async function signup(req, res) {
  try {
    const data = await signupService(req.body);
    const token = jwt.sign(
      { id: data.user.id, fullname: data.user.fullname },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.cookie("token", token, {
      httpOnly: true, // không thể đọc qua JS => chống XSS
      secure: process.env.NODE_ENV === "production", // chỉ gửi qua HTTPS
      sameSite: "strict", // tránh CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
    });
    res.status(201).json({
      message: "User registered successfully",
      ...data,
    });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
}

async function updatePassword(req, res) {
  try {
    await updatePasswordService(req.user.id, req.body.oldPassword, req.body.newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("UPDATE PASSWORD ERROR:", error);
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal Server Error" });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


module.exports = {
  logout,
  login,
  signup,
  updatePassword,
};
