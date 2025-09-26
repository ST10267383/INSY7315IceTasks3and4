// controllers/authController.js
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

/* ---------- Register: normal user ---------- */
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({
      email,
      password,                        // hashed by pre('save')
      roles: [{ organisationId: null, role: 'user' }],
    });

    const token = generateToken(user);
    return res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};

/* ---------- Register: manager (admin only via route middleware) ---------- */
exports.registerManager = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const managerUser = await User.create({
      email,
      password,
      roles: [{ organisationId: null, role: 'manager' }],
    });

    const token = generateToken(managerUser);
    return res.status(201).json({ message: 'Manager registered', token });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err });
  }
};

/* ---------- Register: admin (bootstrap first admin; else only admins) ---------- */
exports.registerAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  const { email, password } = req.body;

  try {
    const adminExists = await User.exists({ 'roles.role': 'admin' });
    if (adminExists) {
      // Only an admin can create another admin once one exists
      const requestingUser = await User.findById(req.user?.id);
      const isAdmin = requestingUser?.roles?.some((r) => r.role === 'admin');
      if (!isAdmin) return res.status(403).json({ message: 'Only admins can create admins' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const adminUser = await User.create({
      email,
      password,
      roles: [{ organisationId: null, role: 'admin' }],
    });

    const token = generateToken(adminUser);
    return res.status(201).json({ message: 'Admin registered', token });
  } catch (err) {
    return res.status(500).json({ error: 'Server error: ' + err });
  }
};

/* ---------- Login ---------- */
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ message: 'Invalid input', errors: errors.array() });

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password roles email');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const ok = typeof user.comparePassword === 'function'
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password);

    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
};