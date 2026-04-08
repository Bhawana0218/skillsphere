import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";
import {
  fileDispute,
  getAllDisputes,
  getDisputePaymentOptions,
  getUserDisputes,
  markDisputeInReview,
  resolveDispute,
} from "../controllers/disputeController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const disputesUploadDir = "uploads/disputes";
fs.mkdirSync(disputesUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, disputesUploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `dispute-${req.user._id}-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    const allowedExt = /\.(png|jpe?g|pdf|docx?)$/i;
    const allowedMime =
      /^image\/(png|jpeg|jpg)$/i.test(file.mimetype) ||
      /application\/pdf/i.test(file.mimetype) ||
      /application\/msword/i.test(file.mimetype) ||
      /application\/vnd.openxmlformats-officedocument.wordprocessingml.document/i.test(file.mimetype);

    if (allowedExt.test(file.originalname) && allowedMime) {
      return cb(null, true);
    }

    return cb(new Error("Only PNG, JPG, PDF, DOC, DOCX files are allowed"));
  },
});

// Dispute filing (client/freelancer)
router.post(
  "/",
  protect,
  authorizeRoles("client", "freelancer"),
  upload.array("evidenceFiles", 5),
  fileDispute
);

router.get("/payment-options", protect, authorizeRoles("client", "freelancer"), getDisputePaymentOptions);
router.get("/me", protect, authorizeRoles("client", "freelancer"), getUserDisputes);

// Admin mediation
router.get("/", protect, authorizeRoles("admin"), getAllDisputes);
router.put("/:id/review", protect, authorizeRoles("admin"), markDisputeInReview);
router.put("/:id/resolve", protect, authorizeRoles("admin"), resolveDispute);

export default router;
