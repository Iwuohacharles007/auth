const express = require('express');
const router = express.Router({ mergeParams: true });
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');
const { isAuthenticated } = require('../middleware/auth-middleware'); // Auth0 middleware
const { Types } = require('mongoose'); // Import mongoose Types

// Authorization middleware
const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash('error', 'Review not found!');
        return res.redirect(`/campgrounds/${id}`);
    }
    if (!review.author.equals(req.oidc.user.sub)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

// Validation Middleware for Reviews
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(', ');
        throw new ExpressError(msg, 400);
    }
    next();
};

// Add review (POST route)
router.post('/', isAuthenticated, validateReview, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }

    const review = new Review(req.body.review);
    review.author = req.oidc.user.sub; // Use Auth0 user ID (string)

    campground.reviews.push(review);

    await review.save();
    await campground.save();

    req.flash('success', 'Successfully added review!');
    res.redirect(`/campgrounds/${id}`);
}));

// Delete review (DELETE route)
router.delete('/:reviewId', isAuthenticated, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;
