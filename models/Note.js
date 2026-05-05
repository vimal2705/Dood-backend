const mongoose = require("mongoose");

const linkedTypeToModelMap = {
  dream: "Dream",
  action: "Action",
  task: "Task",
  idea: "Idea",
};

const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "Please provide note content"],
      trim: true,
      maxlength: [1000, "Note cannot be more than 1000 characters"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, "Title cannot be more than 120 characters"],
      default: "Untitled Note",
    },
    linkedType: {
      type: String,
      enum: ["dream", "action", "task", "idea", "standalone"],
      default: "standalone",
      required: true,
    },
    linkedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: function () {
        return linkedTypeToModelMap[this.linkedType] || null;
      },
      validate: {
        validator: function (value) {
          // If linkedType is not 'standalone', linkedId must exist
          if (this.linkedType !== "standalone" && !value) {
            return false;
          }
          // If linkedType is 'standalone', linkedId should be null
          if (this.linkedType === "standalone" && value) {
            return false;
          }
          return true;
        },
        message:
          "linkedId must be provided for linked notes and null for standalone notes",
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    timeline: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Indexes for better query performance
noteSchema.index({ userId: 1, linkedType: 1 });
noteSchema.index({ userId: 1, linkedId: 1 });
noteSchema.index({ userId: 1, title: 1 });
noteSchema.index({ userId: 1, priority: 1 });
noteSchema.index({ userId: 1, isPinned: 1 });
noteSchema.index({ linkedType: 1, linkedId: 1 });

// Pre-populate linked document information
noteSchema.pre(/^find/, function (next) {
  if (this.options._recursed) {
    return next();
  }

  // Only populate if linkedId exists
  if (
    this._conditions &&
    (this._conditions.linkedId || this._conditions["linkedId"])
  ) {
    this.populate({
      path: "linkedId",
      select: "title name content",
    });
  }
  next();
});

module.exports = mongoose.model("Note", noteSchema);
