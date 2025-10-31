const fs = require("fs");
const path = require("path");
const pool = require("../config/pool");
const s3 = require("../config/s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");

async function uploadMediaService(file, userId) {
  if (!file) throw new Error("No file uploaded");
  if (!userId) throw new Error("Missing user id");

  // Tạo key lưu file trên S3
  const fileKey = `uploads/${userId}/${Date.now()}_${path.basename(file.originalname)}`;

  // Lệnh upload file
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: fs.createReadStream(file.path),
    ContentType: file.mimetype,
    // ACL: "public-read",
  });

  // Thực hiện upload
  await s3.send(command);

  // Xoá file tạm
  fs.unlinkSync(file.path);

  // Tự dựng URL
  const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

  // Lưu metadata vào DB
  const id = uuidv4();
  const insertQuery = `
    INSERT INTO media_files (id, user_id, file_name, file_type, file_size, s3_key, s3_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  await pool.query(insertQuery, [
    id,
    userId,
    file.originalname,
    file.mimetype,
    file.size,
    fileKey,
    fileUrl,
  ]);

  return {
    id,
    file_name: file.originalname,
    file_type: file.mimetype,
    file_size: file.size,
    s3_key: fileKey,
    s3_url: fileUrl,
  };
}

module.exports = { uploadMediaService };
