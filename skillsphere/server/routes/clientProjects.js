// routes/clientProjects.js
import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";

const router = express.Router();

// GET /api/client/projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/client/projects/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/client/projects
router.post("/", async (req, res) => {
  const { title, description, budget, deadline, category } = req.body;
  const project = new Project({ title, description, budget, deadline, category });
  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/client/projects/:id/apply or /api/projects/:id/apply
router.post("/:id/apply", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Keep lightweight for now: increment an application counter and return success.
    const currentApplications =
      typeof project.applications === "number" ? project.applications : 0;
    project.applications = currentApplications + 1;
    await project.save();

    res.json({
      message: "Successfully applied to the project",
      projectId: project._id,
      applications: project.applications,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/client/projects/:id/attachments
router.put("/:id/attachments", async (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ message: "Attachment name and URL are required" });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.attachments = project.attachments || [];
    project.attachments.push({ name, url });
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/client/projects/:id/invite
router.put("/:id/invite", async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ message: "Freelancer name and email are required" });

  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.invitedFreelancers = project.invitedFreelancers || [];
    project.invitedFreelancers.push({ name, email });
    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/client/projects/:id
router.put("/:id", async (req, res) => {
  const { status, title, description, budget, deadline, category } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (status) project.status = status;
    if (title) project.title = title;
    if (description) project.description = description;
    if (budget) project.budget = budget;
    if (deadline) project.deadline = deadline;
    if (category) project.category = category;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/client/projects/:id
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
