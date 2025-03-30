const cities = require('./cities');  // Import the cities array

app.get('/seed', async (req, res) => {
    try {
        // Delete all existing campgrounds
        await Campground.deleteMany({}); 

        // Seed 10 campgrounds with random city and state
        for (let i = 0; i < 10; i++) {
            const randomCity = cities[Math.floor(Math.random() * cities.length)];

            const newCampground = new Campground({
                title: `Campground ${i + 1}`,
                price: Math.floor(Math.random() * 20) + 10, // Random price between 10 and 30
                description: "A beautiful place to camp.",
                location: `${randomCity.city}, ${randomCity.state}`, // Format the location as "City, State"
                image: "https://images.unsplash.com/photo-1627662167338-f3ae5a35cd81?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Z2l2aW5nfGVufDB8fDB8fHww" // Your image URL
            });

            await newCampground.save(); // Save the new campground to the database
        }

        res.send("Seeding successful: 10 campgrounds have been added.");
    } catch (err) {
        console.error("Error during seeding:", err);
        res.status(500).send("Error during seeding");
    }
});
