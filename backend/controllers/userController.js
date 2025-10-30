// controllers/userController.js
const {
  getUserByIdService,
  getAllOtherUsersService,
  getMyConversationsService,
  updateMyProfileService,
  deleteMyAccountService,
} = require("../services/userService");

async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const data = await getUserByIdService(id);
    return res.status(200).json(data);
  } catch (err) {
    console.error("GET USER ERROR:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function getAllOtherUsers(req, res) {
  const user = req.user;
  try {
    const users = await getAllOtherUsersService(user.id);
    if (users.length === 0)
      return res.status(404).json({ message: "No other users found" });
    return res.status(200).json(users);
  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function getMyConversations(req, res) {
  const user = req.user;
  try {
    const conversations = await getMyConversationsService(user.id);
    if (conversations.length === 0)
      return res
          .status(404)
          .json({ message: "No conversations found for this user" });
    
    return res.status(200).json(conversations);
  } catch (err) {
    console.error("GET CONVERSATIONS ERROR:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function updateMyProfile(req, res) {
  const user = req.user;
  try {
    const updated = await updateMyProfileService(user.id, req.body);
    res.status(200).json({
      message: "Profile updated successfully",
      user: updated,
    });
  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

async function deleteMyAccount(req, res) {
  const user = req.user;
  const { password } = req.body;
  if (!password)
    return res.status(400).json({ message: "Password is required" });

  try {
    await deleteMyAccountService(user.id, password);
    return res.status(200).json({ message: "Account soft deleted successfully" });
  } catch (err) {
    console.error("DELETE ACCOUNT ERROR:", err);
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Internal Server Error" });
  }
}

module.exports = {
  getUserById,
  getAllOtherUsers,
  getMyConversations,
  updateMyProfile,
  deleteMyAccount,
};
