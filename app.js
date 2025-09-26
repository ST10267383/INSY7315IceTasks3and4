// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

const authRoutes = require('./routes/authRoutes');
const organisationRoutes = require('./routes/organisationRoutes');
const pollRoutes = require('./routes/pollRoutes');
const { protect } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();

/* ------------------------- Security headers (Helmet) ------------------------ */
app.use(helmet());

/* ----------------------- Content Security Policy (CSP) ---------------------- */
const defaultConnect = [
  "'self'",
  "http://localhost:5000",
  "https://localhost:5000",
  "http://localhost:5173",
  "https://localhost:5173",
  "ws://localhost:5173",
  "wss://localhost:5173",
];

const envConnect =
  (process.env.CSP_CONNECT || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // add CDNs if you use any
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:"],
      connectSrc: envConnect.length ? envConnect : defaultConnect,
    },
  })
);

/* --------------------------- CORS (configurable) ---------------------------- */
const allowed =
  (process.env.CORS_ORIGINS ||
    'http://localhost:5173,https://localhost:5173')
    .split(',')
    .map(s => s.trim());

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server or curl (no Origin header)
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* --------------------------- parsers & proxy trust -------------------------- */
app.use(express.json());
app.set('trust proxy', 1); // needed if you ever run behind a reverse proxy

/* --------------------------------- Routes ---------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/organisations', organisationRoutes);
app.use('/api/polls', pollRoutes);

/* ------------------------------ Health endpoint ----------------------------- */
app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

/* --------------------------- Friendly test endpoints ------------------------ */
app.get('/', (_req, res) => {
  res.send('PulseVote API running!');
});

app.get('/test', (_req, res) => {
  res.json({
    message: 'This is a test endpoint from PulseVote API!',
    status: 'success',
    timestamp: new Date(),
  });
});

app.get('/api/protected', protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}! You have accessed protected data.`,
    timestamp: new Date(),
  });
});

module.exports = app;