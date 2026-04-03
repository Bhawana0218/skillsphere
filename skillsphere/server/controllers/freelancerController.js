
import mongoose from 'mongoose';

import Freelancer from '../models/Freelancer.js';

// @desc    Get freelancer dashboard data
// @route   GET /api/freelancer/dashboard
const getDashboard = async (req, res) => {
  try {
    const freelancer = await Freelancer.findOne({ userId: req.user?.id });
    
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer profile not found' });
    }

    // Update last active
    freelancer.lastActive = new Date();
    await freelancer.save();

    res.json({
      earnings: freelancer.stats.earnings,
      completedJobs: freelancer.stats.completedJobs,
      rating: freelancer.stats.rating,
      activeProposals: freelancer.stats.activeProposals,
      completionRate: freelancer.stats.completionRate,
      responseTime: freelancer.stats.responseTime,
      revenueDistribution: freelancer.revenueDistribution.map(r => ({
        name: r.category,
        value: r.percentage,
        color: getCategoryColor(r.category)
      })),
      monthlyEarnings: await getMonthlyEarnings(freelancer.userId)
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
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
  // In production: aggregate from Project/Payment models
  return [
    { month: 'Jan', amount: 40000 },
    { month: 'Feb', amount: 30000 },
    { month: 'Mar', amount: 55000 },
    { month: 'Apr', amount: 48000 },
    { month: 'May', amount: 60000 },
    { month: 'Jun', amount: 75000 },
  ];
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