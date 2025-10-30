const { uploadMediaService } = require("../services/s3BucketService");

async function uploadMedia(req, res) {
  try {
    const file = req.file;
    const userId = req.user?.id || "guest";

    const media = await uploadMediaService(file, userId);

    res.status(200).json({
      message: "File uploaded successfully",
      data: media,
    });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ error: err.message || "Upload failed" });
  }
}

module.exports = { uploadMedia };
