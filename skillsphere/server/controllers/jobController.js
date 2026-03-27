import Job from "../models/Job.js";

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
    });

    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL JOBS
export const getJobs = async (req, res) => {
  const jobs = await Job.find().populate("client", "name");
  res.json(jobs);
};

// GET SINGLE JOB
export const getJobById = async (req, res) => {
  const job = await Job.findById(req.params.id).populate("client", "name email");
  res.json(job);
};