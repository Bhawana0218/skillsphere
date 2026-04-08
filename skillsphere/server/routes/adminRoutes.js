import express from "express";
import {
  getAdminSummary,
  getAllUsers,
  updateUserSuspend,
  verifyFreelancer,
  getPendingGigs,
  approveGig,
  getPayments,
  getFraudAlerts,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", protect, authorizeRoles("admin"), getAdminSummary);
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.put("/users/:id/suspend", protect, authorizeRoles("admin"), updateUserSuspend);
router.put("/users/:id/verify", protect, authorizeRoles("admin"), verifyFreelancer);
router.get("/gigs/pending", protect, authorizeRoles("admin"), getPendingGigs);
router.put("/gigs/:id/approve", protect, authorizeRoles("admin"), approveGig);
router.get("/payments", protect, authorizeRoles("admin"), getPayments);
router.get("/fraud-alerts", protect, authorizeRoles("admin"), getFraudAlerts);

export default router;
