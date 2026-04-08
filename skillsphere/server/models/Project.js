// models/Project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  category: { type: String, default: 'General' },
  applications: { type: Number, default: 0 },
  attachments: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  invitedFreelancers: [
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      invitedAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'invited', 'accepted'], default: 'pending' },
    },
  ],
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
