const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },

  email: {
    type: String,
    unique: true,
    sparse: true, // allows null for students
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    minlength: 6
  },

 faceDescriptor: {
  type: [Number],
  default: undefined,
  validate: {
    validator: function (arr) {
      if (this.role === 'student') {
        return Array.isArray(arr) && arr.length === 128;
      }
      return true;
    },
    message: 'Face descriptor must be 128-dimensional for students'
  }
},

  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student',
    index: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isApproved: {
    type: Boolean,
    default: function () {
      return this.role === 'student';
    }
  }

}, { timestamps: true });


// ---------------- HASH PASSWORD BEFORE SAVE ----------------
userSchema.pre('save', async function (next) {

  if (this.role === 'teacher' || this.role === 'admin') {

    if (!this.password) {
      return next(new Error('Password required for teachers/admin'));
    }

    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});


// ---------------- METHOD TO COMPARE PASSWORD ----------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);