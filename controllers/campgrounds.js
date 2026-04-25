

const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require('../cloudinary');
 
// =====================
// INDEX
// =====================
// =====================
// INDEX
// =====================
module.exports.index = async (req, res) => {
    try {
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', { campgrounds, mapBoxToken }); // ✅ add this
    } catch (error) {
        console.error('Index Error:', error);
        req.flash('error', 'Error loading campgrounds');
        res.redirect('/');
    }
};
// =====================
// NEW FORM
// =====================
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
};
 
// =====================
// CREATE
// =====================
module.exports.createCampground = async (req, res) => {
    try {
        const location = req.body.campground?.location || req.body.location;
        if (!location) {
            req.flash('error', 'Location is required');
            return res.redirect('/campgrounds/new');
        }
 
        let geometry = { type: 'Point', coordinates: [0, 0] };
        try {
            const geoData = await geocoder.forwardGeocode({ query: location, limit: 1 }).send();
            if (geoData.body.features.length) {
                geometry = geoData.body.features[0].geometry;
            }
        } catch (e) {
            console.error("Geocoding Error:", e);
        }
 
        const campground = new Campground(req.body.campground);
        campground.geometry = geometry;
 
        // Handle images
        if (req.files && req.files.length > 0) {
            campground.images = req.files.map(f => ({
                url: f.path,
                filename: f.filename
            }));
        } else {
            campground.images = [];
        }
 
        // Auth0 user
        campground.author = req.oidc?.user?.sub || req.user?._id;
 
        await campground.save();
        req.flash('success', 'Successfully created a new campground!');
        res.redirect(`/campgrounds/${campground._id}`);
 
    } catch (error) {
        console.error('Create Error:', error);
        if (req.files) {
            for (let f of req.files) await cloudinary.uploader.destroy(f.filename);
        }
        req.flash('error', 'Error creating campground');
        res.redirect('/campgrounds/new');
    }
};
 
// =====================
// SHOW
// =====================
module.exports.showCampground = async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate({
            path: 'reviews',
            populate: { path: 'author' }
        }).populate('author');
 
        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }
 
        res.render('campgrounds/show', { campground, mapBoxToken });
 
    } catch (error) {
        console.error('Show Error:', error);
        req.flash('error', 'Error loading campground');
        res.redirect('/campgrounds');
    }
};
 
// =====================
// EDIT FORM
// =====================
module.exports.renderEditForm = async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
 
        if (!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
 
        res.render('campgrounds/edit', { campground });
    } catch (error) {
        console.error('Edit Form Error:', error);
        req.flash('error', 'Error loading edit form');
        res.redirect('/campgrounds');
    }
};
 
// =====================
// UPDATE ✅ FIXED: re-geocodes when location changes
// =====================
module.exports.updateCampground = async (req, res) => {
    try {
        const { id } = req.params;
 
        // Re-geocode if location was updated
        const updateData = { ...req.body.campground };
        if (updateData.location) {
            try {
                const geoData = await geocoder.forwardGeocode({ query: updateData.location, limit: 1 }).send();
                if (geoData.body.features.length) {
                    updateData.geometry = geoData.body.features[0].geometry;
                }
            } catch (e) {
                console.error("Geocoding Error on update:", e);
            }
        }
 
        const campground = await Campground.findByIdAndUpdate(
            id,
            { ...updateData },
            { new: true }
        );
 
        if (!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
 
        // Add new images if uploaded
        if (req.files && req.files.length > 0) {
            const imgs = req.files.map(f => ({
                url: f.path,
                filename: f.filename
            }));
            campground.images.push(...imgs);
            await campground.save();
        }
 
        // Delete selected images
        if (req.body.deleteImages && req.body.deleteImages.length > 0) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await campground.updateOne({
                $pull: { images: { filename: { $in: req.body.deleteImages } } }
            });
        }
 
        req.flash('success', 'Successfully updated campground!');
        res.redirect(`/campgrounds/${campground._id}`);
 
    } catch (error) {
        console.error('Update Error:', error);
        req.flash('error', 'Error updating campground');
        res.redirect(`/campgrounds/${req.params.id}/edit`);
    }
};
 
// =====================
// DELETE
// =====================
module.exports.deleteCampground = async (req, res) => {
    try {
        const { id } = req.params;
        const campground = await Campground.findById(id);
 
        if (!campground) {
            req.flash('error', 'Cannot find that campground');
            return res.redirect('/campgrounds');
        }
 
        // Delete images from Cloudinary safely
        if (campground.images && campground.images.length > 0) {
            for (let img of campground.images) {
                if (!img.filename) {
                    console.warn('Skipping image with no filename:', img);
                    continue;
                }
                try {
                    await cloudinary.uploader.destroy(img.filename);
                    console.log('Deleted from Cloudinary:', img.filename);
                } catch (cloudErr) {
                    console.error('Cloudinary delete failed for:', img.filename, cloudErr);
                }
            }
        }
 
        await Campground.findByIdAndDelete(id);
        req.flash('success', 'Successfully deleted campground');
        res.redirect('/campgrounds');
 
    } catch (error) {
        console.error('Delete Error:', error);
        req.flash('error', 'Error deleting campground');
        res.redirect('/campgrounds');
    }
};