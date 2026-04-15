const Task = require('../models/Task');
const Action = require('../models/Action');
const Dream = require('../models/Dream');
const { validationResult } = require('express-validator');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, priority, dueDate, actionId, dreamId, notes, estimatedTime } = req.body;

    // Verify action belongs to user (if provided)
    if (actionId) {
      const action = await Action.findOne({ _id: actionId, userId: req.user.id });
      if (!action) {
        return res.status(404).json({ success: false, message: 'Action not found or does not belong to you' });
      }
    }

    // Verify dream belongs to user (if provided)
    if (dreamId) {
      const dream = await Dream.findOne({ _id: dreamId, userId: req.user.id });
      if (!dream) {
        return res.status(404).json({ success: false, message: 'Dream not found or does not belong to you' });
      }
    }

    // If actionId is provided, override dreamId with action's dreamId (if it has one)
    let finalDreamId = dreamId;
    if (actionId) {
      const action = await Action.findById(actionId);
      if (action.dreamId) {
        finalDreamId = action.dreamId;
      }
    }

    const task = new Task({
      userId: req.user.id,
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      actionId: actionId || null,
      dreamId: finalDreamId || null,
      notes,
      estimatedTime,
    });

    await task.save();
    await task.populate(['actionId', 'dreamId']);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
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
    const { isCompleted, priority, actionId, dreamId, sortBy } = req.query;

    // Build filter object
    const filter = { userId: req.user.id };

    if (isCompleted !== undefined) {
      filter.isCompleted = isCompleted === 'true';
    }
    if (priority) {
      filter.priority = priority;
    }
    if (actionId) {
      filter.actionId = actionId;
    }
    if (dreamId) {
      filter.dreamId = dreamId;
    }

    // Build sort object
    let sortObject = { dueDate: 1, createdAt: -1 }; // Default: by due date
    if (sortBy) {
      switch (sortBy) {
        case 'priority':
          sortObject = { priority: 1 };
          break;
        case 'dueDate':
          sortObject = { dueDate: 1 };
          break;
        case 'completed':
          sortObject = { isCompleted: 1 };
          break;
        case 'newest':
          sortObject = { createdAt: -1 };
          break;
        default:
          sortObject = { dueDate: 1, createdAt: -1 };
      }
    }

    const tasks = await Task.find(filter)
      .sort(sortObject)
      .populate('actionId', 'title priority status')
      .populate('dreamId', 'title subTitle priority status');

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
    })
      .populate('actionId', 'title priority status')
      .populate('dreamId', 'title subTitle priority status');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
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

    // Verify action belongs to user
    const action = await Action.findOne({ _id: actionId, userId: req.user.id });
    if (!action) {
      return res.status(404).json({ success: false, message: 'Action not found' });
    }

    const tasks = await Task.find({ actionId, userId: req.user.id })
      .sort({ dueDate: 1 })
      .populate('dreamId', 'title subTitle');

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

// @desc    Get tasks for specific dream
// @route   GET /api/tasks/dream/:dreamId
// @access  Private
exports.getTasksByDream = async (req, res) => {
  try {
    const { dreamId } = req.params;

    // Verify dream belongs to user
    const dream = await Dream.findOne({ _id: dreamId, userId: req.user.id });
    if (!dream) {
      return res.status(404).json({ success: false, message: 'Dream not found' });
    }

    const tasks = await Task.find({ dreamId, userId: req.user.id })
      .sort({ dueDate: 1 })
      .populate('actionId', 'title priority status');

    res.status(200).json({
      success: true,
      count: tasks.length,
      dreamTitle: dream.title,
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
    const { title, description, priority, dueDate, actionId, dreamId, notes, estimatedTime, timeSpent } = req.body;

    // Find task
    let task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // If actionId is being changed, verify new action belongs to user
    if (actionId && actionId !== task.actionId?.toString()) {
      const action = await Action.findOne({ _id: actionId, userId: req.user.id });
      if (!action) {
        return res.status(404).json({ success: false, message: 'Action not found or does not belong to you' });
      }
    }

    // If dreamId is being changed, verify new dream belongs to user
    if (dreamId && dreamId !== task.dreamId?.toString()) {
      const dream = await Dream.findOne({ _id: dreamId, userId: req.user.id });
      if (!dream) {
        return res.status(404).json({ success: false, message: 'Dream not found or does not belong to you' });
      }
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (actionId !== undefined) task.actionId = actionId || null;
    if (dreamId !== undefined) task.dreamId = dreamId || null;
    if (notes !== undefined) task.notes = notes;
    if (estimatedTime !== undefined) task.estimatedTime = estimatedTime;
    if (timeSpent !== undefined) task.timeSpent = timeSpent;

    await task.save();
    await task.populate(['actionId', 'dreamId']);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle task completion status
// @route   PUT /api/tasks/:id/toggle
// @access  Private
exports.toggleTaskCompletion = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Toggle completion
    task.isCompleted = !task.isCompleted;

    // Set or unset completion date
    if (task.isCompleted) {
      task.completedDate = new Date();
    } else {
      task.completedDate = null;
    }

    await task.save();
    await task.populate(['actionId', 'dreamId']);

    res.status(200).json({
      success: true,
      message: `Task marked as ${task.isCompleted ? 'completed' : 'not completed'}`,
      task,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add time spent on task
// @route   PUT /api/tasks/:id/add-time
// @access  Private
exports.addTimeSpent = async (req, res) => {
  try {
    const { minutes } = req.body;

    if (!minutes || minutes < 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid minutes' });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $inc: { timeSpent: minutes } },
      { new: true, runValidators: true }
    ).populate(['actionId', 'dreamId']);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: `Added ${minutes} minutes to task`,
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
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
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
      completedTasks: 0,
      incompleteTasks: 0,
      byPriority: {},
      standalone: 0,
      linkedToAction: 0,
      linkedToDream: 0,
      totalTimeSpent: 0,
      averageTimePerTask: 0,
      overdue: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      if (task.isCompleted) {
        stats.completedTasks++;
      } else {
        stats.incompleteTasks++;
      }

      // Count by priority
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;

      // Count by link type
      if (task.actionId) {
        stats.linkedToAction++;
      } else if (task.dreamId) {
        stats.linkedToDream++;
      } else {
        stats.standalone++;
      }

      // Sum time spent
      stats.totalTimeSpent += task.timeSpent;

      // Count overdue
      if (task.dueDate && task.dueDate < today && !task.isCompleted) {
        stats.overdue++;
      }
    });

    // Calculate average time
    if (tasks.length > 0) {
      stats.averageTimePerTask = Math.round(stats.totalTimeSpent / tasks.length);
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
