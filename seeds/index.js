const mongoose = require('mongoose');
const Campground = require('../models/Campground');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("MongoDB connected!");
})
.catch(error => {
    console.log("MongoDB connection error:", error);
});

// Arrays of sample cities and countries
const cities = ['Santorini', 'Kyoto', 'Reykjavik', 'Marrakesh', 'Sydney'];
const countries = ['Greece', 'Japan', 'Iceland', 'Morocco', 'Australia'];

// Function to pick a random city and country
const getRandomLocation = () => {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    return { city, country };
};

// Seed data with random locations
const seedCampgrounds = Array.from({ length: 10 }, () => ({
    author: '67ed4a81a9e6557ebb2e5e9d',
    title: `Campground ${Math.floor(Math.random() * 100)}`,
    price: Math.floor(Math.random() * 100) + 10,
    location: getRandomLocation(),
    description: 'A beautiful place to relax.',
    image: 'https://images.unsplash.com/photo-1720048171596-6a7c81662434?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
}));

const seedDB = async () => {
    await Campground.deleteMany({});
    await Campground.insertMany(seedCampgrounds);
    console.log("Database seeded with random campgrounds!");
};

seedDB().then(() => {
    mongoose.connection.close();
});
