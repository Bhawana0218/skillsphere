import express from "express";
import {
  createOrder,
  verifyPayment,
  createEscrow,
  releaseMilestone,
  payoutFreelancer,
  requestRefund,
  getPaymentHistory,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/create-escrow", protect, createEscrow);
router.post("/release-milestone", protect, releaseMilestone);
router.post("/payout-freelancer", protect, payoutFreelancer);
router.post("/request-refund", protect, requestRefund);
router.get("/history", protect, getPaymentHistory);

export default router;