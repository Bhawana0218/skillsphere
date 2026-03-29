import express from "express";
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  googleAuth,
  enable2FA,
  confirm2FA,
  verify2FAForLogin,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Email verification
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);

// Password reset
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", resetPassword);

// Google OAuth (idToken-based)
router.post("/google", googleAuth);

// 2FA (TOTP)
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/confirm", protect, confirm2FA);
router.post("/2fa/verify", verify2FAForLogin); // expects { twoFactorToken, code }

export default router;