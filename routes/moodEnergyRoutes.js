const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const auth = require('../middleware/auth');
const {
  createMoodEnergyEntry,
  getMoodEnergyAverage,
} = require('../controllers/moodEnergyController');

const createEntryValidation = [
  body('energy', 'Energy is required').exists({ checkNull: true }),
  body('mood', 'Mood is required').exists({ checkNull: true }),
  body('recordedAt', 'recordedAt must be a valid ISO date').optional().isISO8601(),
];

const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.use(auth);

router.post('/', createEntryValidation, handleValidationErrors, createMoodEnergyEntry);
router.get('/average', getMoodEnergyAverage);

module.exports = router;
