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
      enum: ["open", "closed"],
      default: "open",
    },
    adminApproved: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
     type: Boolean,
     default: false,
     }
  },
  { timestamps: true }
);

export default mongoose.model("Job", jobSchema);