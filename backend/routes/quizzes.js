const express = require("express");
const router = express.Router();

const Quiz = require("../models/Quiz");
const User = require("../models/User");

const { protect, teacherOnly } = require("../middleware/auth");


router.post("/", protect, teacherOnly, async (req, res) => {

    try {

        const teacher = await User.findById(req.user.id);

        if (!teacher.isApproved) {
            return res.status(403).json({
                error: "Teacher not approved"
            });
        }

        const {
            title,
            description,
            course,
            questions
        } = req.body;

        const quiz = new Quiz({
            title,
            description,
            course,
            questions,
            teacher: req.user.id,
            isApproved: false
        });

        await quiz.save();

        res.status(201).json(quiz);

    } catch (err) {
        res.status(400).json({
            error: err.message
        });
    }

});

router.put("/:id/approve", protect, async (req, res) => {

    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                error: "Not authorized"
            });
        }

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                error: "Quiz not found"
            });
        }

        quiz.isApproved = true;

        await quiz.save();

        res.json({
            message: "Quiz approved successfully",
            quiz
        });

    } catch (err) {

        res.status(500).json({
            error: "Server error"
        });

    }

});

router.get("/", protect, async (req, res) => {
  try {

    // Admin sees all quizzes
    if (req.user.role === "admin") {
      const quizzes = await Quiz.find()
        .populate("teacher", "username")
        .populate("course", "title");

      return res.json(quizzes);
    }

    // Teacher sees own quizzes + approved quizzes
    if (req.user.role === "teacher") {
      const quizzes = await Quiz.find({
        $or: [
          { teacher: req.user.id },
          { isApproved: true }
        ]
      })
        .populate("teacher", "username")
        .populate("course", "title");

      return res.json(quizzes);
    }

    // Student sees approved quizzes only
    const quizzes = await Quiz.find({
      isApproved: true
    })
      .populate("teacher", "username")
      .populate("course", "title");

    res.json(quizzes);

  } catch (err) {
    res.status(500).json({
      error: "Server error"
    });
  }
});



router.get("/pending", protect, async (req, res) => {

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Not authorized"
    });
  }

  const quizzes = await Quiz.find({
    isApproved: false
  })
    .populate("teacher", "username")
    .populate("course", "title");

  res.json(quizzes);

});

router.get("/:id", protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("teacher", "username")
      .populate("course", "title");

    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found",
      });
    }

    // Students can only access approved quizzes
    if (req.user.role === "student" && !quiz.isApproved) {
      return res.status(403).json({
        error: "Quiz not approved",
      });
    }

    // Teachers can access their own quizzes or approved quizzes
    if (
      req.user.role === "teacher" &&
      !quiz.isApproved &&
      quiz.teacher._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        error: "Not authorized",
      });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete("/:id", protect, async (req, res) => {

  try {

    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        error: "Quiz not found"
      });
    }

    if (
      quiz.teacher.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: "Not authorized"
      });
    }

    await quiz.deleteOne();

    res.json({
      message: "Quiz deleted successfully"
    });

  } catch (err) {

    res.status(500).json({
      error: "Server error"
    });

  }

});

module.exports = router;