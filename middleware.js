// middleware.js

const { campgroundSchema, reviewSchema } = require("./Schema");
const  ExpressError  = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");
// ========================
// IS LOGGED IN
// ========================

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;

    req.flash("error", "You must be signed in first!");

    return res.redirect("/login");
  }

  next();
};

// ========================
// STORE RETURN TO
// ========================

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }

  next();
};

// ========================
// VALIDATION
// ========================

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(msg, 400);
  }

  next();
};

// ========================
// IS AUTHOR
// ========================

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;

  const campground = await Campground.findById(id);

  // Campground doesn't exist
  if (!campground) {
    throw new ExpressError("Campground Not Found", 404);
  }

  // Campground has no author
  if (!campground.author) {
    req.flash("error", "This campground has no author!");

    return res.redirect(`/campgrounds/${id}`);
  }

  // User is not the author
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");

    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};


module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(msg, 400);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ExpressError("Review Not Found", 404);
  }

  if (!review.author) {
    req.flash("error", "This review has no author!");

    return res.redirect(`/campgrounds/${req.params.id}`);
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");

    return res.redirect(`/campgrounds/${req.params.id}`);
  }

  next();
};