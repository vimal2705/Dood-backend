const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyOtpAndReset,
  getMe,
  getMeWithToken,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

// Validation middleware
const signupValidation = [
  body("name", "Name is required").trim().notEmpty(),
  body("email", "Invalid email").isEmail(),
  body("username", "Username must be at least 3 characters").isLength({
    min: 3,
  }),
  body("password", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
  body("phoneNumber", "Phone number must be 10 digits").matches(/^\d{10}$/),
  body("dob", "Date of birth is required").isISO8601(),
];

const loginValidation = [
  body("email", "Invalid email").isEmail(),
  body("password", "Password is required").notEmpty(),
];

const verifyOtpValidation = [
  body("email", "Invalid email").isEmail(),
  body("otp", "OTP is required").notEmpty(),
];

const resetPasswordValidation = [
  body("email", "Invalid email").isEmail(),
  body("resetToken", "Reset token is required").notEmpty(),
  body("newPassword", "Password must be at least 6 characters").isLength({
    min: 6,
  }),
];

// Routes
router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtpValidation, verifyOtp);
router.post("/reset-password", resetPasswordValidation, resetPassword);
router.post(
  "/verify-otp-and-reset",
  [
    body("email", "Invalid email").isEmail(),
    body("otp", "OTP is required").notEmpty(),
    body("newPassword", "Password must be at least 6 characters").isLength({
      min: 6,
    }),
  ],
  verifyOtpAndReset,
);
router.get("/me", auth, getMe);
router.post("/me-with-token", getMeWithToken);

module.exports = router;
