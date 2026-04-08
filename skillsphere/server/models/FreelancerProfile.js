import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  proficiency: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  endorsements: {
    type: Number,
    default: 0,
  },
  yearsExperience: {
    type: Number,
    default: 0,
  },
});

const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  duration: String,
  description: String,
  isCurrently: {
    type: Boolean,
    default: false,
  },
});

const portfolioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  imageUrl: String,
  projectUrl: String,
  technologies: [String],
});

const certificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  issuer: String,
  issueDate: Date,
  expiryDate: Date,
  credentialUrl: String,
  credentialId: String,
  verified: {
    type: Boolean,
    default: false,
  },
});

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  },
  startTime: String,
  endTime: String,
  available: {
    type: Boolean,
    default: true,
  },
});

const pricingSchema = new mongoose.Schema({
  hourlyRate: Number,
  minimumHours: Number,
  fixedProjectRate: Boolean,
  projectRateMin: Number,
  projectRateMax: Number,
  milestonePayment: Boolean,
});

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: String,
    title: String,
    bio: String,
    location: String,
    hourlyRate: {
      type: Number,
      min: 0,
    },
    skills: [skillSchema],
    experience: [experienceSchema],
    portfolio: [portfolioSchema],
    certifications: [certificationSchema],
    availability: [availabilitySchema],
    pricing: pricingSchema,
    resumeUrl: String,
    profileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const FreelancerProfile =
  mongoose.models.FreelancerProfile ||
  mongoose.model("FreelancerProfile", profileSchema, "freelancerprofiles");

export default FreelancerProfile;

