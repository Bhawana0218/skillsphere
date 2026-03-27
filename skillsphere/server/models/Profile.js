import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bio: String,
    skills: [
      {
        name: String,
        level: {
          type: String,
          enum: ["Beginner", "Intermediate", "Expert"],
        },
      },
    ],
    hourlyRate: Number,
    experience: [
      {
        title: String,
        company: String,
        years: String,
      },
    ],
    portfolio: [String], // image URLs
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);