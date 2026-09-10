const Campground = require("../models/campground");
const ExpressError = require("../utils/ExpressError");
const { cloudinary } = require("../cloudinary");

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

// ========================
// INDEX
// GET /campgrounds
// ========================

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({}).populate("author");

  res.render("campgrounds/index", {
    campgrounds,
  });
};

// ========================
// RENDER NEW FORM
// GET /campgrounds/new
// ========================

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

// ========================
// CREATE
// POST /campgrounds
// ========================

module.exports.createCampground = async (req, res) => {
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );

  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );

    return res.redirect("/campgrounds/new");
  }

  const campground = new Campground(req.body.campground);

  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;

  campground.images = (req.files || []).map((file) => ({
    url: file.path,
    filename: file.filename,
  }));

  campground.author = req.user._id;

  await campground.save();

  console.log(campground);

  req.flash("success", "Successfully made a new campground!");

  res.redirect(`/campgrounds/${campground._id}`);
};

// ========================
// SHOW
// GET /campgrounds/:id
// ========================

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate("author")
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    });

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/show", {
    campground,
  });
};

// ========================
// RENDER EDIT FORM
// GET /campgrounds/:id/edit
// ========================

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);

  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", {
    campground,
  });
};

// ========================
// UPDATE
// PUT /campgrounds/:id
// ========================

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;

  // Geocoding
  const geoData = await maptilerClient.geocoding.forward(
    req.body.campground.location,
    { limit: 1 },
  );

  if (!geoData.features?.length) {
    req.flash(
      "error",
      "Could not geocode that location. Please try again and enter a valid location.",
    );

    return res.redirect(`/campgrounds/${id}/edit`);
  }

  // Find campground
  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    { new: true, runValidators: true },
  );

  if (!campground) {
    throw new ExpressError("Campground Not Found", 404);
  }

  // Update geometry and normalized location
  campground.geometry = geoData.features[0].geometry;
  campground.location = geoData.features[0].place_name;

  // ========================
  // ADD NEW IMAGES
  // ========================

  if (req.files && req.files.length > 0) {
    const imgs = req.files.map((file) => ({
      url: file.path,
      filename: file.filename,
    }));

    campground.images.push(...imgs);
  }

  // ========================
  // DELETE SELECTED IMAGES
  // ========================

  const deleteImages = [].concat(req.body.deleteImages || []);

  if (deleteImages.length > 0) {
    // Delete from Cloudinary
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }

    // Delete from MongoDB
    campground.images = campground.images.filter(
      (image) => !deleteImages.includes(image.filename),
    );
  }

  // Save final campground
  await campground.save();

  req.flash("success", "Successfully updated campground!");

  res.redirect(`/campgrounds/${campground._id}`);
};

// ========================
// DELETE
// DELETE /campgrounds/:id
// ========================

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findByIdAndDelete(id);

  if (!campground) {
    throw new ExpressError("Campground Not Found", 404);
  }

  req.flash("success", "Successfully deleted campground!");

  res.redirect("/campgrounds");
};
