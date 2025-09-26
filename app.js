const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const organisationRoutes = require('./routes/organisationRoutes');
const pollRoutes = require('./routes/pollRoutes');


const authRoutes = require('./routes/authRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

app.set("trust proxy", 1);

/* ---------------- Security headers ---------------- */
app.use(helmet());

// Content Security Policy (CSP)
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true, // includes default-src 'self', base-uri 'self', etc.
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'"], // no inline/remote scripts
      "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      "font-src": ["'self'", "https://fonts.gstatic.com"],
      "img-src": ["'self'", "data:"],
      "connect-src": [
        "'self'",
        "http://localhost:5173",
        "https://localhost:5173",
        "ws://localhost:5173",
        "wss://localhost:5173"
      ],
      "frame-ancestors": ["'self'"],
      "object-src": ["'none'"],
      // In production you can enable the next line to auto-upgrade http->https:
      // "upgrade-insecure-requests": [],
    },
    // reportOnly: true, // uncomment to test without blocking first
  })
);

/* ---------------- CORS & parsers ---------------- */
app.use(
  cors({
    origin: ["http://localhost:5173", "https://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

/* ---------------- Routes ---------------- */
app.use('/api/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/polls', pollRoutes);

// Protected test endpoint
app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}! You have accessed protected data.`,
    timestamp: new Date(),
  });
});

// Optional: quick page to SEE CSP blocking inline script & remote image
app.get('/csp-demo', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <meta charset="utf-8" />
    <title>CSP Demo</title>
    <h1>CSP demo page</h1>
    <!-- This inline script should be BLOCKED by CSP -->
    <script>console.log('If you see this, CSP failed'); alert('inline script ran');</script>
    <!-- This remote image should be BLOCKED by CSP -->
    <img src="https://picsum.photos/200" alt="blocked by CSP">
  `);
});

// Health check
app.get('/', (req, res) => {
  res.send('PulseVote API running!');
});

module.exports = app;