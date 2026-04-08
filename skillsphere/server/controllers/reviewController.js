import Review from "../models/Review.js";
import Job from "../models/Job.js";

const computeFraudScore = ({ rating, comment, existingReviews = 0 }) => {
  let score = 0;
  if (!comment || comment.trim().length < 20) score += 0.25;
  if (rating === 5 && comment.trim().length < 40) score += 0.2;
  if (existingReviews >= 3) score += 0.2;
  if (comment.trim().split(" ").length < 6) score += 0.15;
  return Math.min(1, score);
};

const computeWeightedRating = (reviews) => {
  if (!reviews.length) return 0;
  const weightSum = reviews.reduce((sum, review) => {
    const baseWeight = 1;
    const verifiedBonus = review.isVerifiedReview ? 0.3 : 0;
    const fraudDiscount = Math.max(0, 1 - review.fraudScore * 0.7);
    return sum + baseWeight + verifiedBonus * fraudDiscount;
  }, 0);

  const weightedTotal = reviews.reduce((sum, review) => {
    const baseWeight = 1;
    const verifiedBonus = review.isVerifiedReview ? 0.3 : 0;
    const fraudDiscount = Math.max(0, 1 - review.fraudScore * 0.7);
    return sum + review.rating * (baseWeight + verifiedBonus * fraudDiscount);
  }, 0);

  return weightSum === 0 ? 0 : weightedTotal / weightSum;
};

// ADD REVIEW
export const addReview = async (req, res) => {
  try {
    const { jobId, freelancerId, rating, comment } = req.body;

    const existing = await Review.findOne({
      job: jobId,
      reviewer: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    const job = await Job.findById(jobId);
    const isVerifiedReview = Boolean(job && job.status === "closed" && String(job.client) === String(req.user._id));

    const sameAuthorCount = await Review.countDocuments({
      freelancer: freelancerId,
      reviewer: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) },
    });

    const fraudScore = computeFraudScore({
      rating,
      comment,
      existingReviews: sameAuthorCount,
    });

    const review = await Review.create({
      job: jobId,
      reviewer: req.user._id,
      freelancer: freelancerId,
      rating,
      comment,
      isVerifiedReview,
      fraudScore,
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET FREELANCER REVIEWS
export const getFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      freelancer: req.params.freelancerId,
    })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviewAnalytics = async (req, res) => {
  try {
    const freelancerId = req.params.freelancerId;
    const reviews = await Review.find({ freelancer: freelancerId });
    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter((review) => review.isVerifiedReview);
    const fraudReviews = reviews.filter((review) => review.fraudScore >= 0.35);

    const weightedReputation = Number(computeWeightedRating(reviews).toFixed(2));
    const averageRating = totalReviews
      ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(2))
      : 0;
    const verifiedRate = totalReviews ? Number(((verifiedReviews.length / totalReviews) * 100).toFixed(1)) : 0;
    const fraudRisk = totalReviews ? Number(((fraudReviews.length / totalReviews) * 100).toFixed(1)) : 0;
    const ratingDistribution = [1, 2, 3, 4, 5].map((value) => ({
      rating: value,
      count: reviews.filter((review) => review.rating === value).length,
    }));

    const topReviewSignals = [
      {
        label: "Verified review impact",
        value: verifiedReviews.length,
        detail: `${verifiedRate}% verified`,
      },
      {
        label: "Possible fake reviews",
        value: fraudReviews.length,
        detail: `${fraudRisk}% suspicious`,
      },
      {
        label: "Average rating",
        value: averageRating,
        detail: `${totalReviews} total reviews`,
      },
    ];

    res.json({
      weightedReputation,
      averageRating,
      totalReviews,
      verifiedReviews: verifiedReviews.length,
      fraudRisk,
      fraudReviews: fraudReviews.length,
      ratingDistribution,
      topReviewSignals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFreelancerRating = async (req, res) => {
  try {
    const reviews = await Review.find({
      freelancer: req.params.freelancerId,
    });

    const totalReviews = reviews.length;

    const avgRating =
      totalReviews === 0
        ? 0
        : reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    res.json({ avgRating, totalReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};