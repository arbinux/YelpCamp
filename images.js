require("dotenv").config();

const mongoose = require("mongoose");
const Campground = require("./models/campground");

const imageUrls = [
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80",
];

async function fixImages() {
  await mongoose.connect(process.env.MONGODB_URL);

  console.log("Database Connected");

  const campgrounds = await Campground.find({});

  for (let i = 0; i < campgrounds.length; i++) {
    campgrounds[i].images = [
      {
        url: imageUrls[i % imageUrls.length],
        filename: `campground-${i + 1}`,
      },
    ];

    await campgrounds[i].save();

    console.log(`Image fixed: ${campgrounds[i].title}`);
  }

  console.log("All images fixed!");

  await mongoose.connection.close();
}

fixImages().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
