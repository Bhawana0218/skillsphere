import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";
import mongoose from "mongoose";

// CREATE PROPOSAL
export const createProposal = async (req, res) => {
  try {
    const { jobId, bidAmount, duration, coverLetter } = req.body;

        //1. Validate jobId
     if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid Job ID" });
    }

    //  2. PREVENT DUPLICATE PROPOSALS (ADD HERE)
    const existing = await Proposal.findOne({
      job: jobId,
      freelancer: req.user._id,
    });

    if (existing) {
      return res.status(400).json({
        message: "You have already applied to this job",
      });
    }

    const proposal = await Proposal.create({
      job: new mongoose.Types.ObjectId(jobId),
      freelancer: req.user._id,
      bidAmount,
      duration,
      coverLetter,
      status: "pending",
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROPOSALS FOR A JOB (Client)
export const getProposalsByJob = async (req, res) => {
  const { jobId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).json({ message: "Invalid Job ID" });
  }

  const proposals = await Proposal.find({ job: new mongoose.Types.ObjectId(jobId) })
    .populate("freelancer", "name email");

  res.json(proposals);
};


// ACCEPT PROPOSAL
export const acceptProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);

  proposal.status = "accepted";
  await proposal.save();

  // Update job status
  await Job.findByIdAndUpdate(proposal.job, {
    status: "in-progress",
  });

  res.json({ message: "Proposal accepted" });
};

// REJECT PROPOSAL
export const rejectProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);

  proposal.status = "rejected";
  await proposal.save();

  res.json({ message: "Proposal rejected" });
};


export const getProposalsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "Invalid Client ID" });
    }

    // 1. Find jobs belonging to client (field is `client` in Job schema)
    const jobs = await Job.find({ client: new mongoose.Types.ObjectId(clientId) });

    if (jobs.length === 0) {
      return res.json([]);
    }

    const jobIds = jobs.map((job) => job._id);

    // 2. Find proposals for those jobs
    const proposals = await Proposal.find({
      job: { $in: jobIds },
    })
      .populate("freelancer", "name email")
      .populate("job", "title");

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching proposals" });
  }
};

export const getProposalsByFreelancer = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Freelancer ID" });
    }

    const proposals = await Proposal.find({
      freelancer: new mongoose.Types.ObjectId(id),
    })
      .populate("job", "title budget status")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching freelancer proposals" });
  }
};

export const checkApplied = async (req, res) => {
  const { jobId } = req.params;

  const existing = await Proposal.findOne({
    jobId,
    freelancer: req.user._id,
  });

  res.json({ applied: !!existing });
};
