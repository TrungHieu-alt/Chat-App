const express = require('express');
const cors = require('cors');
// require('dotenv').config();
const {authRouter, conversationRouter, userRouter, messageRouter} = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors()); // accept request from different domain
app.use(express.json()); // allow auto parse json -> object
app.use(express.urlencoded({extended : true})); // allow auto parse request from html form -> object

app.use('/api/auth',authRouter);
app.use('/api/conversation',conversationRouter);
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);
app.get('/',(req,res)=>{
    return res.json("hello world");
});


app.listen(PORT,()=>{console.log(`Server running on  http://localhost:${PORT}/`)});