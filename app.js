require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo');

// Routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

// Create Express App
const app = express();

// MongoDB Connection
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/yelpcamp';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return false;
  }
};

// Connect to MongoDB before initializing the app
connectDB();

// Session Store Configuration
const sessionStore = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  crypto: {
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
  },
});

sessionStore.on('error', (e) => {
  console.log('SESSION STORE ERROR', e);
});

// Session Configuration
const sessionConfig = {
  store: sessionStore,
  name: 'session',
  secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

// View Engine Setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());

// Global Middleware for Flash Messages and User
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

// Home Route
app.get('/', (req, res) => {
  res.render('home');
});

// 404 Route - Handles non-existent routes
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  const message = err.message || 'Oh No, Something Went Wrong!';
  
  console.error('Error Handler Debug:', { statusCode, message });
  
  // Explicitly pass both variables to the template
  res.status(statusCode).render('error', { 
    statusCode: statusCode, 
    message: message,
    err // Optional: passing the full error object can be useful for development
  });
});

// For Vercel Serverless Functions
module.exports = app;

// Local development server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
  });
}
