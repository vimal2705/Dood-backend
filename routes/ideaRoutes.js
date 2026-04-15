const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const {
  createIdea,
  getAllIdeas,
  getIdeaById,
  getIdeasByDream,
  updateIdea,
  markAsImplemented,
  deleteIdea,
  getIdeaStats
} = require('../controllers/ideaController');

const router = express.Router();

// Validation middleware
const ideaValidationRules = () => {
  return [
    body('title').notEmpty().trim().isLength({ max: 200 }).withMessage('Title is required and max 200 characters'),
    body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
    body('status').optional().isIn(['active', 'archived', 'implemented']).withMessage('Status must be active, archived, or implemented'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('category').optional().trim().isLength({ max: 100 }).withMessage('Category max 100 characters'),
    body('implementation').optional().trim().isLength({ max: 1000 }).withMessage('Implementation max 1000 characters'),
    body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes max 1000 characters')
  ];
};

// Validation error handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// Routes
router.post('/', auth, ideaValidationRules(), validate, createIdea);
router.get('/', auth, getAllIdeas);
router.get('/stats/summary', auth, getIdeaStats);
router.get('/:id', auth, getIdeaById);
router.get('/dream/:dreamId', auth, getIdeasByDream);
router.put('/:id', auth, ideaValidationRules(), validate, updateIdea);
router.put('/:id/implement', auth, markAsImplemented);
router.delete('/:id', auth, deleteIdea);

module.exports = router;
