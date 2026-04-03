import { Router } from 'express';
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { getDashboard, updateProfile, getMyProposals } from '../controllers/freelancerController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/dashboard').get(getDashboard);
router.route('/profile').put(updateProfile);
router.get("/freelancer/my", protect, authorizeRoles("freelancer"), getMyProposals);

export default router;