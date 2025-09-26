const express = require("express");
const router = express.Router();

const {
  registerUser,
  registerManager,
  registerAdmin,
  login,
} = require("../controllers/authController");

const { emailValidator, passwordValidator } = require("../validators");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// NEW: rate limiters
const { registerLimiter, loginLimiter } = require("../middleware/rateLimiter");

// also used for the login password check
const { body } = require("express-validator");

// --- Registration routes ---
router.post(
  "/register-user",
  registerLimiter,
  [emailValidator, passwordValidator],
  registerUser
);

router.post(
  "/register-manager",
  protect,
  requireRole("admin"),
  registerLimiter,
  [emailValidator, passwordValidator],
  registerManager
);

router.post(
  "/register-admin",
  registerLimiter,
  [emailValidator, passwordValidator],
  registerAdmin
);

// --- Login route ---
router.post(
  "/login",
  loginLimiter,
  [emailValidator, body("password").notEmpty().trim().escape()],
  login
);

module.exports = router;