const User = require('../models/user');

module.exports.renderProfile = (req, res) => {
    res.render('users/profile', { user: req.oidc.user });
};

module.exports.syncUser = async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        const { sub, name, email } = req.oidc.user;

        // Find or create the user in your local MongoDB
        let user = await User.findOne({ auth0Id: sub });

        if (!user) {
            user = new User({
                auth0Id: sub,
                username: name || email,
                email: email
            });
        } else {
            // Update details if they changed in Auth0
            user.username = name || email;
            user.email = email;
        }

        await user.save();
    }
    // Redirect to profile or home after sync
    res.redirect('/profile');
};
