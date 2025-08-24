import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Task from '../models/Task';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('dueDate').isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = new Task({
      ...req.body,
      userId: req.user.id
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for a user
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
  query('subject').optional().isString().withMessage('Subject must be a string'),
  query('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  query('sortBy').optional().isIn(['dueDate', 'priority', 'createdAt', 'title']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, priority, subject, dueDate, sortBy = 'dueDate', sortOrder = 'asc' } = req.query;
    
    // Build filter object
    const filter: any = { userId: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (dueDate) {
      const date = new Date(dueDate as string);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.dueDate = { $gte: date, $lt: nextDay };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const tasks = await Task.find(filter).sort(sort);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('estimatedDuration').optional().isInt({ min: 1 }).withMessage('Estimated duration must be at least 1 minute'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority level'),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.updateStatus(status);
    res.json(task);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', auth, async (req, res) => {
  try {
    const overdueTasks = await Task.find({
      userId: req.user.id,
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    }).sort({ dueDate: 1 });

    res.json(overdueTasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/upcoming
// @desc    Get upcoming tasks
// @access  Private
router.get('/upcoming', auth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string) || 7;
    
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + daysNum);

    const upcomingTasks = await Task.find({
      userId: req.user.id,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date(), $lte: upcomingDate }
    }).sort({ dueDate: 1 });

    res.json(upcomingTasks);
  } catch (error) {
    console.error('Get upcoming tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
