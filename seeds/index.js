const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const randomCity = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 20) + 10;

    const campground = new Campground({
      title: `${sample(descriptors)} ${sample(places)}`,

      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,

      image: `https://picsum.photos/600/400?random=${i}`,

      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.",

      price: price,
    });

    await campground.save();
  }
};

seedDB()
  .then(() => {
    console.log("Database Seeded");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.log(err);
    mongoose.connection.close();
  });
