const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String
});

const campgroundSchema = new Schema({
    title: String,
    images: [imageSchema], // ← FIXED: array of objects with url and filename
    price: Number,
    description: String,
    location: String,
    geometry: {              // ← ADDED: for Mapbox map
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    author: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

module.exports = mongoose.model('Campground', campgroundSchema);
