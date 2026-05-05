const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createDream,
  getAllDreams,
  getDreamById,
  updateDream,
  deleteDream,
  getDreamStats,
} = require("../controllers/dreamController");
const auth = require("../middleware/auth");

// Validation middleware
const createDreamValidation = [
  body("title", "Title is required and must be a string").trim().notEmpty(),
  body("description", "Description cannot be more than 1000 characters")
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body("plan", "Plan cannot be more than 5000 characters")
    .optional()
    .trim()
    .isLength({ max: 5000 }),
  body("imageUrl", "Image URL must be a string").optional().trim().isString(),
  body(
    "type",
    "Type must be one of: work, achievement, relation, finance, home",
  )
    .trim()
    .notEmpty()
    .isIn(["work", "achievement", "relation", "finance", "home"]),
  body("priority", "Priority must be one of: low, medium, high, top")
    .optional()
    .isIn(["low", "medium", "high", "top"]),
  body("status", "Status must be one of: in progress, slow down, boosted")
    .optional()
    .isIn(["in progress", "slow down", "boosted"]),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
  body("actions", "Actions must be an array").optional().isArray(),
  body("actions.*", "Each action must be a valid id").optional().isMongoId(),
];

const updateDreamValidation = [
  body("title", "Title must be a string").optional().trim().notEmpty(),
  body("description", "Description cannot be more than 1000 characters")
    .optional()
    .trim()
    .isLength({ max: 1000 }),
  body("plan", "Plan cannot be more than 5000 characters")
    .optional()
    .trim()
    .isLength({ max: 5000 }),
  body("imageUrl", "Image URL must be a string").optional().trim().isString(),
  body(
    "type",
    "Type must be one of: work, achievement, relation, finance, home",
  )
    .optional()
    .trim()
    .notEmpty()
    .isIn(["work", "achievement", "relation", "finance", "home"]),
  body("priority", "Priority must be one of: low, medium, high, top")
    .optional()
    .isIn(["low", "medium", "high", "top"]),
  body("status", "Status must be one of: in progress, slow down, boosted")
    .optional()
    .isIn(["in progress", "slow down", "boosted"]),
  body("inputs", "Inputs must be an array").optional().isArray(),
  body("inputs.*.story", "Each input story must be a non-empty string")
    .optional()
    .trim()
    .notEmpty(),
  body("inputs.*.date", "Each input date must be a valid date")
    .optional()
    .isISO8601(),
  body("actions", "Actions must be an array").optional().isArray(),
  body("actions.*", "Each action must be a valid id").optional().isMongoId(),
];

// All routes require authentication
router.use(auth);

// Dream routes
router.post("/", createDreamValidation, createDream);
router.get("/", getAllDreams);
router.get("/stats/summary", getDreamStats);
router.get("/:id", getDreamById);
router.put("/:id", updateDreamValidation, updateDream);
router.delete("/:id", deleteDream);

module.exports = router;
