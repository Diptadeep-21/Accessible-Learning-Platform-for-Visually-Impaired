const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String }, // Text content for TTS
});

module.exports = mongoose.model('Course', courseSchema);