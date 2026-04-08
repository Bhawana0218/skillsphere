import User from "../models/User.js";
import Job from "../models/Job.js";
import Payment from "../models/Payment.js";
import Review from "../models/Review.js";

export const getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const clients = await User.countDocuments({ role: "client" });
    const freelancers = await User.countDocuments({ role: "freelancer" });
    const admins = await User.countDocuments({ role: "admin" });
    const verifiedFreelancers = await User.countDocuments({ role: "freelancer", isVerified: true });
    const suspendedUsers = await User.countDocuments({ isSuspended: true });
    const totalJobs = await Job.countDocuments({ isDeleted: false });
    const openJobs = await Job.countDocuments({ status: "open", isDeleted: false });
    const pendingGigs = await Job.countDocuments({ adminApproved: false, isDeleted: false });

    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          failedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "failed"] }, 1, 0],
            },
          },
          refundedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "refunded"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const stats = paymentStats[0] || {
      totalVolume: 0,
      totalPayments: 0,
      completedPayments: 0,
      failedPayments: 0,
      refundedPayments: 0,
    };

    res.json({
      totalUsers,
      clients,
      freelancers,
      admins,
      verifiedFreelancers,
      suspendedUsers,
      totalJobs,
      openJobs,
      pendingGigs,
      paymentVolume: Number(stats.totalVolume || 0),
      paymentsCount: stats.totalPayments,
      completedPayments: stats.completedPayments,
      failedPayments: stats.failedPayments,
      refundedPayments: stats.refundedPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(
      users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isSuspended: user.isSuspended || false,
        createdAt: user.createdAt,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserSuspend = async (req, res) => {
  try {
    const { suspend } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot suspend your own admin account" });
    }

    user.isSuspended = Boolean(suspend);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyFreelancer = async (req, res) => {
  try {
    const { verify } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

    if (user.role !== "freelancer") {
      return res.status(400).json({ message: "Only freelancers can be verified" });
    }

    user.isVerified = Boolean(verify);
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isSuspended: user.isSuspended || false,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPendingGigs = async (req, res) => {
  try {
    const gigs = await Job.find({ adminApproved: false, isDeleted: false })
      .populate("client", "name email")
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(gigs.map((gig) => ({
      _id: gig._id,
      title: gig.title,
      budget: gig.budget,
      deadline: gig.deadline,
      status: gig.status,
      adminApproved: gig.adminApproved,
      client: gig.client,
      createdAt: gig.createdAt,
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveGig = async (req, res) => {
  try {
    const gig = await Job.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    gig.adminApproved = true;
    await gig.save();

    res.json({
      _id: gig._id,
      title: gig.title,
      adminApproved: gig.adminApproved,
      status: gig.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPayments = async (req, res) => {
  try {
    const summary = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: "$amount" },
          totalPayments: { $sum: 1 },
          completedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          pendingPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
            },
          },
          refundedPayments: {
            $sum: {
              $cond: [{ $eq: ["$status", "refunded"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const leadingPayments = await Payment.find()
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 })
      .limit(20);

    const stats = summary[0] || {
      totalVolume: 0,
      totalPayments: 0,
      completedPayments: 0,
      pendingPayments: 0,
      refundedPayments: 0,
    };

    res.json({
      summary: {
        totalVolume: Number(stats.totalVolume || 0),
        totalPayments: stats.totalPayments,
        completedPayments: stats.completedPayments,
        pendingPayments: stats.pendingPayments,
        refundedPayments: stats.refundedPayments,
      },
      payments: leadingPayments.map((payment) => ({
        _id: payment._id,
        client: payment.client,
        freelancer: payment.freelancer,
        job: payment.job,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transactionType: payment.transactionType,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFraudAlerts = async (req, res) => {
  try {
    const suspiciousReviews = await Review.find({ fraudScore: { $gte: 0.35 } })
      .populate("reviewer", "name")
      .populate("freelancer", "name")
      .sort({ fraudScore: -1 })
      .limit(15);

    const suspiciousPayments = await Payment.find({
      $or: [
        { status: "failed" },
        { transactionType: "refund" },
        { amount: { $gt: 100000 } },
      ],
    })
      .populate("client", "name email")
      .populate("freelancer", "name email")
      .populate("job", "title")
      .sort({ amount: -1 })
      .limit(15);

    res.json({
      suspiciousReviews: suspiciousReviews.map((review) => ({
        _id: review._id,
        rating: review.rating,
        fraudScore: review.fraudScore,
        comment: review.comment,
        reviewer: review.reviewer,
        freelancer: review.freelancer,
        createdAt: review.createdAt,
      })),
      suspiciousPayments: suspiciousPayments.map((payment) => ({
        _id: payment._id,
        client: payment.client,
        freelancer: payment.freelancer,
        job: payment.job,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transactionType: payment.transactionType,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
