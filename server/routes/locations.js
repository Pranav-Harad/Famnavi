const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.post("/update", async (req, res) => {
  const { userId, latitude, longitude } = req.body;
  try {
    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "User ID, latitude, and longitude are required" });
    }

    // Validate user exists
    const [users] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    await pool.query(
      "INSERT INTO locations (user_id, latitude, longitude, updated_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE latitude = ?, longitude = ?, updated_at = NOW()",
      [userId, latitude, longitude, latitude, longitude]
    );
    res.json({ message: "Location updated" });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

module.exports = router;