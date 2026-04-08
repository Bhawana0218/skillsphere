import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
    },
    milestoneTitle: String,
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "INR",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "failed"],
      default: "pending",
    },
    channel: {
      type: String,
      enum: ["razorpay", "manual"],
      default: "razorpay",
    },
    transactionType: {
      type: String,
      enum: ["escrow", "milestone", "payout", "refund"],
      required: true,
    },
    description: String,
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    refundReason: String,
    refundAmount: Number,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);