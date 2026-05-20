const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort('-createdAt');

    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ project: project._id });
        const doneCount = await Task.countDocuments({ project: project._id, status: 'done' });
        return {
          ...project.toObject(),
          taskCount,
          doneCount
        };
      })
    );

    res.json(projectsWithCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    const isOwner = project.owner._id.toString() === req.user._id.toString();

    if (!isMember && !isOwner) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({ project, tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can update this' });
    }

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete this' });
    }

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/members', protect, adminOnly, async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id/members/:userId', protect, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can remove members' });
    }

    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(m => m.toString() !== req.params.userId);
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
