const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
exports.register = async (req, res) => {
  // 1) validate request (from express-validator in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    // 2) unique email
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // 3) create user
    // NOTE: If your User schema hashes in a pre('save') hook and has comparePassword,
    // just pass the raw password here (as we do below).
    const user = await User.create({ name, email, password });

    // 4) issue token
    const token = signToken(user._id);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  // 1) validate request (from express-validator in routes)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // 2) find user (+password in case your schema sets select:false)
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // 3) verify password
    let ok = false;
    if (typeof user.comparePassword === 'function') {
      ok = await user.comparePassword(password);        // schema method
    } else {
      ok = await bcrypt.compare(password, user.password); // fallback
    }
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    // 4) token
    const token = signToken(user._id);

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};