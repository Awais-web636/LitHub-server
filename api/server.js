require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');

// DB connection function
const connection = require('../config/db');

// Routes
const userRoutes = require('../routes/users');
const authRoutes = require('../routes/auth');
const bookRoutes = require('../routes/books');
const exchangeRoutes = require('../routes/exchanges');

// User model
const User = require('../models/user');

// Test HTTPS request
https.get('https://www.google.com', (res) => {
  console.log(`Status Code: ${res.statusCode}`);
}).on('error', (err) => {
  console.error('Error:', err);
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://lithub-frontend.vercel.app',
      'http://localhost:5173'
    ],
  })
);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/exchanges', exchangeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(500).send({ message: 'Internal Server Error' });
});

// ❌ REMOVE app.listen()
// ❌ REMOVE startServer()

// ✅ Connect DB on first cold start (Netlify serverless)
let isDbConnected = false;
async function init() {
  if (!isDbConnected) {
    try {
      await connection();
      isDbConnected = true;

      // Cleanup job – runs only once on cold start
      setInterval(async () => {
        try {
          await User.deleteMany({
            isVerified: false,
            otpExpires: { $lt: new Date() },
          });
        } catch (err) {
          console.error('Error cleaning up unverified users:', err);
        }
      }, 60 * 60 * 1000);

      console.log("DB Connected (Netlify Serverless)");
    } catch (err) {
      console.error("DB Connection Error:", err);
    }
  }
}

init(); // call once

module.exports = app;
