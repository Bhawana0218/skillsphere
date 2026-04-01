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

