const mongoose = require('mongoose');

const moodEnergySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    // Levels are stored as numbers 1..5 for easy averaging.
    // 1 is the lowest, 5 is the highest.
    energy: {
      type: Number,
      required: [true, 'Energy level is required'],
      min: [1, 'Energy level must be between 1 and 5'],
      max: [5, 'Energy level must be between 1 and 5'],
    },
    mood: {
      type: Number,
      required: [true, 'Mood level is required'],
      min: [1, 'Mood level must be between 1 and 5'],
      max: [5, 'Mood level must be between 1 and 5'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // UTC day bucket derived from recordedAt (00:00:00.000Z)
    day: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

moodEnergySchema.index({ userId: 1, day: 1, recordedAt: -1 });

const toUtcDay = (date) => {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

moodEnergySchema.pre('validate', function (next) {
  if (!this.recordedAt) {
    this.recordedAt = new Date();
  }
  this.day = toUtcDay(this.recordedAt);
  next();
});

module.exports = mongoose.model('MoodEnergy', moodEnergySchema);
