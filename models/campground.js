const mongoose = require('mongoose');
const Review = require('./review'); // Import the Review model to access the reviews collection

const Schema = mongoose.Schema;

// Define the Campground schema
const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,  // Correctly specify ObjectId type
            ref: 'Review'                 // Reference the Review model
        }
    ]
});

// Pre-remove hook to delete reviews associated with campground
CampgroundSchema.pre('remove', async function(next) {
    // Delete all reviews associated with this campground before it is removed
    await Review.deleteMany({ _id: { $in: this.reviews } });
    next();
});

// Export the Campground model
module.exports = mongoose.model('Campground', CampgroundSchema);
