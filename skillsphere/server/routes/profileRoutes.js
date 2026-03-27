import express from "express";
import { createOrUpdateProfile, getMyProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrUpdateProfile);
router.get("/me", protect, getMyProfile);

export default router;