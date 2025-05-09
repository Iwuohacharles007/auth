const { campgroundSchema, reviewSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');

// Middleware to validate campground data
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  next();
};

// Middleware to validate review data
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  next();
};

// Dummy isAuthenticated middleware
const isAuthenticated = (req, res, next) => {
  if (!req.oidc?.isAuthenticated()) {
    req.flash('error', 'You must be signed in.');
    return res.redirect('/login');
  }
  next();
};

module.exports = {
  validateCampground,
  validateReview,
  isAuthenticated
};
