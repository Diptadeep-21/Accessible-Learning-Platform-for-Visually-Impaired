const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  faceDescriptor: { type: [Number], required: true }, // 128D array from face-api.js
});

module.exports = mongoose.model('User', userSchema);
