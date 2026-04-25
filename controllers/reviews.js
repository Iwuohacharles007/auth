const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  
  if (!campground) {
    req.flash('error', 'Campground not found!');
    return res.redirect('/campgrounds');
  }
  
  const review = new Review(req.body.review);
  
  // Set author to the authenticated user's Auth0 ID
  review.author = req.oidc.user.sub;
  
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  
  req.flash('success', 'Successfully added review!');
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  
  // Optional: Check if the user is the author before deleting
  const review = await Review.findById(reviewId);
  
  if (!review) {
    req.flash('error', 'Review not found!');
    return res.redirect(`/campgrounds/${id}`);
  }
  
  if (review.author !== req.oidc.user.sub) {
    req.flash('error', 'You do not have permission to delete this review!');
    return res.redirect(`/campgrounds/${id}`);
  }
  
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  
  req.flash('success', 'Successfully deleted review!');
  res.redirect(`/campgrounds/${id}`);
};  