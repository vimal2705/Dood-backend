const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    actionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Action',
      default: null,
    },
    dreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dream',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot be more than 300 characters'],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    timeSpent: {
      type: Number,
      default: 0,
      description: 'Time spent on task in minutes',
    },
    estimatedTime: {
      type: Number,
      default: null,
      description: 'Estimated time needed in minutes',
    },
    timeline: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for better query performance
taskSchema.index({ userId: 1, actionId: 1 });
taskSchema.index({ userId: 1, dreamId: 1 });
taskSchema.index({ userId: 1, isCompleted: 1 });
taskSchema.index({ dueDate: 1 });

// Populate related data when fetching tasks
taskSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'actionId',
    select: 'title priority status',
  }).populate({
    path: 'dreamId',
    select: 'title subTitle priority status',
  });
  next();
});

module.exports = mongoose.model('Task', taskSchema);
