import mongoose from 'mongoose';
const { Schema } = mongoose;

const FreelancerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  bio: { type: String, required: true, maxlength: 1000 },
  hourlyRate: { type: Number, min: 0 },
  location: { type: String, trim: true },
  photoUrl: String,
  
  skills: [{
    name: { type: String, required: true, trim: true },
    proficiency: { type: Number, min: 0, max: 100, default: 50 }
  }],
  
  portfolio: [{
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    projectUrl: String
  }],
  
  resumeUrl: String,
  availability: { 
    type: String, 
    enum: ['full-time', 'part-time', 'contract'],
    default: 'full-time'
  },
  
  stats: {
    earnings: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    activeProposals: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 },
    responseTime: { type: String, default: '0h' }
  },
  
  revenueDistribution: [{
    category: { type: String, required: true },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    amount: { type: Number, default: 0 }
  }],
  
  isVerified: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for faster queries
FreelancerSchema.index({ 'stats.rating': -1 });
FreelancerSchema.index({ location: 1, 'stats.earnings': -1 });

export default mongoose.model("Freelancer", FreelancerSchema);