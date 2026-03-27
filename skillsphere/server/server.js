// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SkillSphere API Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/payments", paymentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
const serverInstance = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

//  SOCKET.IO SETUP 
const io = new Server(serverInstance, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Socket events
io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  // Join a chat room
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Send message
  socket.on("sendMessage", ({ roomId, message, sender }) => {
    io.to(roomId).emit("receiveMessage", {
      message,
      sender,
      timestamp: new Date(),
    });
  });

  socket.on("typing", ({ roomId, sender }) => {
    socket.to(roomId).emit("typing", { sender });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

export { io };