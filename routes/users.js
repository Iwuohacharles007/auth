const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');

// Profile page - requires login
router.get('/profile', requiresAuth(), (req, res) => {
  res.render('users/profile', {
    user: req.oidc.user
  });
});

// Auth0 callback - create/update local user
router.get('/auth/callback', catchAsync(async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    const { sub, name, email } = req.oidc.user;

    let user = await User.findOne({ auth0Id: sub });

    if (!user) {
      user = new User({
        auth0Id: sub,
        username: name || email,
        email: email
      });
    } else {
      user.username = name || email;
      user.email = email;
    }

    await user.save();
  }

  res.redirect('/profile');
}));

module.exports = router;
