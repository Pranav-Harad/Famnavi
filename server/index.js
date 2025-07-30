const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");
const db = require("./db");
const authRoutes = require("./routes/auth");
const groupsRoutes = require("./routes/groups");
const locationsRoutes = require("./routes/locations");
const chatRoutes = require("./routes/chat");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/chat", chatRoutes);

// FCM token registration
app.post("/api/notifications/register", async (req, res) => {
  const { userId, fcmToken } = req.body;
  try {
    await db.pool.query(
      "INSERT INTO fcm_tokens (user_id, token) VALUES (?, ?) ON DUPLICATE KEY UPDATE token = ?",
      [userId, fcmToken, fcmToken]
    );
    res.json({ message: "FCM token registered" });
  } catch (error) {
    console.error("Error registering FCM token:", error);
    res.status(500).json({ message: "Server error" });
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_group", (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on("send_message", async (data) => {
    const { groupId, userId, content } = data;
    try {
      const [result] = await db.pool.query(
        "INSERT INTO messages (group_id, user_id, content) VALUES (?, ?, ?)",
        [groupId, userId, content]
      );
      const [message] = await db.pool.query(
        "SELECT m.*, u.fullname FROM messages m JOIN users u ON m.user_id = u.id WHERE m.id = ?",
        [result.insertId]
      );
      io.to(groupId).emit("receive_message", message[0]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  db.connect();
});