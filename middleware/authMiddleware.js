// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, email, roles }

    // load the user to be safe / to have fresh roles
    const user = await User.findById(decoded.id).select('_id email roles');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = { id: user._id.toString(), email: user.email, roles: user.roles };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalid or expired' });
  }
};

module.exports = { protect };