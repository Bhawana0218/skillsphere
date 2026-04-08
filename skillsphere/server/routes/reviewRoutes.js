import express from "express";
import { addReview, getFreelancerReviews, getFreelancerRating, getReviewAnalytics } from "../controllers/reviewController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Client adds review
router.post("/", protect, authorizeRoles("client"), addReview);

router.get("/analytics/:freelancerId", protect, getReviewAnalytics);
router.get("/rating/:freelancerId", getFreelancerRating);
router.get("/:freelancerId", getFreelancerReviews);

export default router;