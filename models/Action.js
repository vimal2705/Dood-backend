const mongoose = require("mongoose");

const actionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    dreamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dream",
      default: null,
    },
    title: {
      type: String,
      required: [true, "Please provide an action title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    deadlineDate: {
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
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true },
);

// Index for better query performance
actionSchema.index({ userId: 1, dreamId: 1 });
actionSchema.index({ deadlineDate: 1 });

// Populate dream details when fetching actions
actionSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: "dreamId",
    select: "title priority type status",
  });
  next();
});

module.exports = mongoose.model("Action", actionSchema);
