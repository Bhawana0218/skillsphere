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
  applications: { type: Number, default: 0 }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
