const Dream = require('../models/Dream');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create a new dream
// @route   POST /api/dreams
// @access  Private
exports.createDream = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, subTitle, description, image, priority, type, status, targetDate, notes } = req.body;

    // Check if priority is "top" and user already has a "top" dream
    if (priority === 'top') {
      const existingTopDream = await Dream.findOne({ userId: req.user.id, priority: 'top' });
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
      subTitle,
      description,
      image,
      priority: priority || 'medium',
      type,
      status: status || 'in progress',
      targetDate,
      notes,
    });

    await dream.save();

    res.status(201).json({
      success: true,
      message: 'Dream created successfully',
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
        case 'priority':
          sortObject = { priority: 1 };
          break;
        case 'timeline':
          sortObject = { timeline: -1 };
          break;
        case 'targetDate':
          sortObject = { targetDate: 1 };
          break;
        case 'progress':
          sortObject = { progress: -1 };
          break;
        default:
          sortObject = { createdAt: -1 };
      }
    }

    const dreams = await Dream.find(filter)
      .sort(sortObject)
      .populate('userId', 'name email');

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
    }).populate('userId', 'name email');

    if (!dream) {
      return res.status(404).json({ success: false, message: 'Dream not found' });
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
    const { title, subTitle, description, image, priority, type, status, targetDate, progress, notes } = req.body;

    // Find dream
    let dream = await Dream.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!dream) {
      return res.status(404).json({ success: false, message: 'Dream not found' });
    }

    // If changing priority to "top", make sure no other dream has "top"
    if (priority === 'top' && dream.priority !== 'top') {
      const existingTopDream = await Dream.findOne({
        userId: req.user.id,
        priority: 'top',
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
    if (subTitle !== undefined) dream.subTitle = subTitle;
    if (description !== undefined) dream.description = description;
    if (image !== undefined) dream.image = image;
    if (priority !== undefined) dream.priority = priority;
    if (type !== undefined) dream.type = type;
    if (status !== undefined) dream.status = status;
    if (targetDate !== undefined) dream.targetDate = targetDate;
    if (progress !== undefined) dream.progress = progress;
    if (notes !== undefined) dream.notes = notes;

    await dream.save();

    res.status(200).json({
      success: true,
      message: 'Dream updated successfully',
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
      return res.status(404).json({ success: false, message: 'Dream not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Dream deleted successfully',
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
      averageProgress: 0,
    };

    let totalProgress = 0;

    dreams.forEach((dream) => {
      // Count by type
      stats.byType[dream.type] = (stats.byType[dream.type] || 0) + 1;

      // Count by status
      stats.byStatus[dream.status] = (stats.byStatus[dream.status] || 0) + 1;

      // Count by priority
      stats.byPriority[dream.priority] = (stats.byPriority[dream.priority] || 0) + 1;

      // Sum progress
      totalProgress += dream.progress;
    });

    // Calculate average progress
    if (dreams.length > 0) {
      stats.averageProgress = Math.round(totalProgress / dreams.length);
    }

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update dream progress
// @route   PATCH /api/dreams/:id/progress
// @access  Private
exports.updateDreamProgress = async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide progress value' });
    }

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ success: false, message: 'Progress must be between 0 and 100' });
    }

    const dream = await Dream.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { progress },
      { new: true, runValidators: true }
    );

    if (!dream) {
      return res.status(404).json({ success: false, message: 'Dream not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Dream progress updated',
      dream,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

