const express = require("express");

const router = express.Router({
  mergeParams: true,
});

const catchAsync = require("../utils/catchAsync");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const reviewController = require("../controllers/reviews");

// CREATE

router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(reviewController.createReview),
);

// DELETE

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviewController.deleteReview),
);

module.exports = router;
