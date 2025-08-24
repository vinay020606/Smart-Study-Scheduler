import express from 'express';
import { body, validationResult, query } from 'express-validator';
import StudySession from '../models/StudySession';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/study-sessions
// @desc    Start a new study session
// @access  Private
router.post('/', [
  auth,
  body('subject').notEmpty().withMessage('Subject is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 minute'),
  body('taskId').optional().isMongoId().withMessage('Invalid task ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, duration, taskId } = req.body;
    
    // Check if user has an active session
    const activeSession = await StudySession.findOne({
      userId: req.user.id,
      status: { $in: ['active', 'paused'] }
    });

    if (activeSession) {
      return res.status(400).json({ 
        message: 'You already have an active study session',
        activeSession 
      });
    }

    const studySession = new StudySession({
      userId: req.user.id,
      subject,
      duration,
      taskId,
      startTime: new Date(),
      status: 'active'
    });

    await studySession.save();
    res.status(201).json(studySession);
  } catch (error) {
    console.error('Start study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-sessions
// @desc    Get all study sessions for a user
// @access  Private
router.get('/', [
  auth,
  query('status').optional().isIn(['active', 'paused', 'completed', 'interrupted']).withMessage('Invalid status'),
  query('subject').optional().isString().withMessage('Subject must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, subject, startDate, endDate, limit = 50 } = req.query;
    
    // Build filter object
    const filter: any = { userId: req.user.id };
    if (status) filter.status = status;
    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (startDate || endDate) {
      filter.startTime = {};
      if (startDate) filter.startTime.$gte = new Date(startDate as string);
      if (endDate) filter.startTime.$lte = new Date(endDate as string);
    }

    const studySessions = await StudySession.find(filter)
      .sort({ startTime: -1 })
      .limit(parseInt(limit as string))
      .populate('taskId', 'title subject');

    res.json(studySessions);
  } catch (error) {
    console.error('Get study sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-sessions/active
// @desc    Get current active study session
// @access  Private
router.get('/active', auth, async (req, res) => {
  try {
    const activeSession = await StudySession.findOne({
      userId: req.user.id,
      status: { $in: ['active', 'paused'] }
    }).populate('taskId', 'title subject');

    if (!activeSession) {
      return res.status(404).json({ message: 'No active study session found' });
    }

    res.json(activeSession);
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-sessions/:id
// @desc    Get a specific study session
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('taskId', 'title subject');

    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    res.json(studySession);
  } catch (error) {
    console.error('Get study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-sessions/:id/pause
// @desc    Pause a study session
// @access  Private
router.put('/:id/pause', auth, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'active'
    });

    if (!studySession) {
      return res.status(404).json({ message: 'Active study session not found' });
    }

    await studySession.pauseSession();
    res.json(studySession);
  } catch (error) {
    console.error('Pause study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-sessions/:id/resume
// @desc    Resume a paused study session
// @access  Private
router.put('/:id/resume', auth, async (req, res) => {
  try {
    const studySession = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'paused'
    });

    if (!studySession) {
      return res.status(404).json({ message: 'Paused study session not found' });
    }

    await studySession.resumeSession();
    res.json(studySession);
  } catch (error) {
    console.error('Resume study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-sessions/:id/complete
// @desc    Complete a study session
// @access  Private
router.put('/:id/complete', [
  auth,
  body('productivity').optional().isInt({ min: 1, max: 10 }).withMessage('Productivity must be between 1 and 10'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('distractions').optional().isArray().withMessage('Distractions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productivity, notes, distractions } = req.body;
    const studySession = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: { $in: ['active', 'paused'] }
    });

    if (!studySession) {
      return res.status(404).json({ message: 'Active study session not found' });
    }

    // Update session details
    if (productivity !== undefined) studySession.productivity = productivity;
    if (notes !== undefined) studySession.notes = notes;
    if (distractions !== undefined) studySession.distractions = distractions;

    await studySession.completeSession();

    // Update user study statistics
    const user = await User.findById(req.user.id);
    if (user) {
      await user.updateStudyStats(studySession.duration);
    }

    res.json(studySession);
  } catch (error) {
    console.error('Complete study session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/study-sessions/:id/break
// @desc    Add a break to a study session
// @access  Private
router.put('/:id/break', [
  auth,
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('endTime').isISO8601().withMessage('End time must be a valid date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { startTime, endTime } = req.body;
    const studySession = await StudySession.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!studySession) {
      return res.status(404).json({ message: 'Study session not found' });
    }

    await studySession.addBreak(new Date(startTime), new Date(endTime));
    res.json(studySession);
  } catch (error) {
    console.error('Add break error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/study-sessions/stats/summary
// @desc    Get study session statistics summary
// @access  Private
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days as string) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const sessions = await StudySession.find({
      userId: req.user.id,
      status: 'completed',
      startTime: { $gte: startDate }
    });

    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0;
    const totalBreaks = sessions.reduce((sum, session) => sum + session.breaks.length, 0);
    const averageProductivity = sessions.reduce((sum, session) => sum + session.productivity, 0) / totalSessions || 0;

    // Group by subject
    const subjectStats = sessions.reduce((acc, session) => {
      if (!acc[session.subject]) {
        acc[session.subject] = { totalTime: 0, sessions: 0 };
      }
      acc[session.subject].totalTime += session.duration;
      acc[session.subject].sessions += 1;
      return acc;
    }, {} as any);

    res.json({
      totalSessions,
      totalStudyTime,
      averageSessionLength,
      totalBreaks,
      averageProductivity: Math.round(averageProductivity * 10) / 10,
      subjectStats,
      period: `${daysNum} days`
    });
  } catch (error) {
    console.error('Get stats summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
