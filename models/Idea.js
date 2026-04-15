const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    dreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dream',
      default: null,
      index: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'implemented'],
      default: 'active'
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50
      }
    ],
    category: {
      type: String,
      trim: true,
      maxlength: 100
    },
    implementation: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },
    timeline: {
      type: Date,
      default: () => new Date()
    }
  },
  { timestamps: true }
);

// Index for better query performance
ideaSchema.index({ userId: 1, status: 1 });
ideaSchema.index({ userId: 1, dreamId: 1 });
ideaSchema.index({ userId: 1, priority: 1 });

// Pre-populate dream information when fetching ideas
ideaSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'dreamId',
    select: 'title type priority'
  });
  next();
});

module.exports = mongoose.model('Idea', ideaSchema);
