// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;


// require('dotenv').config();
// const express = require('express');
// const app = express();
// const cors = require('cors');
// const https = require('https');

// // DB connection function
// const connection = require('./config/db');

// // Routes
// const userRoutes = require('./routes/users');
// const authRoutes = require('./routes/auth');
// const bookRoutes = require('./routes/books');
// const exchangeRoutes = require('./routes/exchanges');

// // User model (for cleanup job)
// const User = require('./models/user');

// // Test HTTPS request
// https.get('https://www.google.com', (res) => {
//   console.log(`Status Code: ${res.statusCode}`);
// }).on('error', (err) => {
//   console.error('Error:', err);
// });

// // Middleware
// app.use(express.json());
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://lithub-frontend.vercel.app', 'http://localhost:5173']
// }));

// // Routes
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/books', bookRoutes);
// app.use('/api/exchanges', exchangeRoutes);

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("Global Error Handler:", err);
//   res.status(500).send({ message: 'Internal Server Error' });
// });

// // Server port
// const port = process.env.PORT || 8080;

// // Start server AFTER database connects
// async function startServer() {
//   try {
//     await connection();

//     // Clean up expired/unverified users every hour
//     setInterval(async () => {
//       try {
//         await User.deleteMany({
//           isVerified: false,
//           otpExpires: { $lt: new Date() }
//         });
//       } catch (err) {
//         console.error('Error cleaning up unverified users:', err);
//       }
//     }, 60 * 60 * 1000);

//     console.log(`Server started at: ${new Date().toISOString()}`);

//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//     });

//   } catch (err) {
//     console.error('Database connection failed:', err);
//     process.exit(1);
//   }
// }

// startServer();

// module.exports = app;



require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const https = require('https');

// DB connection function
const connection = require('./config/db');

// Routes
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const exchangeRoutes = require('./routes/exchanges');

// User model
const User = require('./models/user');

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
