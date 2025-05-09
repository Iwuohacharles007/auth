// models/review.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// models/review.js
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
      type: String, // Change from ObjectId to String
      required: true
    }
  });
  

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
