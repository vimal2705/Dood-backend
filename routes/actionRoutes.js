const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createAction,
  getAllActions,
  getActionById,
  getActionsByDream,
  updateAction,
  deleteAction,
  getActionStats,
  addNoteToAction,
  removeNoteFromAction,
} = require("../controllers/actionController");
const auth = require("../middleware/auth");

// Validation middleware
const createActionValidation = [
  body("title", "Title is required and must be a string").trim().notEmpty(),
  body("deadlineDate", "Deadline date must be a valid date")
    .optional()
    .isISO8601(),
  body("dreamId", "Dream id must be a valid id").optional().isMongoId(),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
];

const updateActionValidation = [
  body("title", "Title must be a string").optional().trim().notEmpty(),
  body("deadlineDate", "Deadline date must be a valid date")
    .optional()
    .isISO8601(),
  body("dreamId", "Dream id must be a valid id").optional().isMongoId(),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
];

// All routes require authentication
router.use(auth);

// Action routes
router.post("/", createActionValidation, createAction);
router.get("/", getAllActions);
router.get("/stats/summary", getActionStats);
router.get("/dream/:dreamId", getActionsByDream);
router.get("/:id", getActionById);
router.put("/:id", updateActionValidation, updateAction);
router.delete("/:id", deleteAction);

module.exports = router;
