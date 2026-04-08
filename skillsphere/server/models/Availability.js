import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    isBooked: { type: Boolean, default: false },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", default: null },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bookedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

availabilitySchema.index({ freelancer: 1, startTime: 1, endTime: 1 });
availabilitySchema.index({ freelancer: 1, isBooked: 1, startTime: 1 });

export default mongoose.model("Availability", availabilitySchema);
