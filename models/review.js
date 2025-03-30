const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: String,  // Add the author field
});

module.exports = mongoose.model('Review', reviewSchema);
