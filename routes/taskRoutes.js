const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByAction,
  getTasksByDream,
  updateTask,
  toggleTaskCompletion,
  addTimeSpent,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// Validation middleware
const createTaskValidation = [
  body('title', 'Title is required and must be a string').trim().notEmpty(),
  body('priority', 'Priority must be one of: low, medium, high')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('dueDate', 'Due date must be a valid date').optional().isISO8601(),
  body('estimatedTime', 'Estimated time must be a positive number').optional().isInt({ min: 0 }),
];

const updateTaskValidation = [
  body('title', 'Title must be a string').optional().trim().notEmpty(),
  body('priority', 'Priority must be one of: low, medium, high')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('dueDate', 'Due date must be a valid date').optional().isISO8601(),
  body('estimatedTime', 'Estimated time must be a positive number').optional().isInt({ min: 0 }),
  body('timeSpent', 'Time spent must be a positive number').optional().isInt({ min: 0 }),
];

const addTimeValidation = [
  body('minutes', 'Minutes must be a positive number').isInt({ min: 1 }),
];

// All routes require authentication
router.use(auth);

// Task routes
router.post('/', createTaskValidation, createTask);
router.get('/', getAllTasks);
router.get('/stats/summary', getTaskStats);
router.get('/action/:actionId', getTasksByAction);
router.get('/dream/:dreamId', getTasksByDream);
router.get('/:id', getTaskById);
router.put('/:id', updateTaskValidation, updateTask);
router.put('/:id/toggle', toggleTaskCompletion);
router.put('/:id/add-time', addTimeValidation, addTimeSpent);
router.delete('/:id', deleteTask);

module.exports = router;
