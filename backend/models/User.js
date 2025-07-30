const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  points: { type: Number, default: 0 },
  solvedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }]
});

module.exports = mongoose.model('User', userSchema);
