import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  freelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job"
  },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "completed"
  }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);