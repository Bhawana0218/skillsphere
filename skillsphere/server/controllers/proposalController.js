import Proposal from "../models/Proposal.js";
import Job from "../models/Job.js";

// CREATE PROPOSAL
export const createProposal = async (req, res) => {
  try {
    const { jobId, bidAmount, duration, coverLetter } = req.body;

    const proposal = await Proposal.create({
      job: jobId,
      freelancer: req.user._id,
      bidAmount,
      duration,
      coverLetter,
    });

    res.status(201).json(proposal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROPOSALS FOR A JOB (Client)
export const getProposalsByJob = async (req, res) => {
  const proposals = await Proposal.find({ job: req.params.jobId })
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