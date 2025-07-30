const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.get("/messages", async (req, res) => {
  const { groupId } = req.query;
  try {
    if (!groupId) return res.status(400).json({ message: "Group ID is required" });

    const [messages] = await pool.query(
      "SELECT m.*, u.fullname FROM messages m JOIN users u ON m.user_id = u.id WHERE m.group_id = ? ORDER BY m.sent_at ASC",
      [groupId]
    );
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

module.exports = router;