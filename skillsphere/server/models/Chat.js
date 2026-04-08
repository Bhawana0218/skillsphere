import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, unique: true },
    messages: [
      {
        sender: { type: String, required: true },
        text: { type: String, default: "" },
        type: { type: String, enum: ["text", "file"], default: "text" },
        fileName: String,
        fileType: String,
        fileUrl: String,
        timestamp: { type: Date, default: Date.now },
        readBy: { type: [String], default: [] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);