const { requiresAuth } = require('express-openid-connect');

// Middleware to store the URL the user was trying to access
function storeReturnTo(req, res, next) {
  if (!req.oidc.isAuthenticated() && req.originalUrl !== '/login') {
    req.session.returnTo = req.originalUrl;
  }
  next();
}

// After login callback, redirect to the original destination
async function handleAuthCallback(req, res) {
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
}

// Route handler for login (redirects to Auth0)
function loginHandler(req, res) {
  res.oidc.login({ returnTo: '/callback' });
}

// Middleware wrapper for protected routes
const isAuthenticated = [
  storeReturnTo,
  requiresAuth()
];

module.exports = {
  isAuthenticated,
  loginHandler,
  handleAuthCallback
};

