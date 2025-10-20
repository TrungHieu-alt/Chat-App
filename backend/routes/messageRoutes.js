const express = require('express');
const messageRouter = express.Router();
const { createMessage } = require('../controllers/messageController.js');
const { verifyToken } = require('../middlewares/verifyToken.js');
messageRouter.post('/createMessage',verifyToken, createMessage);
// messageRouter.post('/signup',signup);
// messageRouter.put('/updatePassword', verifyToken,updatePassword);

module.exports = messageRouter;