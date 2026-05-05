const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    actionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Action",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Please provide a task title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed"],
      default: "not started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    inputs: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        story: {
          type: String,
          required: [true, "Input story is required"],
          trim: true,
          maxlength: [2000, "Input story cannot be more than 2000 characters"],
        },
      },
    ],
    deadlineChanges: [
      {
        previousDate: {
          type: Date,
          default: null,
        },
        newDate: {
          type: Date,
          default: null,
        },
        reason: {
          type: String,
          required: [true, "Reason is required when end date changes"],
          trim: true,
          maxlength: [500, "Reason cannot be more than 500 characters"],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Index for better query performance
taskSchema.index({ userId: 1, actionId: 1 });
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, isCompleted: 1 });
taskSchema.index({ date: 1 });

// Populate related data when fetching tasks
taskSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "actionId",
    select: "title deadlineDate",
  });
  next();
});

module.exports = mongoose.model("Task", taskSchema);
