const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth");
const {
  createNote,
  getAllNotes,
  getAllNoteTags,
  getNoteById,
  getNotesByResource,
  getStandaloneNotes,
  updateNote,
  togglePinNote,
  deleteNote,
  getNoteStats,
} = require("../controllers/noteController");

// Validation middleware
const createNoteValidation = [
  body("title", "Title must be a string and cannot be more than 120 characters")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 }),
  body("content", "Content is required and must be a string")
    .trim()
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage("Content cannot be more than 1000 characters"),
  body(
    "linkedType",
    "LinkedType must be dream, action, task, idea, or standalone",
  )
    .optional()
    .isIn(["dream", "action", "task", "idea", "standalone"]),
  body("tags", "Tags must be an array").optional().isArray(),
  body("priority", "Priority must be one of: low, medium, high")
    .optional()
    .isIn(["low", "medium", "high"]),
  body("isPinned", "IsPinned must be a boolean").optional().isBoolean(),
];

const updateNoteValidation = [
  body("title", "Title must be a string and cannot be more than 120 characters")
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 }),
  body("content", "Content must be a string")
    .optional()
    .trim()
    .notEmpty()
    .isLength({ max: 1000 })
    .withMessage("Content cannot be more than 1000 characters"),
  body("tags", "Tags must be an array").optional().isArray(),
  body("priority", "Priority must be one of: low, medium, high")
    .optional()
    .isIn(["low", "medium", "high"]),
  body("isPinned", "IsPinned must be a boolean").optional().isBoolean(),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require("express-validator");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// All routes require authentication
router.use(auth);

// Note routes
router.post("/", createNoteValidation, handleValidationErrors, createNote);
router.get("/", getAllNotes);
router.get("/tags/list", getAllNoteTags);
router.get("/stats/summary", getNoteStats);
router.get("/standalone/list", getStandaloneNotes);
router.get("/:id", getNoteById);
router.get("/:linkedType/:linkedId", getNotesByResource);
router.put("/:id", updateNoteValidation, handleValidationErrors, updateNote);
router.put("/:id/toggle-pin", togglePinNote);
router.delete("/:id", deleteNote);

module.exports = router;
