const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    dreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dream',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Please provide an action title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['not started', 'in progress', 'completed'],
      default: 'not started',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    timeline: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for better query performance
actionSchema.index({ userId: 1, dreamId: 1 });
actionSchema.index({ userId: 1, status: 1 });
actionSchema.index({ userId: 1, priority: 1 });
actionSchema.index({ dueDate: 1 });

// Populate dream details when fetching actions
actionSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'dreamId',
    select: 'title subTitle priority status',
  });
  next();
});

module.exports = mongoose.model('Action', actionSchema);
