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
      enum: ["active", "closed", "pending"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);