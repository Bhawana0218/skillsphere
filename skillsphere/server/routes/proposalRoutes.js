import express from "express";
import {
  createProposal,
  getProposalsByJob,
  acceptProposal,
  rejectProposal,
} from "../controllers/proposalController.js";

import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Freelancer applies
router.post("/", protect, authorizeRoles("freelancer"), createProposal);

// Client views proposals
router.get("/:jobId", protect, authorizeRoles("client"), getProposalsByJob);

// Accept / Reject
router.put("/accept/:id", protect, authorizeRoles("client"), acceptProposal);
router.put("/reject/:id", protect, authorizeRoles("client"), rejectProposal);

export default router;