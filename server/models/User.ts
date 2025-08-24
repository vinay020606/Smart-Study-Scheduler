import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  avatar?: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    studyReminders: boolean;
    breakReminders: boolean;
  };
  studyStats: {
    totalStudyTime: number;
    totalSessions: number;
    averageSessionLength: number;
    longestStreak: number;
    currentStreak: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    breakReminders: {
      type: Boolean,
      default: true
    }
  },
  studyStats: {
    totalStudyTime: {
      type: Number,
      default: 0
    },
    totalSessions: {
      type: Number,
      default: 0
    },
    averageSessionLength: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted study time
userSchema.virtual('formattedStudyTime').get(function() {
  const hours = Math.floor(this.studyStats.totalStudyTime / 3600);
  const minutes = Math.floor((this.studyStats.totalStudyTime % 3600) / 60);
  return `${hours}h ${minutes}m`;
});

// Method to update study statistics
userSchema.methods.updateStudyStats = function(sessionDuration: number) {
  this.studyStats.totalStudyTime += sessionDuration;
  this.studyStats.totalSessions += 1;
  this.studyStats.averageSessionLength = 
    this.studyStats.totalStudyTime / this.studyStats.totalSessions;
  
  // Update streak logic can be implemented here
  return this.save();
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IUser>('User', userSchema);
