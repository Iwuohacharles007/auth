const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const { auth } = require('express-openid-connect');
require('dotenv').config();

// Middleware and route imports
const { isAuthenticated, loginHandler, handleAuthCallback } = require('./middleware/auth-middleware');
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const ExpressError = require('./utils/ExpressError');

const app = express();

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('✅ MongoDB connected');
});

// View engine
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}));
app.use(flash());

// Auth0 middleware
app.use(auth({
  authRequired: false,
  auth0Logout: true,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  baseURL: process.env.AUTH0_BASE_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  authorizationParams: {
    response_type: 'code',
    scope: 'openid profile email'
  },
  routes: {
    callback: '/callback'
  }
}));

// Set locals for views
app.use((req, res, next) => {
  res.locals.currentUser = req.oidc.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Auth routes
app.get('/login', loginHandler);
app.get('/callback', handleAuthCallback);
app.get('/logout', (req, res) => {
  res.oidc.logout({ returnTo: process.env.AUTH0_BASE_URL || 'http://localhost:3000' });
});

// App routes
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

// Home
app.get('/', (req, res) => {
  res.render('home');
});

// 404 handler
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

// Error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  res.status(statusCode).render('error', { statusCode, message });
});

// Server start
app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
