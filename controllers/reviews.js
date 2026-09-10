const Review = require("../models/review");
const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");

// ========================
// CREATE REVIEW
// ========================

module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    throw new ExpressError("Campground Not Found", 404);
  }

  const review = new Review(req.body.review);

  review.author = req.user._id;

  campground.reviews.push(review);

  await review.save();
  await campground.save();

  req.flash("success", "Successfully created review!");

  res.redirect(`/campgrounds/${campground._id}`);
};

// ========================
// DELETE REVIEW
// ========================

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const campground = await Campground.findByIdAndUpdate(id, {
    $pull: {
      reviews: reviewId,
    },
  });

  if (!campground) {
    throw new ExpressError("Campground Not Found", 404);
  }

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Successfully deleted review!");

  res.redirect(`/campgrounds/${id}`);
};
