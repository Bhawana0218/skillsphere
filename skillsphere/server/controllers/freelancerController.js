
import mongoose from 'mongoose';

import Freelancer from '../models/Freelancer.js';
import Proposal from "../models/Proposal.js";

// @desc    Get freelancer dashboard data
// @route   GET /api/freelancer/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const freelancer = await Freelancer.findOne({ userId });
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    /* ================= PROPOSALS ================= */
    const proposals = await Proposal.find({ freelancer: userId });

    const totalProposals = proposals.length;
    const pendingProposals = proposals.filter(p => p.status === "pending").length;
    const acceptedProposals = proposals.filter(p => p.status === "accepted").length;

    /* ================= JOBS ================= */
    const jobsWon = await Proposal.find({
      freelancer: userId,
      status: "accepted"
    }).populate("job");

    const completedJobs = freelancer.stats.completedJobs || 0;
    const activeContracts = jobsWon.length;

    /* ================= EARNINGS ================= */
    const totalEarnings = freelancer.stats.earnings;

    /* ================= MONTHLY EARNINGS ================= */
    const monthlyEarnings = await getMonthlyEarnings(userId);

    /* ================= ACTIVITY ================= */
    const activity = proposals.slice(0, 5).map((p, i) => ({
      id: i + 1,
      title: `Proposal for ${p.job?.title || "Job"}`,
      status: p.status,
      date: p.createdAt,
      type: "proposal"
    }));

    /* ================= SKILL DISTRIBUTION ================= */
    const skillDistribution = freelancer.skills.map(skill => ({
      name: skill.name,
      value: skill.proficiency
    }));

    res.json({
      analytics: {
        totalProposals,
        pendingProposals,
        totalEarnings,
        avgRating: freelancer.stats.rating,
        totalReviews: freelancer.stats.completedJobs,
        completedJobs,
        activeContracts
      },
      monthlyEarnings,
      activity,
      skillDistribution,
      profile: freelancer
    });

  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update freelancer profile
// @route   PUT /api/freelancer/profile
const updateProfile = async (req, res) => {
  try {
    const { name, title, bio, hourlyRate, location, skills, portfolio, availability } = req.body;

    let freelancer = await Freelancer.findOne({ userId: req.user?.id });

    if (freelancer) {
      // Update existing
      freelancer.name = name || freelancer.name;
      freelancer.title = title || freelancer.title;
      freelancer.bio = bio || freelancer.bio;
      freelancer.hourlyRate = hourlyRate ?? freelancer.hourlyRate;
      freelancer.location = location || freelancer.location;
      freelancer.skills = skills || freelancer.skills;
      freelancer.portfolio = portfolio || freelancer.portfolio;
      freelancer.availability = availability || freelancer.availability;
      
      await freelancer.save();
    } else {
      // Create new
      freelancer = await Freelancer.create({
        userId: req.user?.id,
        name,
        title,
        bio,
        hourlyRate,
        location,
        skills,
        portfolio,
        availability,
        stats: {
          earnings: 0,
          completedJobs: 0,
          rating: 0,
          activeProposals: 0,
          completionRate: 0,
          responseTime: '0h'
        },
        revenueDistribution: []
      });
    }

    res.json({ 
      message: 'Profile updated successfully',
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        title: freelancer.title,
        photoUrl: freelancer.photoUrl,
        completionRate: calculateProfileCompletion(freelancer)
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper: Get color for category
const getCategoryColor = (category) => {
  const colors = {
    'Web Dev': '#06B6D4',
    'Mobile': '#3B82F6',
    'Design': '#8B5CF6',
    'Writing': '#EC4899',
    'Marketing': '#F59E0B',
    'Other': '#64748B'
  };
  return colors[category] || '#64748B';
};

// Helper: Calculate profile completion %
const calculateProfileCompletion = (f) => {
  let score = 0;
  if (f.name) score += 10;
  if (f.title) score += 10;
  if (f.bio && f.bio.length > 50) score += 15;
  if (f.photoUrl) score += 10;
  if (f.skills && f.skills.length > 0) score += 15;
  if (f.portfolio && f.portfolio.length > 0) score += 20;
  if (f.resumeUrl) score += 10;
  if (f.hourlyRate) score += 10;
  return Math.min(score, 100);
};

// Helper: Mock monthly earnings (replace with real aggregation)
const getMonthlyEarnings = async (userId) => {
  const payments = await Payment.aggregate([
    { $match: { freelancer: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        total: { $sum: "$amount" }
      }
    }
  ]);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return months.map((m, i) => {
    const found = payments.find(p => p._id === i + 1);
    return {
      name: m,
      amount: found ? found.total : 0
    };
  });
};

export const getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      freelancer: req.user._id
    }).populate("job");

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDashboard, updateProfile, getCategoryColor, calculateProfileCompletion, getMonthlyEarnings };
// module.exports = {
//   getDashboard,
//   updateProfile
// };








import Job from "../models/Job.js";
