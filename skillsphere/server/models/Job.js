import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    skillsRequired: [String],
    budget: Number,
    deadline: Date,

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);