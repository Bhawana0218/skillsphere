import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", default: null },
    filedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    against: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    issueTitle: { type: String, required: true, trim: true, maxlength: 140 },
    category: {
      type: String,
      enum: [
        "payment_not_received",
        "payment_delay",
        "refund_issue",
        "incorrect_amount",
        "unauthorized_charge",
        "other",
      ],
      default: "other",
    },
    description: { type: String, required: true },
    evidence: [{ type: String }], // file URLs
    amountInDispute: { type: Number, default: 0, min: 0 },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["Pending", "In Review", "Resolved", "Rejected"],
      default: "Pending",
    },
    adminMediator: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    adminNotes: { type: String, default: "" },
    resolutionType: {
      type: String,
      enum: ["refund", "partial_refund", "payment_release", "declined", "other", ""],
      default: "",
    },
    resolution: { type: String, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ filedBy: 1, createdAt: -1 });
disputeSchema.index({ against: 1, createdAt: -1 });
disputeSchema.index({ payment: 1, status: 1 });

export default mongoose.model("Dispute", disputeSchema);
