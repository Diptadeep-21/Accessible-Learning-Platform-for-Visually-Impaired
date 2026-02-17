const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');


// =============================
// GET ALL USERS
// =============================
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -faceDescriptor');
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// GET PENDING TEACHERS
// =============================
router.get('/pending-teachers', protect, adminOnly, async (req, res) => {
  try {
    const teachers = await User.find({
      role: 'teacher',
      isApproved: false
    }).select('-password');

    res.json(teachers);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// APPROVE TEACHER
// =============================
router.put('/approve-teacher/:id', protect, adminOnly, async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);

    if (!teacher || teacher.role !== 'teacher')
      return res.status(404).json({ error: 'Teacher not found' });

    teacher.isApproved = true;
    teacher.isActive = true;
    await teacher.save();

    res.json({ message: 'Teacher approved successfully' });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// DEACTIVATE USER (ANY ROLE)
// =============================
router.put('/toggle-user/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({ error: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: 'User status updated' });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// GET ALL COURSES (ADMIN VIEW)
// =============================
router.get('/courses', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'username');

    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// GET PENDING COURSES
// =============================
router.get('/pending-courses', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find({ isApproved: false })
      .populate('teacher', 'username');

    res.json(courses);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// APPROVE COURSE
// =============================
router.put('/approve-course/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ error: 'Course not found' });

    course.isApproved = true;
    await course.save();

    res.json({ message: 'Course approved successfully' });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// =============================
// DELETE COURSE (ADMIN)
// =============================
router.delete('/delete-course/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ error: 'Course not found' });

    await course.deleteOne();

    res.json({ message: 'Course deleted' });

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;