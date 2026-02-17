const jwt = require('jsonwebtoken');
const User = require('../models/User');


// =======================
// AUTH PROTECT
// =======================
exports.protect = async (req, res, next) => {

    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            message: 'Not authorized, token missing'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Optional but better: fetch full user from DB
        const user = await User.findById(decoded.id)
            .select('-password -faceDescriptor');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account disabled' });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        });
    }
};


// =======================
// TEACHER ONLY
// =======================
exports.teacherOnly = (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Teacher access only'
        });
    }
    next();
};


// =======================
// ADMIN ONLY
// =======================
exports.adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access only'
        });
    }
    next();
};