import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Schedule from '../models/Schedule';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/schedules
// @desc    Create a new schedule
// @access  Private
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Schedule name is required'),
  body('timeBlocks').isArray({ min: 1 }).withMessage('At least one time block is required'),
  body('timeBlocks.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('timeBlocks.*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('timeBlocks.*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('timeBlocks.*.subject').notEmpty().withMessage('Subject is required for each time block'),
  body('recurring.startDate').isISO8601().withMessage('Start date must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, timeBlocks, recurring } = req.body;
    
    // Validate time blocks don't overlap
    const blocksByDay = {};
    for (const block of timeBlocks) {
      if (!blocksByDay[block.dayOfWeek]) {
        blocksByDay[block.dayOfWeek] = [];
      }
      blocksByDay[block.dayOfWeek].push(block);
    }

    for (const day in blocksByDay) {
      const blocks = blocksByDay[day].sort((a, b) => {
        const aTime = new Date(`2000-01-01T${a.startTime}:00`);
        const bTime = new Date(`2000-01-01T${b.startTime}:00`);
        return aTime.getTime() - bTime.getTime();
      });

      for (let i = 0; i < blocks.length - 1; i++) {
        const currentEnd = new Date(`2000-01-01T${blocks[i].endTime}:00`);
        const nextStart = new Date(`2000-01-01T${blocks[i + 1].startTime}:00`);
        
        if (currentEnd > nextStart) {
          return res.status(400).json({ 
            message: `Time blocks overlap on day ${day}`,
            conflictingBlocks: [blocks[i], blocks[i + 1]]
          });
        }
      }
    }

    const schedule = new Schedule({
      userId: req.user.id,
      name,
      description,
      timeBlocks,
      recurring: {
        ...recurring,
        startDate: new Date(recurring.startDate)
      }
    });

    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/schedules
// @desc    Get all schedules for a user
// @access  Private
router.get('/', [
  auth,
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive } = req.query;
    const filter: any = { userId: req.user.id };
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const schedules = await Schedule.find(filter).sort({ createdAt: -1 });
    res.json(schedules);
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/schedules/:id
// @desc    Get a specific schedule
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/schedules/:id
// @desc    Update a schedule
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().notEmpty().withMessage('Schedule name cannot be empty'),
  body('timeBlocks').optional().isArray({ min: 1 }).withMessage('At least one time block is required'),
  body('timeBlocks.*.dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('timeBlocks.*.startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('timeBlocks.*.endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('timeBlocks.*.subject').optional().notEmpty().withMessage('Subject is required for each time block')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // If updating time blocks, validate for overlaps
    if (req.body.timeBlocks) {
      const blocksByDay = {};
      for (const block of req.body.timeBlocks) {
        if (!blocksByDay[block.dayOfWeek]) {
          blocksByDay[block.dayOfWeek] = [];
        }
        blocksByDay[block.dayOfWeek].push(block);
      }

      for (const day in blocksByDay) {
        const blocks = blocksByDay[day].sort((a, b) => {
          const aTime = new Date(`2000-01-01T${a.startTime}:00`);
          const bTime = new Date(`2000-01-01T${b.startTime}:00`);
          return aTime.getTime() - bTime.getTime();
        });

        for (let i = 0; i < blocks.length - 1; i++) {
          const currentEnd = new Date(`2000-01-01T${blocks[i].endTime}:00`);
          const nextStart = new Date(`2000-01-01T${blocks[i + 1].startTime}:00`);
          
          if (currentEnd > nextStart) {
            return res.status(400).json({ 
              message: `Time blocks overlap on day ${day}`,
              conflictingBlocks: [blocks[i], blocks[i + 1]]
            });
          }
        }
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json(updatedSchedule);
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/schedules/:id
// @desc    Delete a schedule
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/schedules/:id/toggle
// @desc    Toggle schedule active status
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.toggleActive();
    res.json(schedule);
  } catch (error) {
    console.error('Toggle schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/schedules/:id/time-blocks
// @desc    Add a time block to a schedule
// @access  Private
router.put('/:id/time-blocks', [
  auth,
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('type').optional().isIn(['study', 'break', 'exercise', 'other']).withMessage('Invalid type'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.addTimeBlock(req.body);
    res.json(schedule);
  } catch (error) {
    console.error('Add time block error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/schedules/:id/time-blocks/:blockId
// @desc    Remove a time block from a schedule
// @access  Private
router.delete('/:id/time-blocks/:blockId', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.removeTimeBlock(req.params.blockId);
    res.json(schedule);
  } catch (error) {
    console.error('Remove time block error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/schedules/:id/conflicts
// @desc    Check for schedule conflicts
// @access  Private
router.get('/:id/conflicts', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    const hasConflicts = schedule.hasConflicts;
    res.json({ hasConflicts });
  } catch (error) {
    console.error('Check conflicts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
