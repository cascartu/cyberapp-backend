const express = require('express');
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
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

router.get('/', async (req, res) => {
  const challenges = await Challenge.find({}, '-flag');
  res.json(challenges);
});

router.post('/:id/submit', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { flag } = req.body;
  const challenge = await Challenge.findById(id);
  if (!challenge) return res.status(404).json({ error: 'Not found' });

  if (challenge.flag === flag) {
    const user = await User.findById(req.user.id);
    if (!user.solvedChallenges.includes(id)) {
      user.points += challenge.points;
      user.solvedChallenges.push(id);
      await user.save();
    }
    res.json({ correct: true, message: 'Correct flag!' });
  } else {
    res.json({ correct: false, message: 'Incorrect flag' });
  }
});

module.exports = router;
