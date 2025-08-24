import mongoose, { Document, Schema } from 'mongoose';

export interface ISchedule extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isActive: boolean;
  timeBlocks: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    subject: string;
    taskId?: mongoose.Types.ObjectId;
    type: 'study' | 'break' | 'exercise' | 'other';
    priority: 'low' | 'medium' | 'high';
    notes?: string;
  }[];
  recurring: {
    isRecurring: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    startDate: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // For weekly recurrence
  };
  exceptions: {
    date: Date;
    reason: string;
    action: 'skip' | 'modify';
    modifiedTimeBlocks?: {
      startTime: string;
      endTime: string;
      subject: string;
      type: 'study' | 'break' | 'exercise' | 'other';
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new Schema<ISchedule>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  timeBlocks: [{
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    type: {
      type: String,
      enum: ['study', 'break', 'exercise', 'other'],
      default: 'study'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }]
  },
  exceptions: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    action: {
      type: String,
      enum: ['skip', 'modify'],
      default: 'skip'
    },
    modifiedTimeBlocks: [{
      startTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      endTime: {
        type: String,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      },
      subject: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        enum: ['study', 'break', 'exercise', 'other']
      }
    }]
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
scheduleSchema.index({ userId: 1, isActive: 1 });
scheduleSchema.index({ userId: 1, 'recurring.startDate': 1 });
scheduleSchema.index({ userId: 1, 'timeBlocks.dayOfWeek': 1 });

// Virtual for total study time per week
scheduleSchema.virtual('weeklyStudyTime').get(function() {
  return this.timeBlocks
    .filter(block => block.type === 'study')
    .reduce((total, block) => {
      const start = this.parseTime(block.startTime);
      const end = this.parseTime(block.endTime);
      const duration = (end - start) / (1000 * 60); // Convert to minutes
      return total + duration;
    }, 0);
});

// Virtual for schedule conflicts
scheduleSchema.virtual('hasConflicts').get(function() {
  const blocksByDay = {};
  
  for (const block of this.timeBlocks) {
    if (!blocksByDay[block.dayOfWeek]) {
      blocksByDay[block.dayOfWeek] = [];
    }
    blocksByDay[block.dayOfWeek].push(block);
  }
  
  for (const day in blocksByDay) {
    const blocks = blocksByDay[day].sort((a, b) => 
      this.parseTime(a.startTime) - this.parseTime(b.startTime)
    );
    
    for (let i = 0; i < blocks.length - 1; i++) {
      const currentEnd = this.parseTime(blocks[i].endTime);
      const nextStart = this.parseTime(blocks[i + 1].startTime);
      
      if (currentEnd > nextStart) {
        return true;
      }
    }
  }
  
  return false;
});

// Helper method to parse time strings
scheduleSchema.methods.parseTime = function(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

// Method to add time block
scheduleSchema.methods.addTimeBlock = function(timeBlock: any) {
  this.timeBlocks.push(timeBlock);
  return this.save();
};

// Method to remove time block
scheduleSchema.methods.removeTimeBlock = function(blockId: string) {
  this.timeBlocks = this.timeBlocks.filter(block => 
    block._id.toString() !== blockId
  );
  return this.save();
};

// Method to toggle schedule active status
scheduleSchema.methods.toggleActive = function() {
  this.isActive = !this.isActive;
  return this.save();
};

export default mongoose.model<ISchedule>('Schedule', scheduleSchema);
