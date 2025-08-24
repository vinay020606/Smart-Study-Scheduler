import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
  body('preferences.notifications').optional().isBoolean().withMessage('Notifications must be boolean'),
  body('preferences.studyReminders').optional().isBoolean().withMessage('Study reminders must be boolean'),
  body('preferences.breakReminders').optional().isBoolean().withMessage('Break reminders must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, avatar, preferences } = req.body;
    const updateFields: any = {};
    
    if (name) updateFields.name = name;
    if (avatar) updateFields.avatar = avatar;
    if (preferences) updateFields.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/password
// @desc    Change user password
// @access  Private
router.put('/password', [
  auth,
  body('currentPassword').exists().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user study statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('studyStats');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.studyStats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
