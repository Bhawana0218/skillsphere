import express from "express";
import { createJob, getJobs, getJobById } from "../controllers/jobController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { searchJobs , getLatestJob } from "../controllers/jobController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("client"), createJob);
router.get("/", getJobs);
router.get("/search", searchJobs);
router.get("/latest-job", getLatestJob);
router.get("/:id", getJobById);


export default router;