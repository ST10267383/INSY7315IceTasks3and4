// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * Validators
 * NOTE: Do NOT .escape() passwords (it mutates characters and will break login).
 */
const nameValidator = body('name')
  .trim()
  .notEmpty().withMessage('Name is required')
  .isLength({ max: 100 }).withMessage('Name is too long');

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

// Register
router.post('/register', [nameValidator, emailValidator, passwordValidator], register);

// Login (email + non-empty password)
router.post(
  '/login',
  [emailValidator, body('password').notEmpty().withMessage('Password is required').trim()],
  login
);

module.exports = router;