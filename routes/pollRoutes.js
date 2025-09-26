// routes/pollRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createPoll,
  votePoll,
  getPollResults,
  getOrgPolls,
  closePoll,
  openPoll,
} = require('../controllers/pollController');

const router = express.Router();

// Managers create polls
router.post('/create-poll', protect, requireRole('manager'), createPoll);

// Only Users can complete (vote) polls
router.post('/vote/:pollId', protect, requireRole('user'), votePoll);

// Registered users can view poll results or list polls
router.get('/get-poll-results/:pollId', protect, getPollResults);
router.get('/get-polls/:organisationId', protect, getOrgPolls);

// Managers can open/close polls
router.post('/close/:pollId', protect, requireRole('manager'), closePoll);
router.post('/open/:pollId',  protect, requireRole('manager'), openPoll);

module.exports = router;