import Profile from "../models/ClientProfile.js";

// CREATE / UPDATE PROFIL
export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      companyName,
      tagline,
      description,
      website,
      logo,
      industry,
      companySize,
      location,
      hiringPreferences,
    } = req.body;

    let profile = await Profile.findOne({ owner: req.user._id });

    if (profile) {

      // UPDATE
      Object.assign(profile, {
        companyName,
        tagline,
        description,
        website,
        logo,
        industry,
        companySize,
        location,
        hiringPreferences,
      });

      await profile.save();
    } else {
      // CREATE
      profile = await Profile.create({
        owner: req.user._id,
        companyName,
        tagline,
        description,
        website,
        logo,
        industry,
        companySize,
        location,
        hiringPreferences,
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getMyProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne({ owner: req.user._id }).populate(
      "owner",
      "name email"
    );

    if (!profile) {
      // Auto-create a starter profile for first-time clients to avoid repeated 404s.
      const starterCompanyName = req.user?.name
        ? `${req.user.name}'s Company`
        : "My Company";

      profile = await Profile.create({
        owner: req.user._id,
        companyName: starterCompanyName,
        tagline: "",
        description: "",
        website: "",
        industry: "",
        companySize: "1-10",
        location: "",
        hiringPreferences: {
          roles: [],
          projectTypes: [],
          budgetRange: "",
        },
        projects: [],
      });

      profile = await Profile.findById(profile._id).populate("owner", "name email");
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const addProject = async (req, res) => {
  try {
    const { title, description, budget, duration } = req.body;

    const profile = await Profile.findOne({ owner: req.user._id });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const newProject = {
      title,
      description,
      budget,
      duration,
      status: "Open",
    };

    profile.projects.push(newProject);
    await profile.save();

    res.status(201).json(profile.projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const profile = await Profile.findOne({ owner: req.user._id });
     if (!profile) return res.status(404).json({ message: "Profile not found" });

    const project = profile.projects.id(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.status = status;
    await profile.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const searchClients = async (req, res) => {
  try {
    const { industry, location, companySize, minBudget, maxBudget } = req.query;

    let query = {};

    // Filter by industry
    if (industry) {
      query.industry = { $regex: industry, $options: "i" };
    }

    // Filter by location
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    // Filter by company size
    if (companySize) {
      query.companySize = companySize;
    }

    // Filter by project budget
    if (minBudget || maxBudget) {
      query["projects.budget"] = {};
      if (minBudget) query["projects.budget"].$gte = Number(minBudget);
      if (maxBudget) query["projects.budget"].$lte = Number(maxBudget);
    }

    const clients = await ClientProfile.find(query);

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
