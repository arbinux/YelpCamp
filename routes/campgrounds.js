const express = require("express");
const router = express.Router();

const campgroundController = require("../controllers/campgrounds");

const catchAsync = require("../utils/catchAsync");

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

const multer = require("multer");

const { storage } = require("../cloudinary");

const upload = multer({ storage });

// ========================
// INDEX + CREATE
// ========================

router
  .route("/")

  .get(catchAsync(campgroundController.index))

  .post(
    isLoggedIn,
    upload.array("images", 5),
    validateCampground,
    catchAsync(campgroundController.createCampground),
  );

// ========================
// NEW
// ========================

router.get("/new", isLoggedIn, campgroundController.renderNewForm);

// ========================
// SHOW
// ========================

router.get("/:id", catchAsync(campgroundController.showCampground));

// ========================
// EDIT
// ========================

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.renderEditForm),
);

// ========================
// UPDATE
// ========================

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("images", 5),
  validateCampground,
  catchAsync(campgroundController.updateCampground),
);

// ========================
// DELETE
// ========================

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundController.deleteCampground),
);

module.exports = router;
