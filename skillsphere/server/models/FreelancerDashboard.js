import mongoose from "mongoose";

const freelancerDashboardSchema = new mongoose.Schema(
  {
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Freelancer",
      required: true,
      unique: true
    },
    profileCompletion: {
      current: { type: Number, min: 0, max: 100, default: 0 },
      target: { type: Number, default: 100 },
      steps: [{
        name: { type: String, required: true },
        completed: { type: Boolean, default: false }
      }]
    },
    earningsProgress: {
      current: { type: Number, default: 0 },
      goal: { type: Number, default: 50000 },
      monthly: [{
        month: { type: String, required: true },
        amount: { type: Number, default: 0 },
        projected: { type: Number, default: 0 }
      }]
    },
    jobs: {
      completed: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
      successRate: { type: Number, min: 0, max: 100, default: 0 }
    },
    skills: {
      total: { type: Number, default: 0 },
      avgProficiency: { type: Number, min: 0, max: 100, default: 0 },
      topSkills: [{
        name: { type: String, required: true },
        level: { type: Number, min: 0, max: 100, required: true },
        trend: { type: String, enum: ['up', 'stable', 'down'], default: 'stable' }
      }]
    },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for efficient queries
freelancerDashboardSchema.index({ lastUpdated: -1 });

export default mongoose.model("FreelancerDashboard", freelancerDashboardSchema);