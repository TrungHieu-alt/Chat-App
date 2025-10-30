// controllers/conversationController.js
const {
  createConversationService,
  getConversationMessagesService,
  getConversationByIdService,
  updateConversationNameService,
  deleteConversationService,
} = require("../services/conversationService");

async function createConversation(req, res) {
  const { type, name, members, avatar_url } = req.body;
  const user = req.user;

  if (!name)
    return res.status(400).json({ message: "Chat name is required" });
  if (!["inbox", "group"].includes(type))
    return res.status(400).json({ message: "Invalid conversation type" });
  if (!members || members.length === 0)
    return res.status(400).json({ message: "Members list is required" });

  try {
    const data = await createConversationService(user.id, {
      type,
      name,
      members,
      avatar_url,
    });
    res.status(201).json({
      message: "Conversation created successfully",
      ...data,
    });
  } catch (err) {
    console.error("CREATE CONVERSATION ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function getConversationMessages(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const data = await getConversationMessagesService(user.id, id);
    res.status(200).json({
      message: "Get conversation messages ok",
      ...data,
    });
  } catch (err) {
    console.error("GET CONVERSATION MESSAGES ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function getConversationById(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    const data = await getConversationByIdService(user.id, id);
    res.status(200).json(data);
  } catch (err) {
    console.error("GET CONVERSATION ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function updateConversationName(req, res) {
  const { id } = req.params;
  const user = req.user;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    await updateConversationNameService(user.id, id, name);
    res.status(200).json({ message: "Conversation renamed successfully" });
  } catch (err) {
    console.error("UPDATE CONVERSATION ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function deleteConversation(req, res) {
  const { id } = req.params;
  const user = req.user;
  try {
    await deleteConversationService(user.id, id);
    res.status(200).json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("DELETE CONVERSATION ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = {
  createConversation,
  getConversationById,
  getConversationMessages,
  updateConversationName,
  deleteConversation,
};
