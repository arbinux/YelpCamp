const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const User = require("../models/user");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp-map")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  const user = await User.findOne();

  if (!user) {
    throw new Error("No user found. Please register a user first.");
  }

  await Campground.deleteMany({});

  for (let i = 0; i < 50; i++) {
    const randomCity = Math.floor(Math.random() * cities.length);
    const price = Math.floor(Math.random() * 20) + 10;

    const campground = new Campground({
      author: user._id,

      title: `${sample(descriptors)} ${sample(places)}`,

      location: `${cities[randomCity].city}, ${cities[randomCity].state}`,

      geometry: {
        type: "Point",
        coordinates: [
          cities[randomCity].longitude,
          cities[randomCity].latitude,
        ],
      },

      images: [
        {
          url: `https://picsum.photos/600/400?random=${i}`,
          filename: `seed-image-${i}`,
        },
      ],

      description: `Beautiful campsite near ${cities[randomCity].city}.`,

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
