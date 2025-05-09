const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    author: {
        type: String, // Change this to String instead of ObjectId
        required: true
    }
});

module.exports = mongoose.model('Review', reviewSchema);
