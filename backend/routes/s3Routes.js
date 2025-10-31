const express = require('express');
const s3Router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken.js');
const { uploadMedia } = require('../controllers/s3BucketController.js');
const upload = require("../middlewares/upload.js")

s3Router.post('/upload',verifyToken, upload.single("file"), uploadMedia)
module.exports = s3Router;