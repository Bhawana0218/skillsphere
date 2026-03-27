import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    roomId: String,
    messages: [
      {
        sender: String,
        text: String,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);