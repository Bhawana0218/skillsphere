
const Project = require('../models/Project');

// GET all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE a new project
const createProject = async (req, res) => {
  const { title, description, budget, deadline, category } = req.body;
  const project = new Project({ title, description, budget, deadline, category });

  try {
    const newProject = await project.save();
    res.status(201).json(newProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE a project (status or full update)
const updateProject = async (req, res) => {
  const { status, title, description, budget, deadline, category } = req.body;
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (status) project.status = status;
    if (title) project.title = title;
    if (description) project.description = description;
    if (budget !== undefined) project.budget = budget;
    if (deadline) project.deadline = deadline;
    if (category) project.category = category;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE a project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await project.remove();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};