import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order (client pays)
router.post("/create-order", protect, createOrder);

// Verify payment (webhook)
router.post("/verify", protect, verifyPayment);

export default router;