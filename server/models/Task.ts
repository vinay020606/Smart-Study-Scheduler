import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
  estimatedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  tags: string[];
  attachments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  estimatedDuration: {
    type: Number,
    required: true,
    min: 1
  },
  actualDuration: {
    type: Number,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, subject: 1 });
taskSchema.index({ userId: 1, priority: 1 });

// Virtual for formatted duration
taskSchema.virtual('formattedEstimatedDuration').get(function() {
  const hours = Math.floor(this.estimatedDuration / 60);
  const minutes = this.estimatedDuration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for formatted actual duration
taskSchema.virtual('formattedActualDuration').get(function() {
  if (!this.actualDuration) return 'Not started';
  const hours = Math.floor(this.actualDuration / 60);
  const minutes = this.actualDuration % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  return this.status !== 'completed' && new Date() > this.dueDate;
});

// Method to update task status
taskSchema.methods.updateStatus = function(newStatus: 'pending' | 'in-progress' | 'completed') {
  this.status = newStatus;
  if (newStatus === 'completed' && !this.actualDuration) {
    this.actualDuration = this.estimatedDuration;
  }
  return this.save();
};

export default mongoose.model<ITask>('Task', taskSchema);
