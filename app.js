const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware'); // ⬅️ add this

dotenv.config();

const app = express();

// Security & CORS
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'https://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// ✅ Protected test route
app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}! You have accessed protected data.`,
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
  res.send('PulseVote API running!');
});

module.exports = app;