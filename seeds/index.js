const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

// Connect to YelpCamp database
mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


// Seed function
const seedDB = async () => {
  // Delete all existing campgrounds
  await Campground.deleteMany({});


//   // Create test campground
//   const c = new Campground({
//     title: "Purple Field",
//     description: "keep camping",
//   });

//   // Save campground to MongoDB
//   await c.save();
  for(let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `'${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

// Run seed function
seedDB()
  .then(() => {
    console.log("Database Seeded");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
    mongoose.connection.close();
  });
