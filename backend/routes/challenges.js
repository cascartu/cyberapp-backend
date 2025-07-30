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

// Obtener un reto por ID
router.get('/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' })
    res.json(challenge)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el reto' })
  }
})

// POST /api/challenges/:id/validate
router.post('/:id/validate', async (req, res) => {
  const { id } = req.params;
  const { flag } = req.body;

  try {
    const challenge = await Challenge.findById(id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Reto no encontrado' });

    if (flag === challenge.flag) {
      res.json({ success: true, message: '¡Flag correcto!' });
    } else {
      res.json({ success: false, message: 'Flag incorrecto' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});




module.exports = router;
