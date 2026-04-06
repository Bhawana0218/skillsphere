import { Router } from 'express';
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { getDashboard, getProfile, updateProfile, getMyProposals, getProgress, refreshDashboard } from '../controllers/freelancerController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/dashboard').get(getDashboard);
router.route('/dashboard/refresh').put(refreshDashboard);
router.route('/profile').get(getProfile).put(updateProfile);
router.route('/progress').get(getProgress);
router.get("/freelancer/my", protect, authorizeRoles("freelancer"), getMyProposals);

export default router;
