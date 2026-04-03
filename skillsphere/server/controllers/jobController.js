import Job from "../models/Job.js";
import mongoose from "mongoose";
import Proposal from "../models/Proposal.js";

// CREATE JOB
export const createJob = async (req, res) => {
  try {
    const { title, description, skillsRequired, budget, deadline } = req.body;

   
    const job = await Job.create({
      title,
      description,
      skillsRequired,
      budget,
      deadline,
      client: req.user._id,
      postedBy: req.user._id,
      status: "open",      
      isDeleted: false
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET ALL JOBS
export const getJobs = async (req, res) => {
  const jobs = await Job.find({ isDeleted: false }).populate("client", "name");
  res.json(jobs);
};


export const getJobById = async (req, res) => {
  const { id } = req.params;

  // Prevent crash
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Job ID" });
  }

  try {
    const job = await Job.findById(id);

    if (!job) return res.status(404).json({ message: "Job not found" });

     const proposalCount = await Proposal.countDocuments({
      jobId: job._id,
    });

    res.json({
      ...job.toObject(),
      proposalCount,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const getLatestJob = async (req, res) => {
  try {
    const job = await Job.findOne().sort({ createdAt: -1 });

    if (!job) {
      return res.status(404).json({ message: "No jobs found" });
    }

    res.json(job);
  } catch (error) {
    console.error("Error fetching latest job:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const searchJobs = async (req, res) => {
  try {
    const { keyword, minBudget, maxBudget, skills, sortBy, status } = req.query;

    let query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (skills) {
      query.skillsRequired = {
        $in: skills.split(",").map(s => new RegExp(s.trim(), "i"))
      };
    }

    if (status) {
      query.status = status;
    }

    let jobsQuery = Job.find(query);

    if (sortBy === "newest") jobsQuery = jobsQuery.sort({ createdAt: -1 });
    else if (sortBy === "oldest") jobsQuery = jobsQuery.sort({ createdAt: 1 });
    else if (sortBy === "budget-asc") jobsQuery = jobsQuery.sort({ budget: 1 });
    else if (sortBy === "budget-desc") jobsQuery = jobsQuery.sort({ budget: -1 });

    const jobs = await jobsQuery.lean();

    res.json(jobs);

  } catch (error) {
    console.error("🔥 ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // ownership check HERE
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    // ownership check HERE
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // soft delete
    job.isDeleted = true;
    await job.save();

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};