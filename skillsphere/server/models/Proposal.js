import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bidAmount: Number,
    duration: String,
    coverLetter: String,

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export default mongoose.model("Proposal", proposalSchema);