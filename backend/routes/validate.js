const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// POST /api/validate/:challengeId
router.post('/:challengeId', async (req, res) => {
  const { challengeId } = req.params;
  const { flag } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    const challenge = await Challenge.findById(challengeId);

    if (!challenge) return res.status(404).json({ message: 'Reto no encontrado' });

    const alreadySolved = user.solvedChallenges.includes(challengeId);
    if (alreadySolved) {
      return res.status(200).json({ message: 'Reto ya resuelto previamente', alreadySolved: true });
    }

    if (flag === challenge.flag) {
      user.points += challenge.points;
      user.solvedChallenges.push(challengeId);
      await user.save();

      return res.status(200).json({ message: 'Flag correcto', success: true });
    } else {
      return res.status(400).json({ message: 'Flag incorrecto', success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
