const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ✅ GET all courses
router.get('/', authMiddleware, async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// ✅ GET course by ID
router.get('/:id', authMiddleware, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// ✅ POST add new course
router.post('/', authMiddleware, async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
