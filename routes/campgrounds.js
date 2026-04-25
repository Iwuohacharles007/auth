const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // Added mongoose for validation
const campground = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isAuthenticated } = require('../middleware/auth-middleware');
const { validateCampground } = require('../middleware/index');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

// Validation Middleware: Prevents "Cast to ObjectId" errors
const validateId = (req, res, next) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid ID provided');
        return res.redirect('/campgrounds');
    }
    next();
};

router.get('/', catchAsync(campground.index));

router.get('/new', isAuthenticated, campground.renderNewForm);

router.post('/', isAuthenticated, upload.array('images'), validateCampground, catchAsync(campground.createCampground));

// Added validateId middleware to all routes using :id
router.get('/:id', validateId, catchAsync(campground.showCampground));

router.get('/:id/edit', isAuthenticated, validateId, catchAsync(campground.renderEditForm));

router.put('/:id', isAuthenticated, upload.array('images'), validateId, validateCampground, catchAsync(campground.updateCampground));

router.delete('/:id', isAuthenticated, validateId, catchAsync(campground.deleteCampground));

module.exports = router;
