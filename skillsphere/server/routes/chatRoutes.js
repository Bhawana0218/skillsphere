import express from "express";
import Chat from "../models/Chat.js";

const router = express.Router();

// Get chat history for a specific room
router.get("/:roomId", async (req, res) => {
  try {
    const roomId = req.params.roomId;
    let chat = await Chat.findOne({ roomId });
    if (!chat) {
      chat = await Chat.create({ roomId, messages: [] });
    }
    res.json({ roomId, messages: chat.messages });
  } catch (error) {
    console.error("Chat history error:", error);
    res.status(500).json({ message: "Unable to load chat history" });
  }
});

// List recent chat rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Chat.find().sort({ updatedAt: -1 }).limit(50);
    res.json(rooms);
  } catch (error) {
    console.error("Chat rooms error:", error);
    res.status(500).json({ message: "Unable to load chat rooms" });
  }
});

export default router;
