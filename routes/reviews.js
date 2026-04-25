const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const reviews = require('../controllers/reviews');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');
const { isAuthenticated } = require('../middleware/auth-middleware'); 

// Authorization middleware
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect(`/campgrounds/${id}`);
    }
    // Safety check: ensure user is logged in and is the author
    if (!req.oidc.user || review.author !== req.oidc.user.sub) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    next();
};

router.post('/', isAuthenticated, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isAuthenticated, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
