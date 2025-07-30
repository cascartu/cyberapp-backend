const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).populate('solvedChallenges');
  res.json({
    username: user.username,
    email: user.email,
    points: user.points,
    solvedChallenges: user.solvedChallenges.map(c => ({
      title: c.title,
      points: c.points
    }))
  });
});

module.exports = router;
