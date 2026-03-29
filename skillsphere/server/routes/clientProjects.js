// routes/clientProjects.js
import express from "express";
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