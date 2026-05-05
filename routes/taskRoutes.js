const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createTask,
  getAllTasks,
  getTaskById,
  getTasksByAction,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");
const auth = require("../middleware/auth");

// Validation middleware
const createTaskValidation = [
  body("title", "Title is required and must be a string").trim().notEmpty(),
  body("date", "Date must be a valid date").optional().isISO8601(),
  body("status", "Status must be one of: not started, in progress, completed")
    .optional()
    .isIn(["not started", "in progress", "completed"]),
  body("priority", "Priority must be one of: low, medium, high")
    .optional()
    .isIn(["low", "medium", "high"]),
  body("isCompleted", "isCompleted must be a boolean").optional().isBoolean(),
  body("completedDate", "Completed date must be a valid date")
    .optional()
    .isISO8601(),
  body("actionId", "Action id must be a valid id").optional().isMongoId(),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
];

const updateTaskValidation = [
  body("title", "Title must be a string").optional().trim().notEmpty(),
  body("date", "Date must be a valid date").optional().isISO8601(),
  body("status", "Status must be one of: not started, in progress, completed")
    .optional()
    .isIn(["not started", "in progress", "completed"]),
  body("priority", "Priority must be one of: low, medium, high")
    .optional()
    .isIn(["low", "medium", "high"]),
  body("isCompleted", "isCompleted must be a boolean").optional().isBoolean(),
  body("completedDate", "Completed date must be a valid date")
    .optional()
    .isISO8601(),
  body("actionId", "Action id must be a valid id").optional().isMongoId(),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
  body("deadlineChangeReason", "Deadline change reason must be a string")
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 }),
];

// All routes require authentication
router.use(auth);

// Task routes
router.post("/", createTaskValidation, createTask);
router.get("/", getAllTasks);
router.get("/stats/summary", getTaskStats);
router.get("/action/:actionId", getTasksByAction);
router.get("/:id", getTaskById);
router.put("/:id", updateTaskValidation, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
