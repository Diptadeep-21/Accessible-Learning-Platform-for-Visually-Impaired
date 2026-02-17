const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// =====================
// STUDENT REGISTER (FACE)
// =====================
router.post('/student-register', async (req, res) => {
  try {
    const { username, faceDescriptor } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ error: "Invalid or missing username" });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({ error: "Invalid face descriptor" });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = new User({
      username,
      faceDescriptor,
      role: 'student'
    });

    await user.save();

    res.status(201).json({ message: 'Student registered successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// =====================
// STUDENT FACE LOGIN
// =====================
router.post('/face-login', async (req, res) => {
  try {
    const { username, faceDescriptor } = req.body;

    if (!faceDescriptor || faceDescriptor.length !== 128) {
      return res.status(400).json({ error: "Invalid face descriptor" });
    }

    const user = await User.findOne({ username });

    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    if (!user.faceDescriptor || user.faceDescriptor.length !== 128) {
      return res.status(400).json({ error: 'No face data stored' });
    }

    const distance = Math.sqrt(
      user.faceDescriptor.reduce(
        (sum, val, i) => sum + Math.pow(val - faceDescriptor[i], 2), 0
      )
    );

    if (distance > 0.45)
      return res.status(401).json({ error: 'Face not recognized' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// =====================
// TEACHER REGISTER
// =====================
router.post('/teacher-register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const user = new User({
      username,
      email,
      password,
      role: 'teacher',
      isApproved: false
    });

    await user.save();

    res.status(201).json({
      message: 'Teacher registered. Awaiting admin approval.'
    });

  } catch (err) {
    console.error("🔥 TEACHER REGISTER ERROR:");
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// =====================
// TEACHER LOGIN
// =====================
router.post('/teacher-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account disabled' });
    }

    if (user.role === 'teacher' && !user.isApproved) {
      return res.status(403).json({ error: 'Awaiting admin approval' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// UNIVERSAL LOGIN (Teacher + Admin)
// =====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isActive)
      return res.status(403).json({ error: 'Account disabled' });

    if (user.role === 'teacher' && !user.isApproved)
      return res.status(403).json({ error: 'Awaiting admin approval' });

    const isMatch = await user.comparePassword(password);

    if (!isMatch)
      return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/create-admin', async (req, res) => {
  const admin = new User({
    username: "admin",
    email: "admin@test.com",
    password: "admin123",
    role: "admin",
    isApproved: true
  });

  await admin.save();
  res.json({ message: "Admin created" });
});
// =====================
module.exports = router;