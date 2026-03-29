import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getDashboard, updateProfile } from '../controllers/freelancerController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.route('/dashboard').get(getDashboard);
router.route('/profile').put(updateProfile);

export default router;