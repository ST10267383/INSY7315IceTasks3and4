// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  registerManager,
  registerAdmin,
  login,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

/* validators */
const emailValidator = body('email')
  .trim()
  .isEmail().withMessage('Email must be valid')
  .normalizeEmail();

const passwordValidator = body('password')
  .isString()
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[A-Za-z]/).withMessage('Password must include a letter')
  .matches(/\d/).withMessage('Password must include a number')
  .trim();

/* routes from the guide */

// public user registration
router.post('/register-user', [emailValidator, passwordValidator], registerUser);

// manager registration (admin only)
router.post(
  '/register-manager',
  protect,
  requireRole('admin'),
  [emailValidator, passwordValidator],
  registerManager
);

// admin registration (unprotected route, controller enforces bootstrap rule)
router.post('/register-admin', [emailValidator, passwordValidator], registerAdmin);

// login
router.post(
  '/login',
  [emailValidator, body('password').notEmpty().withMessage('Password required').trim()],
  login
);

module.exports = router;