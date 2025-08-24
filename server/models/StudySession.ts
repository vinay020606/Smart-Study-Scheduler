import mongoose, { Document, Schema } from 'mongoose';

export interface IStudySession extends Document {
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  subject: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  status: 'active' | 'paused' | 'completed' | 'interrupted';
  breaks: {
    startTime: Date;
    endTime: Date;
    duration: number;
  }[];
  notes?: string;
  productivity: number; // 1-10 scale
  distractions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studySessionSchema = new Schema<IStudySession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'interrupted'],
    default: 'active'
  },
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  notes: {
    type: String,
    trim: true
  },
  productivity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  distractions: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
studySessionSchema.index({ userId: 1, startTime: -1 });
studySessionSchema.index({ userId: 1, subject: 1 });
studySessionSchema.index({ userId: 1, status: 1 });
studySessionSchema.index({ taskId: 1 });

// Virtual for formatted duration
studySessionSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for total break time
studySessionSchema.virtual('totalBreakTime').get(function() {
  return this.breaks.reduce((total, break_) => total + break_.duration, 0);
});

// Virtual for net study time
studySessionSchema.virtual('netStudyTime').get(function() {
  return this.duration - this.totalBreakTime;
});

// Virtual for session progress
studySessionSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'paused') return 50;
  if (this.status === 'interrupted') return 0;
  
  // Calculate progress based on elapsed time
  const elapsed = Date.now() - this.startTime.getTime();
  const elapsedMinutes = Math.floor(elapsed / (1000 * 60));
  return Math.min(Math.round((elapsedMinutes / this.duration) * 100), 99);
});

// Method to pause session
studySessionSchema.methods.pauseSession = function() {
  this.status = 'paused';
  return this.save();
};

// Method to resume session
studySessionSchema.methods.resumeSession = function() {
  this.status = 'active';
  return this.save();
};

// Method to complete session
studySessionSchema.methods.completeSession = function() {
  this.status = 'completed';
  this.endTime = new Date();
  return this.save();
};

// Method to add break
studySessionSchema.methods.addBreak = function(startTime: Date, endTime: Date) {
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  this.breaks.push({ startTime, endTime, duration });
  return this.save();
};

export default mongoose.model<IStudySession>('StudySession', studySessionSchema);
