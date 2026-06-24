const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },

  questions: [
    {
      question: {
        type: String,
        required: true
      },

      options: {
        type: [String],
        validate: v => v.length === 4
      },

      answer: {
        type: String,
        required: true
      }
    }
  ],

  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isApproved: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);