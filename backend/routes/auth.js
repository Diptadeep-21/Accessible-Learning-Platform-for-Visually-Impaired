const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

router.post('/register', async (req, res) => {
  const { username, faceDescriptor } = req.body;

  // Validate username
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid or missing username" });
  }

  // Validate descriptor
  if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
    return res.status(400).json({ error: "Invalid face descriptor" });
  }

  try {
    const user = new User({ username, faceDescriptor });
    await user.save();
    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});


router.post('/face-login', async (req, res) => {
  const { username, faceDescriptor } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Calculate Euclidean distance
  const distance = Math.sqrt(
    user.faceDescriptor.reduce((sum, val, i) => sum + Math.pow(val - faceDescriptor[i], 2), 0)
  );

  console.log('Face match distance:', distance);
  if (distance > 0.45) return res.status(401).json({ error: 'Face not recognized' }); // threshold ~0.4–0.6

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
