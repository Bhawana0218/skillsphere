import Availability from "../models/Availability.js";
import Job from "../models/Job.js";
import FreelancerProfile from "../models/FreelancerProfile.js";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const parseDateInput = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseTimeToMinutes = (timeValue) => {
  if (typeof timeValue !== "string") return null;
  const [rawHour, rawMinute] = timeValue.split(":");
  const hour = Number.parseInt(rawHour, 10);
  const minute = Number.parseInt(rawMinute, 10);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return hour * 60 + minute;
};

const buildDateFromLocalParts = (dateString, minutes, timezoneOffsetMinutes) => {
  const [rawYear, rawMonth, rawDay] = dateString.split("-");
  const year = Number.parseInt(rawYear, 10);
  const month = Number.parseInt(rawMonth, 10);
  const day = Number.parseInt(rawDay, 10);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  const offset = Number.isFinite(timezoneOffsetMinutes) ? timezoneOffsetMinutes : 0;
  const utcMilliseconds =
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) - offset * 60000 + minutes * 60000;

  const built = new Date(utcMilliseconds);
  return Number.isNaN(built.getTime()) ? null : built;
};

const normalizeTemplateSlots = (templateSlots) => {
  if (!Array.isArray(templateSlots)) return [];

  return templateSlots
    .filter((slot) => slot && typeof slot === "object" && slot.available !== false)
    .map((slot) => {
      const day = slot.day;
      const start = parseTimeToMinutes(slot.startTime || "09:00");
      const end = parseTimeToMinutes(slot.endTime || "17:00");

      if (!DAY_NAMES.includes(day) || start === null || end === null || end <= start) {
        return null;
      }

      return { day, startMinutes: start, endMinutes: end };
    })
    .filter(Boolean);
};

const getDefaultTemplateSlots = () => [
  { day: "Monday", startMinutes: 9 * 60, endMinutes: 17 * 60 },
  { day: "Tuesday", startMinutes: 9 * 60, endMinutes: 17 * 60 },
  { day: "Wednesday", startMinutes: 9 * 60, endMinutes: 17 * 60 },
  { day: "Thursday", startMinutes: 9 * 60, endMinutes: 17 * 60 },
  { day: "Friday", startMinutes: 9 * 60, endMinutes: 17 * 60 },
];

const collectAvailabilityFilter = (req, freelancerId) => {
  const { startDate, endDate, includeBooked = "true" } = req.query;
  const filter = { freelancer: freelancerId };

  if (includeBooked === "false") {
    filter.isBooked = false;
  }

  const rangeStart = startDate ? parseDateInput(startDate) : null;
  const rangeEnd = endDate ? parseDateInput(endDate) : null;

  if (rangeStart || rangeEnd) {
    filter.startTime = {};
    if (rangeStart) filter.startTime.$gte = rangeStart;
    if (rangeEnd) filter.startTime.$lte = rangeEnd;
  }

  return filter;
};

// Add availability slot manually
export const addAvailability = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;
    const parsedStart = parseDateInput(startTime);
    const parsedEnd = parseDateInput(endTime);

    if (!parsedStart || !parsedEnd) {
      return res.status(400).json({ message: "Invalid start or end time" });
    }

    if (parsedEnd <= parsedStart) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    if (parsedStart <= new Date()) {
      return res.status(400).json({ message: "Start time must be in the future" });
    }

    const conflict = await Availability.findOne({
      freelancer: req.user._id,
      startTime: { $lt: parsedEnd },
      endTime: { $gt: parsedStart },
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "Time slot conflicts with existing availability" });
    }

    const slot = await Availability.create({
      freelancer: req.user._id,
      startTime: parsedStart,
      endTime: parsedEnd,
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto-generate slots from date range and weekly template.
export const autoScheduleAvailability = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      slotDurationMinutes = 60,
      gapMinutes = 0,
      timezoneOffsetMinutes = 0,
      availabilityTemplate,
    } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ message: "fromDate and toDate are required" });
    }

    const startDay = new Date(`${fromDate}T00:00:00.000Z`);
    const endDay = new Date(`${toDate}T00:00:00.000Z`);
    if (Number.isNaN(startDay.getTime()) || Number.isNaN(endDay.getTime()) || endDay < startDay) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const dayRange = Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1;
    if (dayRange > 90) {
      return res.status(400).json({ message: "Auto scheduling supports up to 90 days at a time" });
    }

    const duration = Number.parseInt(String(slotDurationMinutes), 10);
    const breakGap = Number.parseInt(String(gapMinutes), 10);
    const timezoneOffset = Number.parseInt(String(timezoneOffsetMinutes), 10);

    if (Number.isNaN(duration) || duration < 15 || duration > 360) {
      return res.status(400).json({ message: "slotDurationMinutes must be between 15 and 360" });
    }
    if (Number.isNaN(breakGap) || breakGap < 0 || breakGap > 180) {
      return res.status(400).json({ message: "gapMinutes must be between 0 and 180" });
    }

    const profile = await FreelancerProfile.findOne({ user: req.user._id }).select("availability");
    const baseTemplate = normalizeTemplateSlots(availabilityTemplate);
    const profileTemplate = normalizeTemplateSlots(profile?.availability);
    const template = baseTemplate.length
      ? baseTemplate
      : profileTemplate.length
      ? profileTemplate
      : getDefaultTemplateSlots();

    const templateByDay = template.reduce((acc, item) => {
      acc[item.day] = item;
      return acc;
    }, {});

    const rangeStart = buildDateFromLocalParts(fromDate, 0, timezoneOffset) || startDay;
    const rangeEnd = buildDateFromLocalParts(toDate, 24 * 60, timezoneOffset) || endDay;

    const existingSlots = await Availability.find({
      freelancer: req.user._id,
      startTime: { $lt: rangeEnd },
      endTime: { $gt: rangeStart },
    }).select("startTime endTime");

    const intervals = existingSlots.map((slot) => ({
      start: slot.startTime.getTime(),
      end: slot.endTime.getTime(),
    }));
    const now = Date.now();
    const slotsToInsert = [];
    let skippedConflicts = 0;
    let skippedPast = 0;

    for (let cursor = new Date(startDay); cursor <= endDay; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const dateLabel = cursor.toISOString().slice(0, 10);
      const dayName = DAY_NAMES[new Date(`${dateLabel}T12:00:00.000Z`).getUTCDay()];
      const dayTemplate = templateByDay[dayName];

      if (!dayTemplate) continue;

      let pointer = dayTemplate.startMinutes;
      while (pointer + duration <= dayTemplate.endMinutes) {
        const slotStart = buildDateFromLocalParts(dateLabel, pointer, timezoneOffset);
        const slotEnd = buildDateFromLocalParts(dateLabel, pointer + duration, timezoneOffset);
        pointer += duration + breakGap;

        if (!slotStart || !slotEnd) continue;

        const startMs = slotStart.getTime();
        const endMs = slotEnd.getTime();
        if (startMs <= now) {
          skippedPast += 1;
          continue;
        }

        const hasConflict = intervals.some((interval) => interval.start < endMs && interval.end > startMs);
        if (hasConflict) {
          skippedConflicts += 1;
          continue;
        }

        intervals.push({ start: startMs, end: endMs });
        slotsToInsert.push({
          freelancer: req.user._id,
          startTime: slotStart,
          endTime: slotEnd,
        });
      }
    }

    let insertedSlots = [];
    if (slotsToInsert.length > 0) {
      insertedSlots = await Availability.insertMany(slotsToInsert, { ordered: false });
    }

    res.status(201).json({
      message: "Auto scheduling completed",
      createdCount: insertedSlots.length,
      skippedConflicts,
      skippedPast,
      slots: insertedSlots,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get freelancer availability by freelancer id.
export const getAvailability = async (req, res) => {
  try {
    const filter = collectAvailabilityFilter(req, req.params.freelancerId);
    const slots = await Availability.find(filter)
      .sort({ startTime: 1 })
      .populate("bookedBy", "name email")
      .populate("job", "title");

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get logged-in freelancer slots.
export const getMyAvailability = async (req, res) => {
  try {
    const filter = collectAvailabilityFilter(req, req.user._id);
    const slots = await Availability.find(filter)
      .sort({ startTime: 1 })
      .populate("bookedBy", "name email")
      .populate("job", "title");

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bookings for current user (freelancer or client).
export const getMyBookings = async (req, res) => {
  try {
    let filter;
    if (req.user.role === "freelancer") {
      filter = { freelancer: req.user._id, isBooked: true };
    } else if (req.user.role === "client") {
      filter = { bookedBy: req.user._id, isBooked: true };
    } else {
      return res.status(403).json({ message: "Only freelancer or client accounts can view bookings" });
    }

    const slots = await Availability.find(filter)
      .sort({ startTime: 1 })
      .populate("freelancer", "name email")
      .populate("bookedBy", "name email")
      .populate("job", "title status");

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Book a slot as client.
export const bookSlot = async (req, res) => {
  try {
    const { slotId, jobId } = req.body;

    if (!slotId) {
      return res.status(400).json({ message: "slotId is required" });
    }

    let bookedJob = null;
    if (jobId) {
      bookedJob = await Job.findById(jobId);
      if (!bookedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      if (String(bookedJob.client) !== String(req.user._id)) {
        return res.status(403).json({ message: "You can only use your own job for booking" });
      }
    }

    const slot = await Availability.findOneAndUpdate(
      {
        _id: slotId,
        isBooked: false,
        startTime: { $gt: new Date() },
      },
      {
        isBooked: true,
        job: bookedJob?._id || null,
        bookedBy: req.user._id,
        bookedAt: new Date(),
      },
      { new: true }
    )
      .populate("freelancer", "name email")
      .populate("bookedBy", "name email")
      .populate("job", "title status");

    if (!slot) {
      return res.status(400).json({ message: "Slot is unavailable or already booked" });
    }

    const nextAvailableSlot = await Availability.findOne({
      freelancer: slot.freelancer?._id || slot.freelancer,
      isBooked: false,
      startTime: { $gt: slot.endTime },
    })
      .sort({ startTime: 1 })
      .select("_id startTime endTime");

    res.json({
      success: true,
      message: "Slot booked successfully",
      slot,
      nextAvailableSlot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete own future slot (freelancer only).
export const deleteAvailabilitySlot = async (req, res) => {
  try {
    const slot = await Availability.findOne({
      _id: req.params.slotId,
      freelancer: req.user._id,
    });

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "Booked slot cannot be deleted" });
    }

    if (slot.startTime <= new Date()) {
      return res.status(400).json({ message: "Past or ongoing slots cannot be deleted" });
    }

    await slot.deleteOne();
    res.json({ success: true, message: "Slot deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
