
import mongoose from 'mongoose';

import Freelancer from '../models/Freelancer.js';
import Proposal from "../models/Proposal.js";
import Payment from "../models/Payment.js";
import FreelancerDashboard from "../models/FreelancerDashboard.js";
import Review from "../models/Review.js";

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

    // Validate required fields
    if (!name || !title || !bio) {
      return res.status(400).json({ message: "Name, title, and bio are required" });
    }

    // Get user ID from authenticated request
    const userId = req.user._id || req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills
          .filter((skill) => typeof skill?.name === "string" && skill.name.trim().length > 0)
          .map((skill) => ({
            name: skill.name.trim(),
            proficiency: Math.max(0, Math.min(100, Number(skill.proficiency) || 50)),
          }))
      : [];

    const normalizedPortfolio = Array.isArray(portfolio)
      ? portfolio
          .filter((p) => typeof p?.title === "string" && p.title.trim().length > 0)
          .map((p) => ({
            title: p.title.trim(),
            description: typeof p?.description === "string" ? p.description.trim() : "",
            imageUrl: typeof p?.imageUrl === "string" ? p.imageUrl : "",
            projectUrl: typeof p?.projectUrl === "string" ? p.projectUrl : "",
          }))
      : [];

    let freelancer = await Freelancer.findOne({ userId });

    if (freelancer) {
      // Update existing
      freelancer.name = name || freelancer.name;
      freelancer.title = title || freelancer.title;
      freelancer.bio = bio || freelancer.bio;
      freelancer.hourlyRate = hourlyRate ?? freelancer.hourlyRate;
      freelancer.location = location || freelancer.location;
      
      // Handle skills - ensure proper structure
      if (Array.isArray(skills)) {
        freelancer.skills = normalizedSkills;
      }
      
      // Handle portfolio - ensure proper structure
      if (Array.isArray(portfolio)) {
        freelancer.portfolio = normalizedPortfolio;
      }
      
      freelancer.availability = availability || freelancer.availability;
      
      await freelancer.save();
    } else {
      // Create new
      freelancer = await Freelancer.create({
        userId,
        name,
        title,
        bio,
        hourlyRate: hourlyRate || 0,
        location: location || '',
        skills: normalizedSkills,
        portfolio: normalizedPortfolio,
        availability: availability || 'full-time',
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
        completionRate: calculateProfileCompletion(freelancer),
        skills: freelancer.skills,
        hourlyRate: freelancer.hourlyRate,
        bio: freelancer.bio,
        location: freelancer.location
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get freelancer profile
// @route   GET /api/freelancer/profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const freelancer = await Freelancer.findOne({ userId });

    if (!freelancer) {
      return res.json({ freelancer: null });
    }

    res.json({
      freelancer: {
        id: freelancer._id,
        name: freelancer.name,
        title: freelancer.title,
        bio: freelancer.bio,
        hourlyRate: freelancer.hourlyRate,
        location: freelancer.location,
        skills: freelancer.skills || [],
        portfolio: freelancer.portfolio || [],
        availability: freelancer.availability,
        profileCompletion: calculateProfileCompletion(freelancer),
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
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

// Helper function to calculate and store freelancer dashboard data
const calculateAndStoreDashboardData = async (userId) => {
  try {
    const freelancer = await Freelancer.findOne({ userId });
    if (!freelancer) {
      throw new Error("Freelancer not found");
    }

    // Profile Completion
    const profileCompletion = calculateProfileCompletion(freelancer);
    const profileSteps = [
      { name: "Basic Info", completed: !!(freelancer.name && freelancer.title && freelancer.bio) },
      { name: "Skills", completed: freelancer.skills && freelancer.skills.length > 0 },
      { name: "Portfolio", completed: freelancer.portfolio && freelancer.portfolio.length > 0 },
      { name: "Resume", completed: !!freelancer.resumeUrl },
      { name: "Photo", completed: !!freelancer.photoUrl },
      { name: "Rate", completed: !!freelancer.hourlyRate }
    ];

    // Earnings Progress
    const totalEarnings = freelancer.stats.earnings || 0;
    const earningsGoal = 50000; // Example goal, can be configurable
    const monthlyEarnings = await getMonthlyEarnings(userId);

    // Jobs
    const proposals = await Proposal.find({ freelancer: userId });
    const acceptedProposals = proposals.filter(p => p.status === "accepted");
    const completedJobs = freelancer.stats.completedJobs || 0;
    const inProgressJobs = acceptedProposals.length;
    const totalJobs = proposals.length;
    const successRate = totalJobs > 0 ? (acceptedProposals.length / totalJobs) * 100 : 0;

    // Skills
    const totalSkills = freelancer.skills.length;
    const avgProficiency = totalSkills > 0
      ? freelancer.skills.reduce((sum, skill) => sum + skill.proficiency, 0) / totalSkills
      : 0;
    const topSkills = freelancer.skills
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 5)
      .map(skill => ({
        name: skill.name,
        level: skill.proficiency,
        trend: 'stable' // Could calculate based on history
      }));

    const dashboardData = {
      freelancer: freelancer._id,
      profileCompletion: {
        current: profileCompletion,
        target: 100,
        steps: profileSteps
      },
      earningsProgress: {
        current: totalEarnings,
        goal: earningsGoal,
        monthly: monthlyEarnings.map(m => ({
          month: m.name,
          amount: m.amount,
          projected: m.amount * 1.1 // Simple projection
        }))
      },
      jobs: {
        completed: completedJobs,
        inProgress: inProgressJobs,
        total: totalJobs,
        successRate: Math.round(successRate)
      },
      skills: {
        total: totalSkills,
        avgProficiency: Math.round(avgProficiency),
        topSkills
      },
      lastUpdated: new Date()
    };

    // Store or update the dashboard data
    const existingDashboard = await FreelancerDashboard.findOne({ freelancer: freelancer._id });
    if (existingDashboard) {
      await FreelancerDashboard.findOneAndUpdate(
        { freelancer: freelancer._id },
        dashboardData,
        { new: true, upsert: true }
      );
    } else {
      await FreelancerDashboard.create(dashboardData);
    }

    return dashboardData;
  } catch (error) {
    console.error("Error calculating dashboard data:", error);
    throw error;
  }
};

// @desc    Get freelancer progress data
// @route   GET /api/freelancer/progress
const getProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const freelancer = await Freelancer.findOne({ userId });
    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    // Try to get stored dashboard data
    let dashboardData = await FreelancerDashboard.findOne({ freelancer: freelancer._id });

    // If no stored data or data is older than 1 hour, recalculate and store
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (!dashboardData || dashboardData.lastUpdated < oneHourAgo) {
      console.log("Calculating fresh dashboard data for freelancer:", freelancer._id);
      dashboardData = await calculateAndStoreDashboardData(userId);
    }

    res.json(dashboardData);
  } catch (error) {
    console.error("Progress Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Refresh freelancer dashboard data
// @route   PUT /api/freelancer/dashboard/refresh
const refreshDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboardData = await calculateAndStoreDashboardData(userId);
    res.json({ message: "Dashboard data refreshed successfully", data: dashboardData });
  } catch (error) {
    console.error("Refresh Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getDashboard,
  getProfile,
  updateProfile,
  getProgress,
  refreshDashboard,
  getCategoryColor,
  calculateProfileCompletion,
  getMonthlyEarnings,
};
//   getDashboard,
//   updateProfile
// };








import Job from "../models/Job.js";
