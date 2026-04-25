const { requiresAuth } = require('express-openid-connect');

function storeReturnTo(req, res, next) {
    // ✅ Don't store /login or /logout or /callback as returnTo
    const exclude = ['/login', '/logout', '/callback', '/register'];
    if (!req.oidc.isAuthenticated() && !exclude.includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    next();
}

function loginHandler(req, res) {
    const returnTo = req.session.returnTo || '/campgrounds';
    const screen_hint = req.query.screen_hint;

    // ✅ Clear returnTo after using it
    delete req.session.returnTo;

    res.oidc.login({
        returnTo,
        authorizationParams: {
            screen_hint: screen_hint || 'login'
        }
    });
}

const isAuthenticated = [
    storeReturnTo,
    requiresAuth()
];

module.exports = {
    isAuthenticated,
    loginHandler
};