const {verifyToken} = require('../middlewares/verifyToken')
const express = require('express');
const conversationRouter = express.Router();
const {createConversation,getConversationById,updateConversationName,deleteConversation, getConversationMessages} = require('../controllers/conversationController');
const { getMyConversations } = require('../controllers/userController');
conversationRouter.post('/createNewConversation', verifyToken, createConversation);
conversationRouter.get('/getMyConversations', verifyToken , getMyConversations);
conversationRouter.get('/getConversationMessages/:id', verifyToken , getConversationMessages);

conversationRouter.put('/update',verifyToken, updateConversationName);
conversationRouter.delete('/delete', verifyToken, deleteConversation);


module.exports = conversationRouter;