import express from "express";
import {
  addAvailability,
  autoScheduleAvailability,
  bookSlot,
  deleteAvailabilitySlot,
  getAvailability,
  getMyAvailability,
  getMyBookings,
} from "../controllers/availabilityController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Freelancer adds slots
router.post("/", protect, authorizeRoles("freelancer"), addAvailability);
router.post("/auto-schedule", protect, authorizeRoles("freelancer"), autoScheduleAvailability);
router.delete("/:slotId", protect, authorizeRoles("freelancer"), deleteAvailabilitySlot);

// Own slots and bookings
router.get("/mine", protect, authorizeRoles("freelancer"), getMyAvailability);
router.get("/bookings/mine", protect, getMyBookings);

// Get freelancer slots
router.get("/:freelancerId", protect, getAvailability);

// Client books a slot
router.post("/book", protect, authorizeRoles("client"), bookSlot);

export default router;
