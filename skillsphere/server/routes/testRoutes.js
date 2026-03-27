import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/client", protect, authorizeRoles("client"), (req, res) => {
  res.json({ message: "Client Dashboard" });
});

router.get("/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Admin Dashboard" });
});

export default router;