const Dream = require("../models/Dream");
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Create a new dream
// @route   POST /api/dreams
// @access  Private
exports.createDream = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      plan,
      imageUrl,
      priority,
      type,
      status,
      inputs,
      actions,
    } = req.body;

    // Check if priority is "top" and user already has a "top" dream
    if (priority === "top") {
      const existingTopDream = await Dream.findOne({
        userId: req.user.id,
        priority: "top",
      });
      if (existingTopDream) {
        return res.status(400).json({
          success: false,
          message: 'You can only have one dream with "top" priority',
        });
      }
    }

    const dream = new Dream({
      userId: req.user.id,
      title,
      description,
      plan,
      imageUrl,
      priority: priority || "medium",
      type,
      status: status || "in progress",
      inputs,
      actions,
    });

    await dream.save();

    res.status(201).json({
      success: true,
      message: "Dream created successfully",
      dream,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all dreams for a user
// @route   GET /api/dreams
// @access  Private
exports.getAllDreams = async (req, res) => {
  try {
    const { type, status, priority, sortBy } = req.query;

    // Build filter object
    const filter = { userId: req.user.id };

    if (type) {
      filter.type = type;
    }
    if (status) {
      filter.status = status;
    }
    if (priority) {
      filter.priority = priority;
    }

    // Build sort object
    let sortObject = { createdAt: -1 }; // Default: newest first
    if (sortBy) {
      switch (sortBy) {
        case "priority":
          sortObject = { priority: 1 };
          break;
        case "type":
          sortObject = { type: 1 };
          break;
        case "status":
          sortObject = { status: 1 };
          break;
        case "updatedAt":
          sortObject = { updatedAt: -1 };
          break;
        default:
          sortObject = { createdAt: -1 };
      }
    }

    const dreams = await Dream.find(filter)
      .sort(sortObject)
      .populate("userId", "name email");

    res.status(200).json({
      success: true,
      count: dreams.length,
      dreams,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single dream by ID
// @route   GET /api/dreams/:id
// @access  Private
exports.getDreamById = async (req, res) => {
  try {
    const dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("userId", "name email");

    if (!dream) {
      return res
        .status(404)
        .json({ success: false, message: "Dream not found" });
    }

    res.status(200).json({
      success: true,
      dream,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dream
// @route   PUT /api/dreams/:id
// @access  Private
exports.updateDream = async (req, res) => {
  try {
    const {
      title,
      description,
      plan,
      imageUrl,
      priority,
      type,
      status,
      inputs,
      actions,
    } = req.body;

    // Find dream
    let dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dream) {
      return res
        .status(404)
        .json({ success: false, message: "Dream not found" });
    }

    // If changing priority to "top", make sure no other dream has "top"
    if (priority === "top" && dream.priority !== "top") {
      const existingTopDream = await Dream.findOne({
        userId: req.user.id,
        priority: "top",
        _id: { $ne: req.params.id },
      });
      if (existingTopDream) {
        return res.status(400).json({
          success: false,
          message: 'You can only have one dream with "top" priority',
        });
      }
    }

    // Update fields
    if (title !== undefined) dream.title = title;
    if (description !== undefined) dream.description = description;
    if (plan !== undefined) dream.plan = plan;
    if (imageUrl !== undefined) dream.imageUrl = imageUrl;
    if (priority !== undefined) dream.priority = priority;
    if (type !== undefined) dream.type = type;
    if (status !== undefined) dream.status = status;
    if (inputs !== undefined) dream.inputs = inputs;
    if (actions !== undefined) dream.actions = actions;

    await dream.save();

    res.status(200).json({
      success: true,
      message: "Dream updated successfully",
      dream,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete dream
// @route   DELETE /api/dreams/:id
// @access  Private
exports.deleteDream = async (req, res) => {
  try {
    const dream = await Dream.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dream) {
      return res
        .status(404)
        .json({ success: false, message: "Dream not found" });
    }

    res.status(200).json({
      success: true,
      message: "Dream deleted successfully",
      dreamId: dream._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dreams statistics for user
// @route   GET /api/dreams/stats/summary
// @access  Private
exports.getDreamStats = async (req, res) => {
  try {
    const dreams = await Dream.find({ userId: req.user.id });

    const stats = {
      totalDreams: dreams.length,
      byType: {},
      byStatus: {},
      byPriority: {},
      totalInputStories: 0,
    };

    dreams.forEach((dream) => {
      // Count by type
      stats.byType[dream.type] = (stats.byType[dream.type] || 0) + 1;

      // Count by status
      stats.byStatus[dream.status] = (stats.byStatus[dream.status] || 0) + 1;

      // Count by priority
      stats.byPriority[dream.priority] =
        (stats.byPriority[dream.priority] || 0) + 1;

      // Count all date-wise input stories
      stats.totalInputStories += Array.isArray(dream.inputs)
        ? dream.inputs.length
        : 0;
    });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
