const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createDream,
  getAllDreams,
  getDreamById,
  updateDream,
  deleteDream,
  getDreamStats,
  updateDreamProgress,
} = require('../controllers/dreamController');
const auth = require('../middleware/auth');

// Validation middleware
const createDreamValidation = [
  body('title', 'Title is required and must be a string').trim().notEmpty(),
  body('subTitle', 'Subtitle is required and must be a string').trim().notEmpty(),
  body('type', 'Type must be one of: work, achievement, relation, finance, home')
    .isIn(['work', 'achievement', 'relation', 'finance', 'home']),
  body('priority', 'Priority must be one of: low, medium, high, top')
    .optional()
    .isIn(['low', 'medium', 'high', 'top']),
  body('status', 'Status must be one of: in progress, slow down, boosted')
    .optional()
    .isIn(['in progress', 'slow down', 'boosted']),
  body('progress', 'Progress must be between 0 and 100').optional().isInt({ min: 0, max: 100 }),
];

const updateDreamValidation = [
  body('title', 'Title must be a string').optional().trim().notEmpty(),
  body('subTitle', 'Subtitle must be a string').optional().trim().notEmpty(),
  body('type', 'Type must be one of: work, achievement, relation, finance, home')
    .optional()
    .isIn(['work', 'achievement', 'relation', 'finance', 'home']),
  body('priority', 'Priority must be one of: low, medium, high, top')
    .optional()
    .isIn(['low', 'medium', 'high', 'top']),
  body('status', 'Status must be one of: in progress, slow down, boosted')
    .optional()
    .isIn(['in progress', 'slow down', 'boosted']),
  body('progress', 'Progress must be between 0 and 100').optional().isInt({ min: 0, max: 100 }),
];

const progressValidation = [
  body('progress', 'Progress must be between 0 and 100').isInt({ min: 0, max: 100 }),
];

// All routes require authentication
router.use(auth);

// Dream routes
router.post('/', createDreamValidation, createDream);
router.get('/', getAllDreams);
router.get('/stats/summary', getDreamStats);
router.get('/:id', getDreamById);
router.put('/:id', updateDreamValidation, updateDream);
router.delete('/:id', deleteDream);
router.patch('/:id/progress', progressValidation, updateDreamProgress);

module.exports = router;
