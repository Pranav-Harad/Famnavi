const express = require("express");
const router = express.Router();
const { pool } = require("../db");

router.post("/create", async (req, res) => {
  const { userId, joinCode, groupName } = req.body;
  try {
    if (!userId || !joinCode || !groupName) {
      return res.status(400).json({ message: "User ID, join code, and group name are required" });
    }

    const [users] = await pool.query("SELECT id FROM users WHERE id = ?", [userId]);
    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const [existingGroups] = await pool.query("SELECT id FROM `groups` WHERE join_code = ?", [joinCode]);
    if (existingGroups.length > 0) {
      return res.status(400).json({ message: "Join code already in use" });
    }

    const [groupResult] = await pool.query(
      "INSERT INTO `groups` (join_code, group_name, created_by) VALUES (?, ?, ?)",
      [joinCode, groupName, userId]
    );
    const groupId = groupResult.insertId;

    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
      [groupId, userId]
    );

    res.status(201).json({ message: "Group created", groupId });
  } catch (error) {
    console.error("Group creation error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

router.post("/join", async (req, res) => {
  const { userId, joinCode } = req.body;
  try {
    if (!userId || !joinCode) {
      return res.status(400).json({ message: "User ID and join code are required" });
    }

    const [groups] = await pool.query("SELECT id, group_name FROM `groups` WHERE join_code = ?", [joinCode]);
    if (groups.length === 0) {
      return res.status(400).json({ message: "Invalid join code" });
    }

    const groupId = groups[0].id;
    const groupName = groups[0].group_name;

    const [existingMembership] = await pool.query(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );
    if (existingMembership.length > 0) {
      return res.status(400).json({ message: "Already a member of this group" });
    }

    await pool.query(
      "INSERT INTO group_members (group_id, user_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE joined_at = NOW()",
      [groupId, userId]
    );
    res.json({ message: "Joined group successfully", groupName });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

router.get("/members", async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    // Fetch all groups the user has joined
    const [joinedGroups] = await pool.query(
      "SELECT g.id, g.group_name, g.join_code " +
      "FROM `groups` g " +
      "JOIN group_members gm ON g.id = gm.group_id " +
      "WHERE gm.user_id = ?",
      [userId]
    );

    // Fetch members for each group
    const groupsWithMembers = await Promise.all(
      joinedGroups.map(async (group) => {
        const [members] = await pool.query(
          "SELECT u.id, u.fullname, l.latitude, l.longitude " +
          "FROM group_members gm " +
          "JOIN users u ON gm.user_id = u.id " +
          "JOIN locations l ON u.id = l.user_id " +
          "WHERE gm.group_id = ?",
          [group.id]
        );
        const formattedMembers = members.map(m => ({
          id: m.id,
          fullname: m.fullname,
          location: { latitude: m.latitude, longitude: m.longitude }
        }));
        return { ...group, members: formattedMembers };
      })
    );

    res.json(groupsWithMembers);
  } catch (error) {
    console.error("Error fetching group members:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

router.get("/created", async (req, res) => {
  const { userId } = req.query;
  try {
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const [groups] = await pool.query(
      "SELECT id, join_code, group_name FROM `groups` WHERE created_by = ?",
      [userId]
    );
    res.json(groups);
  } catch (error) {
    console.error("Error fetching created groups:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { userId, groupId } = req.body;
  try {
    if (!userId || !groupId) {
      return res.status(400).json({ message: "User ID and group ID are required" });
    }

    // Verify the user is the creator of the group
    const [groups] = await pool.query("SELECT created_by FROM `groups` WHERE id = ?", [groupId]);
    if (groups.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }
    if (groups[0].created_by !== userId) {
      return res.status(403).json({ message: "Only the group creator can delete the group" });
    }

    // Delete group members first (due to foreign key constraints)
    await pool.query("DELETE FROM group_members WHERE group_id = ?", [groupId]);

    // Delete the group
    await pool.query("DELETE FROM `groups` WHERE id = ?", [groupId]);

    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

router.delete("/leave", async (req, res) => {
  const { userId, groupId } = req.body;
  try {
    if (!userId || !groupId) {
      return res.status(400).json({ message: "User ID and group ID are required" });
    }

    // Verify the group exists
    const [groups] = await pool.query("SELECT id FROM `groups` WHERE id = ?", [groupId]);
    if (groups.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    const [membership] = await pool.query(
      "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
      [groupId, userId]
    );
    if (membership.length === 0) {
      return res.status(400).json({ message: "You are not a member of this group" });
    }

    // Remove the user from the group
    await pool.query("DELETE FROM group_members WHERE group_id = ? AND user_id = ?", [groupId, userId]);

    // Check if the group is empty and delete it if so
    const [remainingMembers] = await pool.query("SELECT COUNT(*) as count FROM group_members WHERE group_id = ?", [groupId]);
    if (remainingMembers[0].count === 0) {
      await pool.query("DELETE FROM `groups` WHERE id = ?", [groupId]);
    }

    res.json({ message: "Left group successfully" });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
});

module.exports = router;