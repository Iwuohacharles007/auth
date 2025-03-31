require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const ExpressError = require('./utils/ExpressError');
const catchAsync = require('./utils/catchAsync');
const Campground = require('./models/campground');
const Review = require('./models/review');
const { campgroundSchema, reviewSchema } = require('./schemas');

const app = express();

// Database connection
const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/yelpcamp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('✅ Database connected'));

// EJS setup
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session & Flash Configuration
const sessionConfig = {
    store: MongoStore.create({ mongoUrl: dbUrl, touchAfter: 24 * 3600 }),
    secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};

app.use(session(sessionConfig));
app.use(flash());

// Make flash messages available in templates
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Validation middleware
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) throw new ExpressError(error.details.map((el) => el.message).join(','), 400);
    next();
};

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) throw new ExpressError(error.details.map((el) => el.message).join(','), 400);
    next();
};

// Routes
app.get('/', (req, res) => res.render('home'));

// Campgrounds CRUD
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => res.render('campgrounds/new'));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'Successfully created a new campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'Campground not found!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${req.params.id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground!');
    res.redirect('/campgrounds');
}));

// Reviews CRUD
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, { $pull: { reviews: req.params.reviewId } });
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${req.params.id}`);
}));

// Catch all unmatched routes
app.all('*', (req, res, next) => next(new ExpressError('Page Not Found', 404)));

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).render('error', { statusCode, message });
});

// Export app for Vercel deployment
module.exports = app;

// Start server in local development
if (require.main === module) {
    app.listen(3000, () => console.log('🔥 Server running on port 3000'));
}
