const mongoose = require('mongoose');

const dreamSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a dream title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    subTitle: {
      type: String,
      required: [true, 'Please provide a dream subtitle'],
      trim: true,
      maxlength: [200, 'Subtitle cannot be more than 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    image: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'top'],
      default: 'medium',
    },
    type: {
      type: String,
      enum: ['work', 'achievement', 'relation', 'finance', 'home'],
      required: [true, 'Please specify dream type'],
    },
    status: {
      type: String,
      enum: ['in progress', 'slow down', 'boosted'],
      default: 'in progress',
    },
    timeline: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    actions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Action',
      },
    ],
  },
  { timestamps: true }
);

// Index for better query performance
dreamSchema.index({ userId: 1, priority: 1 });
dreamSchema.index({ userId: 1, type: 1 });
dreamSchema.index({ userId: 1, status: 1 });

// Middleware to ensure only one "top" priority dream per user
dreamSchema.pre('save', async function (next) {
  // Only proceed if priority is being changed to "top"
  if (this.priority === 'top' && this.isModified('priority')) {
    const Dream = mongoose.model('Dream');
    // Remove "top" priority from all other dreams of this user
    await Dream.updateMany(
      { userId: this.userId, _id: { $ne: this._id }, priority: 'top' },
      { priority: 'high' }
    );
  }
  next();
});

module.exports = mongoose.model('Dream', dreamSchema);
