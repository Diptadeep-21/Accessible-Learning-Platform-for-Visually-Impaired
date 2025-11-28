const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  difficulty: { type: String },
  modules: [String], // Each item = one module's text
  quizzes: [
    {
      question: String,
      options: [String],
      answer: String
    }
  ]
});

module.exports = mongoose.model('Course', courseSchema);
