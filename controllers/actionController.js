const Action = require("../models/Action");
const Dream = require("../models/Dream");
const { validationResult } = require("express-validator");

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

// @desc    Create a new action
// @route   POST /api/actions
// @access  Private
exports.createAction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, deadlineDate, dreamId, inputs } = req.body;

    // If dreamId is provided, verify it belongs to the user
    if (dreamId) {
      const dream = await Dream.findOne({ _id: dreamId, userId: req.user.id });
      if (!dream) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Dream not found or does not belong to you",
          });
      }
    }

    const action = new Action({
      userId: req.user.id,
      title,
      deadlineDate,
      dreamId: dreamId || null,
      inputs,
    });

    await action.save();

    if (action.dreamId) {
      await Dream.updateOne(
        { _id: action.dreamId, userId: req.user.id },
        { $addToSet: { actions: action._id } },
      );
    }
    await action.populate("dreamId", "title priority type status");

    res.status(201).json({
      success: true,
      message: "Action created successfully",
      action,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all actions for a user
// @route   GET /api/actions
// @access  Private
exports.getAllActions = async (req, res) => {
  try {
    const { dreamId, sortBy } = req.query;

    // Build filter object
    const filter = { userId: req.user.id };

    if (dreamId) {
      filter.dreamId = dreamId;
    }

    // Build sort object
    let sortObject = { createdAt: -1 }; // Default: newest first
    if (sortBy) {
      switch (sortBy) {
        case "title":
          sortObject = { title: 1 };
          break;
        case "deadlineDate":
          sortObject = { deadlineDate: 1 };
          break;
        case "updatedAt":
          sortObject = { updatedAt: -1 };
          break;
        default:
          sortObject = { createdAt: -1 };
      }
    }

    const actions = await Action.find(filter)
      .sort(sortObject)
      .populate("userId", "name email")
      .populate("dreamId", "title priority type status")
      .populate(
        "tasks",
        "title date status priority isCompleted completedDate actionId",
      );

    res.status(200).json({
      success: true,
      count: actions.length,
      actions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single action by ID
// @route   GET /api/actions/:id
// @access  Private
exports.getActionById = async (req, res) => {
  try {
    const action = await Action.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })
      .populate("userId", "name email")
      .populate("dreamId", "title priority type status")
      .populate(
        "tasks",
        "title date status priority isCompleted completedDate actionId",
      );

    if (!action) {
      return res
        .status(404)
        .json({ success: false, message: "Action not found" });
    }

    res.status(200).json({
      success: true,
      action,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all actions for a specific dream
// @route   GET /api/actions/dream/:dreamId
// @access  Private
exports.getActionsByDream = async (req, res) => {
  try {
    const { dreamId } = req.params;

    // Verify dream belongs to user
    const dream = await Dream.findOne({ _id: dreamId, userId: req.user.id });
    if (!dream) {
      return res
        .status(404)
        .json({ success: false, message: "Dream not found" });
    }

    const actions = await Action.find({ dreamId, userId: req.user.id })
      .sort({ deadlineDate: 1 })
      .populate("dreamId", "title priority type status")
      .populate(
        "tasks",
        "title date status priority isCompleted completedDate actionId",
      );

    res.status(200).json({
      success: true,
      count: actions.length,
      dreamTitle: dream.title,
      actions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update action
// @route   PUT /api/actions/:id
// @access  Private
exports.updateAction = async (req, res) => {
  try {
    const { title, deadlineDate, dreamId, inputs } = req.body;

    // Find action
    let action = await Action.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!action) {
      return res
        .status(404)
        .json({ success: false, message: "Action not found" });
    }

    const previousDreamId = normalizeObjectId(action.dreamId);
    const nextDreamId =
      dreamId === undefined ? previousDreamId : normalizeObjectId(dreamId);

    // If dreamId is being changed, verify new dream belongs to user
    if (dreamId && nextDreamId !== previousDreamId) {
      const dream = await Dream.findOne({
        _id: nextDreamId,
        userId: req.user.id,
      });
      if (!dream) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Dream not found or does not belong to you",
          });
      }
    }

    // Update fields
    if (title !== undefined) action.title = title;
    if (deadlineDate !== undefined) action.deadlineDate = deadlineDate;
    if (dreamId !== undefined) action.dreamId = nextDreamId || null;
    if (inputs !== undefined) action.inputs = inputs;

    await action.save();

    if (nextDreamId !== previousDreamId) {
      if (previousDreamId) {
        await Dream.updateOne(
          { _id: previousDreamId, userId: req.user.id },
          { $pull: { actions: action._id } },
        );
      }
      if (nextDreamId) {
        await Dream.updateOne(
          { _id: nextDreamId, userId: req.user.id },
          { $addToSet: { actions: action._id } },
        );
      }
    }
    await action.populate("dreamId", "title priority type status");

    res.status(200).json({
      success: true,
      message: "Action updated successfully",
      action,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete action
// @route   DELETE /api/actions/:id
// @access  Private
exports.deleteAction = async (req, res) => {
  try {
    const action = await Action.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!action) {
      return res
        .status(404)
        .json({ success: false, message: "Action not found" });
    }

    const linkedDreamId = normalizeObjectId(action.dreamId);
    if (linkedDreamId) {
      await Dream.updateOne(
        { _id: linkedDreamId, userId: req.user.id },
        { $pull: { actions: action._id } },
      );
    }

    res.status(200).json({
      success: true,
      message: "Action deleted successfully",
      actionId: action._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get action statistics
// @route   GET /api/actions/stats/summary
// @access  Private
exports.getActionStats = async (req, res) => {
  try {
    const actions = await Action.find({ userId: req.user.id });

    const stats = {
      totalActions: actions.length,
      connectedToDream: 0,
      standAlone: 0,
      totalInputStories: 0,
      dueSoon: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    actions.forEach((action) => {
      // Count connected vs standalone
      if (action.dreamId) {
        stats.connectedToDream++;
      } else {
        stats.standAlone++;
      }

      // Count all date-wise input stories
      stats.totalInputStories += Array.isArray(action.inputs)
        ? action.inputs.length
        : 0;

      // Count due soon
      if (action.deadlineDate) {
        const deadlineDate = new Date(action.deadlineDate);
        if (deadlineDate <= nextWeek && deadlineDate > today) {
          stats.dueSoon++;
        }
      }
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
