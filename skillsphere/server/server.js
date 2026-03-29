// server.js

import "./config/env.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import cors from "cors";
import { Server } from "socket.io";


import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import clientProjects from './routes/clientProjects.js';
import freelancerRoutes from './routes/freelancerRoutes.js';

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
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use('/api/client/projects', clientProjects);
app.use('/api/freelancer', freelancerRoutes);


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

   // Notification Functionality
  // -----------------------------
  // Each user has a private notification room
  socket.on("joinUser", (userId) => {
    socket.join(userId); 
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  });

  socket.on("sendNotification", async ({ userId, type, message, link }) => {
    try {
      // Save notification in DB (implement createNotification function)
      const notif = await createNotification(userId, type, message, link);

      // Emit notification to the specific user
      io.to(userId).emit("receiveNotification", notif);
    } catch (error) {
      console.error("Notification error:", error);
    }
  });


  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

export { io };