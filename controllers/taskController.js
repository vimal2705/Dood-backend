const Task = require("../models/Task");
const Action = require("../models/Action");
const { validationResult } = require("express-validator");

const normalizeObjectId = (value) => {
  if (!value) return null;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const areDatesEqual = (a, b) => {
  const aTime = a ? new Date(a).getTime() : null;
  const bTime = b ? new Date(b).getTime() : null;
  return aTime === bTime;
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      date,
      status,
      priority,
      isCompleted,
      completedDate,
      actionId,
      inputs,
    } = req.body;

    if (actionId) {
      const action = await Action.findOne({
        _id: actionId,
        userId: req.user.id,
      });
      if (!action) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Action not found or does not belong to you",
          });
      }
    }

    const task = new Task({
      userId: req.user.id,
      title,
      date,
      status: status || "not started",
      priority: priority || "medium",
      isCompleted: isCompleted || status === "completed",
      completedDate:
        completedDate ||
        (isCompleted || status === "completed" ? new Date() : null),
      actionId: actionId || null,
      inputs,
    });

    await task.save();

    if (task.actionId) {
      await Action.updateOne(
        { _id: task.actionId, userId: req.user.id },
        { $addToSet: { tasks: task._id } },
      );
    }

    await task.populate("actionId", "title deadlineDate");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      isCompleted,
      actionId,
      sortBy,
      date,
      dateFrom,
      dateTo,
    } = req.query;

    const filter = { userId: req.user.id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (isCompleted !== undefined) filter.isCompleted = isCompleted === "true";
    if (actionId) filter.actionId = actionId;

    // Date-wise filter
    if (date) {
      const start = new Date(date);
      start.setUTCHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setUTCHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    let sortObject = { date: 1, createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case "title":
          sortObject = { title: 1 };
          break;
        case "date":
          sortObject = { date: 1 };
          break;
        case "priority":
          sortObject = { priority: 1 };
          break;
        case "status":
          sortObject = { status: 1 };
          break;
        case "completed":
          sortObject = { isCompleted: 1 };
          break;
        case "updatedAt":
          sortObject = { updatedAt: -1 };
          break;
        default:
          sortObject = { date: 1, createdAt: -1 };
      }
    }

    const tasks = await Task.find(filter)
      .sort(sortObject)
      .populate("actionId", "title deadlineDate");

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).populate("actionId", "title deadlineDate");

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks for specific action
// @route   GET /api/tasks/action/:actionId
// @access  Private
exports.getTasksByAction = async (req, res) => {
  try {
    const { actionId } = req.params;

    const action = await Action.findOne({ _id: actionId, userId: req.user.id });
    if (!action) {
      return res
        .status(404)
        .json({ success: false, message: "Action not found" });
    }

    const tasks = await Task.find({ actionId, userId: req.user.id })
      .sort({ date: 1 })
      .populate("actionId", "title deadlineDate");

    res.status(200).json({
      success: true,
      count: tasks.length,
      actionTitle: action.title,
      tasks,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      date,
      status,
      priority,
      isCompleted,
      completedDate,
      actionId,
      inputs,
      deadlineChangeReason,
    } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const previousActionId = normalizeObjectId(task.actionId);
    const nextActionId =
      actionId === undefined ? previousActionId : normalizeObjectId(actionId);

    if (nextActionId && nextActionId !== previousActionId) {
      const action = await Action.findOne({
        _id: nextActionId,
        userId: req.user.id,
      });
      if (!action) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Action not found or does not belong to you",
          });
      }
    }

    if (date !== undefined && !areDatesEqual(task.date, date)) {
      if (!deadlineChangeReason || !String(deadlineChangeReason).trim()) {
        return res.status(400).json({
          success: false,
          message: "Reason is required when task date is changed",
        });
      }

      task.deadlineChanges.push({
        previousDate: task.date || null,
        newDate: date || null,
        reason: String(deadlineChangeReason).trim(),
        changedAt: new Date(),
      });
    }

    if (title !== undefined) task.title = title;
    if (date !== undefined) task.date = date;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (isCompleted !== undefined) task.isCompleted = isCompleted;
    if (completedDate !== undefined) task.completedDate = completedDate || null;
    if (actionId !== undefined) task.actionId = nextActionId || null;
    if (inputs !== undefined) task.inputs = inputs;

    if (status === "completed") {
      task.isCompleted = true;
      if (!task.completedDate) {
        task.completedDate = new Date();
      }
    } else if (
      status !== undefined &&
      status !== "completed" &&
      isCompleted === undefined &&
      completedDate === undefined
    ) {
      task.isCompleted = false;
      task.completedDate = null;
    }

    if (isCompleted === true && !task.completedDate) {
      task.completedDate = new Date();
    }

    if (
      isCompleted === false &&
      completedDate === undefined &&
      status !== "completed"
    ) {
      task.completedDate = null;
    }

    await task.save();

    if (nextActionId !== previousActionId) {
      if (previousActionId) {
        await Action.updateOne(
          { _id: previousActionId, userId: req.user.id },
          { $pull: { tasks: task._id } },
        );
      }
      if (nextActionId) {
        await Action.updateOne(
          { _id: nextActionId, userId: req.user.id },
          { $addToSet: { tasks: task._id } },
        );
      }
    }

    await task.populate("actionId", "title deadlineDate");

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res
        .status(404)
        .json({ success: false, message: "Task not found" });
    }

    const linkedActionId = normalizeObjectId(task.actionId);
    if (linkedActionId) {
      await Action.updateOne(
        { _id: linkedActionId, userId: req.user.id },
        { $pull: { tasks: task._id } },
      );
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      taskId: task._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats/summary
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });

    const stats = {
      totalTasks: tasks.length,
      byStatus: {},
      byPriority: {},
      linkedToAction: 0,
      standAlone: 0,
      completedTasks: 0,
      incompleteTasks: 0,
      totalInputStories: 0,
      overdue: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      stats.byPriority[task.priority] =
        (stats.byPriority[task.priority] || 0) + 1;

      if (task.isCompleted) {
        stats.completedTasks++;
      } else {
        stats.incompleteTasks++;
      }

      if (task.actionId) {
        stats.linkedToAction++;
      } else {
        stats.standAlone++;
      }

      stats.totalInputStories += Array.isArray(task.inputs)
        ? task.inputs.length
        : 0;

      if (task.date && task.date < today && !task.isCompleted) {
        stats.overdue++;
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
