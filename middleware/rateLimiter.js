const rateLimit = require("express-rate-limit");

// robust way to derive a client key from IP (works behind proxies)
const keyByIp = (req) =>
  req.ip ||
  (req.headers["x-forwarded-for"] || "").split(",")[0]?.trim() ||
  req.connection?.remoteAddress ||
  req.socket?.remoteAddress ||
  req.connection?.socket?.remoteAddress ||
  "unknown";

// limit registrations: 5 attempts per 15 minutes per IP
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyByIp,
  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many registration attempts. Please try again later.",
    });
  },
});

// limit logins: 5 failed attempts per 10 minutes per (IP + email)
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // successful logins don't count toward the limit
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${keyByIp(req)}|${(req.body?.email || "").toLowerCase()}`,
  handler: (req, res) => {
    return res.status(429).json({
      message: "Too many login attempts. Please try again later.",
    });
  },
});

module.exports = { registerLimiter, loginLimiter };