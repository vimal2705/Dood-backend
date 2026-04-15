const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAction,
  getAllActions,
  getActionById,
  getActionsByDream,
  updateAction,
  deleteAction,
  completeAction,
  getActionStats,
  addNoteToAction,
  removeNoteFromAction,
} = require('../controllers/actionController');
const auth = require('../middleware/auth');

// Validation middleware
const createActionValidation = [
  body('title', 'Title is required and must be a string').trim().notEmpty(),
  body('priority', 'Priority must be one of: low, medium, high')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('status', 'Status must be one of: not started, in progress, completed')
    .optional()
    .isIn(['not started', 'in progress', 'completed']),
  body('dueDate', 'Due date must be a valid date').optional().isISO8601(),
];

const updateActionValidation = [
  body('title', 'Title must be a string').optional().trim().notEmpty(),
  body('priority', 'Priority must be one of: low, medium, high')
    .optional()
    .isIn(['low', 'medium', 'high']),
  body('status', 'Status must be one of: not started, in progress, completed')
    .optional()
    .isIn(['not started', 'in progress', 'completed']),
  body('dueDate', 'Due date must be a valid date').optional().isISO8601(),
];

// All routes require authentication
router.use(auth);

// Action routes
router.post('/', createActionValidation, createAction);
router.get('/', getAllActions);
router.get('/stats/summary', getActionStats);
router.get('/dream/:dreamId', getActionsByDream);
router.get('/:id', getActionById);
router.put('/:id', updateActionValidation, updateAction);
router.put('/:id/complete', completeAction);
router.delete('/:id', deleteAction);

module.exports = router;
