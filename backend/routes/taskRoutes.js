const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { assignedTo: req.user._id };

    const allTasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');

    const total = allTasks.length;
    const todo = allTasks.filter(t => t.status === 'todo').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const done = allTasks.filter(t => t.status === 'done').length;
    const overdue = allTasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length;

    res.json({
      stats: { total, todo, inProgress, done, overdue },
      recentTasks: allTasks.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { assignedTo: req.user._id };

    if (req.query.project) {
      query.project = req.query.project;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({ message: 'Title, project, assignedTo and dueDate are required' });
    }

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      createdBy: req.user._id,
      priority: priority || 'medium',
      dueDate
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.user.role === 'member') {
      if (task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update tasks assigned to you' });
      }
      task.status = req.body.status || task.status;
    } else {
      task.title = req.body.title || task.title;
      task.description = req.body.description !== undefined ? req.body.description : task.description;
      task.assignedTo = req.body.assignedTo || task.assignedTo;
      task.status = req.body.status || task.status;
      task.priority = req.body.priority || task.priority;
      task.dueDate = req.body.dueDate || task.dueDate;
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
