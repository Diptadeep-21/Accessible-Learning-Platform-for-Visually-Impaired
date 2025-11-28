// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');

dotenv.config();
connectDB();

const app = express();

// ✅ Allow frontend (React at localhost:3000) to call backend
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Parse incoming JSON (must be before routes)
app.use(express.json());

// ✅ Test route to verify JSON body parsing
app.post('/debug', (req, res) => {
  console.log('DEBUG body received:', req.body);
  res.json({ received: req.body });
});

// ✅ Actual routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// ✅ Root test endpoint
app.get('/', (req, res) => res.send('API running...'));

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
