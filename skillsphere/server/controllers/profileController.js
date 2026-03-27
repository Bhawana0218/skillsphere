import Profile from "../models/Profile.js";

// CREATE / UPDATE PROFILE
export const createOrUpdateProfile = async (req, res) => {
  try {
    const { bio, skills, hourlyRate, experience } = req.body;

    let profile = await Profile.findOne({ user: req.user._id });

    if (profile) {
      profile.bio = bio;
      profile.skills = skills;
      profile.hourlyRate = hourlyRate;
      profile.experience = experience;
      await profile.save();
    } else {
      profile = await Profile.create({
        user: req.user._id,
        bio,
        skills,
        hourlyRate,
        experience,
      });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET PROFILE
export const getMyProfile = async (req, res) => {
  const profile = await Profile.findOne({ user: req.user._id }).populate("user", "name email");
  res.json(profile);
};