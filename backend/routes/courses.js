const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');

const { protect, teacherOnly } = require('../middleware/auth');


// ============================
// GET ALL COURSES
// ============================
router.get('/', protect, async (req, res) => {
  try {

    if (req.user.role === 'admin') {
      const courses = await Course.find()
        .populate('teacher', 'username');
      return res.json(courses);
    }

    if (req.user.role === 'teacher') {
      const courses = await Course.find({
        $or: [
          { isApproved: true },
          { teacher: req.user.id }
        ]
      }).populate('teacher', 'username');

      return res.json(courses);
    }

    // students
    const courses = await Course.find({ isApproved: true })
      .populate('teacher', 'username');

    res.json(courses);

  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});


// ============================
// GET COURSE BY ID
// ============================
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'username');

    if (!course)
      return res.status(404).json({ error: 'Course not found' });

    res.json(course);

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


// ============================
// CREATE COURSE (TEACHER ONLY + APPROVED)
// ============================
router.post('/', protect, teacherOnly, async (req, res) => {
  try {

    // Check teacher approval
    const teacher = await User.findById(req.user.id);

    if (!teacher.isApproved)
      return res.status(403).json({ error: 'Teacher not approved by admin' });

    const {
      title,
      description,
      category,
      difficulty,
      modules,
      quizzes
    } = req.body;

    const course = new Course({
      title,
      description,
      category,
      difficulty,
      modules,
      quizzes,
      teacher: req.user.id,
      isApproved: false // optional if you want course-level approval later
    });

    await course.save();

    res.status(201).json(course);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// ============================
// DELETE COURSE (OWNER OR ADMIN)
// ============================
router.delete('/:id', protect, async (req, res) => {
  try {

    const course = await Course.findById(req.params.id);

    if (!course)
      return res.status(404).json({ error: 'Course not found' });

    if (
      course.teacher.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await course.deleteOne();

    res.json({ message: 'Course deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;