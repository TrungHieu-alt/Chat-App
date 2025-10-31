const express = require('express');
const cors = require('cors');
const http = require('http');

const cookieParser = require("cookie-parser");
// require('dotenv').config();
const {authRouter, conversationRouter, userRouter, messageRouter, s3Router} = require('./routes/index');
const app = express();
const PORT = process.env.PORT || 5000;
const InitSocket = require("./socketServer.js");

app.use(cors({origin: process.env.CLIENT_URL, credentials: true})); // accept request from different domain
app.use(express.json()); // allow auto parse json -> object
app.use(express.urlencoded({extended : true})); // allow auto parse request from html form -> object
app.use(cookieParser());


app.use('/api/auth',authRouter);
app.use('/api/conversation',conversationRouter);
app.use('/api/user', userRouter);
app.use('/api/message', messageRouter);
app.use('/api/s3', s3Router)
app.get('/',(req,res)=>{
    return res.json("hello world");
});

const server = http.createServer(app);
InitSocket(server);
server.listen(PORT,"0.0.0.0",()=>{console.log(`Server running on  http://localhost:${PORT}/`)});