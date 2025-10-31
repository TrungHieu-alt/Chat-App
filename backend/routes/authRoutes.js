const express = require('express');
const authRouter = express.Router();
const {login, signup, updatePassword, logout} = require('../controllers/authController.js');
const { verifyToken } = require('../middlewares/verifyToken.js');
authRouter.post('/login',login);
authRouter.post('/signup',signup);
authRouter.put('/updatePassword', verifyToken,updatePassword);
authRouter.post('/logout',verifyToken, logout)
module.exports = authRouter;