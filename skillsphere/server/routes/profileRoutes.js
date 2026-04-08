// routes/profile.js
import express from "express";
import Freelancer from "../models/Freelancer.js";
import LegacyProfile from "../models/Profile.js";

const router = express.Router();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildNumberFilter = (minValue, maxValue) => {
  const valueFilter = {};

  if (minValue !== undefined && minValue !== "") {
    const parsedMin = Number(minValue);
    if (!Number.isNaN(parsedMin)) {
      valueFilter.$gte = parsedMin;
    }
  }

  if (maxValue !== undefined && maxValue !== "") {
    const parsedMax = Number(maxValue);
    if (!Number.isNaN(parsedMax)) {
      valueFilter.$lte = parsedMax;
    }
  }

  return Object.keys(valueFilter).length ? valueFilter : undefined;
};

const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return [];

  return skills
    .map((entry) => {
      if (typeof entry === "string") return entry;
      if (entry && typeof entry === "object" && typeof entry.name === "string") {
        return entry.name;
      }
      return "";
    })
    .filter(Boolean);
};

const matchesRange = (value, range) => {
  if (!range) return true;
  if (range.$gte !== undefined && value < range.$gte) return false;
  if (range.$lte !== undefined && value > range.$lte) return false;
  return true;
};

// GET /api/profile/search?skill=&location=&minRate=&maxRate=&minRating=&maxRating=&minExperience=&maxExperience=
router.get("/search", async (req, res) => {
  const {
    skill = "",
    location = "",
    minRate,
    maxRate,
    minRating,
    maxRating,
    minExperience,
    maxExperience,
    limit = "60",
  } = req.query;

  try {
    const skillValue = typeof skill === "string" ? skill.trim() : "";
    const locationValue = typeof location === "string" ? location.trim() : "";
    const rateFilter = buildNumberFilter(minRate, maxRate);
    const ratingFilter = buildNumberFilter(minRating, maxRating);
    const experienceFilter = buildNumberFilter(minExperience, maxExperience);
    const safeSkill = skillValue ? escapeRegex(skillValue) : "";
    const safeLocation = locationValue ? escapeRegex(locationValue) : "";
    const parsedLimit = Number.parseInt(String(limit), 10);
    const resultLimit = Number.isNaN(parsedLimit) ? 60 : Math.min(Math.max(parsedLimit, 1), 120);
    const fetchLimit = Math.min(Math.max(resultLimit * 3, 60), 300);

    const freelancerQuery = {};
    const legacyQuery = {};

    if (safeSkill) {
      freelancerQuery["skills.name"] = { $regex: safeSkill, $options: "i" };
      legacyQuery.$or = [
        { skills: { $regex: safeSkill, $options: "i" } },
        { "skills.name": { $regex: safeSkill, $options: "i" } },
      ];
    }

    if (safeLocation) {
      freelancerQuery.location = { $regex: safeLocation, $options: "i" };
      legacyQuery.location = { $regex: safeLocation, $options: "i" };
    }

    if (rateFilter) {
      freelancerQuery.hourlyRate = rateFilter;
      legacyQuery.hourlyRate = rateFilter;
    }

    if (ratingFilter) freelancerQuery["stats.rating"] = ratingFilter;
    if (experienceFilter) {
      const exprConditions = [];

      if (experienceFilter.$gte !== undefined) {
        exprConditions.push({
          $gte: [{ $size: { $ifNull: ["$experience", []] } }, experienceFilter.$gte],
        });
      }

      if (experienceFilter.$lte !== undefined) {
        exprConditions.push({
          $lte: [{ $size: { $ifNull: ["$experience", []] } }, experienceFilter.$lte],
        });
      }

      if (exprConditions.length > 0) {
        freelancerQuery.$expr = { $and: exprConditions };
      }
    }

    let freelancers;
    const useAtlasSearch = Boolean(process.env.ATLAS_SEARCH_INDEX && process.env.ATLAS_SEARCH_INDEX.trim());
    const atlasSearchIndex = process.env.ATLAS_SEARCH_INDEX;
    let searchEngine = "mongodb-query";

    if (useAtlasSearch && (safeSkill || safeLocation)) {
      const mustClauses = [];
      if (safeSkill) {
        mustClauses.push({
          text: {
            query: skillValue,
            path: ["skills.name", "title"],
            fuzzy: { maxEdits: 1, prefixLength: 1 },
          },
        });
      }
      if (safeLocation) {
        mustClauses.push({
          text: {
            query: locationValue,
            path: "location",
            fuzzy: { maxEdits: 1, prefixLength: 1 },
          },
        });
      }

      const pipeline = [
        {
          $search: {
            index: atlasSearchIndex,
            compound: {
              must: mustClauses,
            },
          },
        },
        {
          $addFields: {
            searchScore: { $meta: "searchScore" },
          },
        },
      ];

      if (rateFilter) {
        pipeline.push({ $match: { hourlyRate: rateFilter } });
      }
      if (ratingFilter) {
        pipeline.push({ $match: { "stats.rating": ratingFilter } });
      }
      if (experienceFilter) {
        pipeline.push({
          $addFields: {
            experienceCount: { $size: { $ifNull: ["$experience", []] } },
          },
        });
        pipeline.push({ $match: { experienceCount: experienceFilter } });
      }
      pipeline.push({ $sort: { searchScore: -1, "stats.rating": -1, hourlyRate: 1 } });
      pipeline.push({ $limit: fetchLimit });
      pipeline.push({
        $project: {
          name: 1,
          title: 1,
          skills: 1,
          hourlyRate: 1,
          location: 1,
          stats: 1,
          experience: 1,
          searchScore: 1,
        },
      });

      freelancers = await Freelancer.aggregate(pipeline);
      searchEngine = "mongodb-atlas-search";
    } else {
      freelancers = await Freelancer.find(freelancerQuery)
        .select("name title skills hourlyRate location stats experience")
        .sort({ "stats.rating": -1, hourlyRate: 1, updatedAt: -1 })
        .limit(fetchLimit);
    }

    const [legacyProfiles] = await Promise.all([
      LegacyProfile.find(legacyQuery)
        .populate("user", "name email")
        .sort({ updatedAt: -1 })
        .limit(fetchLimit),
    ]);

    const normalizedFreelancers = freelancers.map((freelancer) => ({
      _id: freelancer._id,
      hourlyRate: Number(freelancer.hourlyRate) || 0,
      title: freelancer.title || "",
      location: freelancer.location || "",
      rating: Number(freelancer.stats?.rating) || 0,
      experienceCount: Array.isArray(freelancer.experience) ? freelancer.experience.length : 0,
      skills: normalizeSkills(freelancer.skills),
      searchScore: Number(freelancer.searchScore) || 0,
      user: {
        name: freelancer.name || "Freelancer",
      },
    }));

    const normalizedLegacyProfiles = legacyProfiles.map((profile) => ({
      _id: profile._id,
      hourlyRate: Number(profile.hourlyRate) || 0,
      title: profile.title || "",
      location: profile.location || "",
      rating: Number(profile.rating || profile.stats?.rating) || 0,
      experienceCount: Array.isArray(profile.experience) ? profile.experience.length : 0,
      skills: normalizeSkills(profile.skills),
      searchScore: 0,
      user: {
        name: profile.user?.name || "Freelancer",
        email: profile.user?.email || "",
      },
    }));

    const loweredSkill = skillValue.toLowerCase();
    const loweredLocation = locationValue.toLowerCase();
    const mergedProfiles = [...normalizedFreelancers, ...normalizedLegacyProfiles];

    const filteredProfiles = mergedProfiles
      .filter((profile) => {
        const title = profile.title.toLowerCase();
        const skills = profile.skills.map((entry) => entry.toLowerCase());
        const locationText = profile.location.toLowerCase();
        const skillMatches =
          !loweredSkill ||
          title.includes(loweredSkill) ||
          skills.some((entry) => entry.includes(loweredSkill));
        const locationMatches = !loweredLocation || locationText.includes(loweredLocation);
        const rateMatches = matchesRange(profile.hourlyRate, rateFilter);
        const ratingMatches = matchesRange(profile.rating, ratingFilter);
        const experienceMatches = matchesRange(profile.experienceCount, experienceFilter);

        return (
          skillMatches &&
          locationMatches &&
          rateMatches &&
          ratingMatches &&
          experienceMatches
        );
      })
      .sort((a, b) => {
        if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.hourlyRate - b.hourlyRate;
      })
      .slice(0, resultLimit)
      .map(({ searchScore, ...profile }) => profile);

    // Prevent browser revalidation for search responses to avoid stale UI states.
    res.set("Cache-Control", "no-store");
    res.set("X-Search-Engine", searchEngine);
    res.status(200).json(filteredProfiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
