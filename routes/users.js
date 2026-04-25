const express = require('express');
const router = express.Router();
const { requiresAuth } = require('express-openid-connect');

// Profile page - requires login
router.get('/profile', requiresAuth(), (req, res) => {
    res.render('users/profile', {
        user: req.oidc.user
    });
});

module.exports = router;