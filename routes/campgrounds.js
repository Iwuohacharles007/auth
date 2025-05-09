const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { isAuthenticated } = require('../middleware/auth-middleware');
const { validateCampground } = require('../middleware/index');




// Show all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// Form to create new campground
router.get('/new', isAuthenticated, (req, res) => {
    res.render('campgrounds/new');
});

// Show one campground with its reviews
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: {
                path: 'author'
            }
        })
        .populate('author');
        
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    
    res.render('campgrounds/show', { campground });
}));

// Create new campground
router.post('/', isAuthenticated, validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    
    // Set the author to the Auth0 user ID
    campground.author = req.oidc.user.sub;
    
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Form to edit campground
router.get('/:id/edit', isAuthenticated, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    
    // Check if user is the author
    if (campground.author.toString() !== req.oidc.user.sub) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${req.params.id}`);
    }
    
    res.render('campgrounds/edit', { campground });
}));

// Update campground
router.put('/:id', isAuthenticated, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    
    // Check if user is the author
    if (campground.author.toString() !== req.oidc.user.sub) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    await Campground.findByIdAndUpdate(id, req.body.campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${id}`);
}));

// Delete campground
router.delete('/:id', isAuthenticated, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    
    // Check if user is the author
    if (campground.author.toString() !== req.oidc.user.sub) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));

module.exports = router;