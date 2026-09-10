const mongoose = require("mongoose");

const { Schema } = mongoose;

const opts = {
  toJSON: {
    virtuals: true,
  },
};

const campgroundSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    // GEOMETRY
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    // MULTIPLE IMAGES
    images: [
      {
        url: String,
        filename: String,
      },
    ],

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts,
);

// POPUP VIRTUAL
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `
        <strong>
            <a href="/campgrounds/${this._id}">
                ${this.title}
            </a>
        </strong>
        <p>${this.description.substring(0, 20)}...</p>
    `;
});

// THUMBNAIL VIRTUAL
campgroundSchema.virtual("thumbnail").get(function () {
  if (this.images.length) {
    return this.images[0].url;
  }

  return "https://dummyimage.com/300x200";
});

module.exports = mongoose.model("Campground", campgroundSchema);
