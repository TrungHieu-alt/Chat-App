// controllers/messageController.js
const {
  getMessageByIdService,
  createMessageService,
  updateMessageByIdService,
  deleteMessageByIdService,
} = require("../services/messageService");

async function getMessageById(req, res) {
  const { id } = req.params;
  if (!id) return res.status(400).json({ message: "Missing message id" });

  try {
    const data = await getMessageByIdService(id);
    res.status(200).json({ data });
  } catch (err) {
    console.error("GET MESSAGE ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function createMessage(req, res) {
  const user = req.user;
  const data = req.body;

  if (!user) return res.status(401).json({ message: "User not found" });
  if (!(data.text || data.attachment_url))
    return res.status(400).json({ message: "Message content is null" });

  try {
    const result = await createMessageService(user.id, data);
    res.status(201).json({
      message: "Message created successfully",
      data: result,
    });
  } catch (err) {
    console.error("CREATE MESSAGE ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function updateMessageById(req, res) {
  const { id } = req.params;
  const user = req.user;
  const { text } = req.body;

  if (!id) return res.status(400).json({ message: "Missing message id" });
  if (!text)
    return res.status(400).json({ message: "New text content is required" });

  try {
    const updated = await updateMessageByIdService(user.id, id, text);
    res.status(200).json({
      message: "Message updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("UPDATE MESSAGE ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function deleteMessageById(req, res) {
  const { id } = req.params;
  const user = req.user;

  if (!id) return res.status(400).json({ message: "Missing message id" });

  try {
    await deleteMessageByIdService(user.id, id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = {
  getMessageById,
  createMessage,
  updateMessageById,
  deleteMessageById,
};
