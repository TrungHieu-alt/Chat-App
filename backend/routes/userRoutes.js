const {verifyToken} = require('../middlewares/verifyToken')
const express = require('express');
const userRouter = express.Router();
const { 
  getUserById,
  updateMyProfile,
  deleteMyAccount,
  getAllOtherUsers,
  getMyConversations,} = require('../controllers/userController')
userRouter.get('/getOtherUsers', verifyToken , getAllOtherUsers);
userRouter.get('/getMyConversations', verifyToken , getMyConversations);
userRouter.put('/update',verifyToken, updateMyProfile);
userRouter.put('/delete', verifyToken, deleteMyAccount); // soft delete



module.exports = userRouter;