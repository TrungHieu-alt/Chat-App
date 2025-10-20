const express = require('express');
const authRouter = express.Router();
const {login, signup, updatePassword} = require('../controllers/authController.js');
const { verifyToken } = require('../middlewares/verifyToken.js');
authRouter.post('/login',login);
authRouter.post('/signup',signup);
authRouter.put('/updatePassword', verifyToken,updatePassword);

module.exports = authRouter;