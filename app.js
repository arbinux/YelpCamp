const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const campgroundSchema = require("./Schema");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const Joi = require("joi");

const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const Campground = require("./models/campground");

// ========================
// DATABASE CONNECTION
// ========================

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error");
    console.log(err);
  });

const app = express();

// ========================
// SETTINGS
// ========================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ========================
// MIDDLEWARE
// ========================

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// ========================
// HOME
// ========================

app.get("/", (req, res) => {
  res.render("home");
});

// ========================
// CAMPGROUND ROUTES
// ========================

// INDEX
// GET /campgrounds

app.get(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render("campgrounds/index", {
      campgrounds,
    });
  }),
);

// ========================
// JOI VALIDATION
// ========================

const validateCampground = (req, res, next) => {
   

  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const msg = error.details.map((el) => el.message).join(",");

    throw new ExpressError(msg, 400);
  }

  next();
};

// ========================
// NEW
// GET /campgrounds/new
// ========================

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// ========================
// CREATE
// POST /campgrounds
// ========================

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);

    await campground.save();

    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

// ========================
// EDIT
// GET /campgrounds/:id/edit
// ========================

app.get(
  "/campgrounds/:id/edit",
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
      throw new ExpressError("Campground Not Found", 404);
    }

    res.render("campgrounds/edit", {
      campground,
    });
  }),
);

// ========================
// SHOW
// GET /campgrounds/:id
// ========================

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);

    if (!campground) {
      throw new ExpressError("Campground Not Found", 404);
    }

    res.render("campgrounds/show", {
      campground,
    });
  }),
);

// ========================
// UPDATE
// PUT /campgrounds/:id
// ========================

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndUpdate(
      id,
      {
        ...req.body.campground,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!campground) {
      throw new ExpressError("Campground Not Found", 404);
    }

    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

// ========================
// DELETE
// DELETE /campgrounds/:id
// ========================

app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findByIdAndDelete(id);

    if (!campground) {
      throw new ExpressError("Campground Not Found", 404);
    }

    res.redirect("/campgrounds");
  }),
);

// ========================
// TEST ERROR
// ========================

app.get("/test-error", (req, res) => {
  throw new ExpressError("This is a test error!", 500);
});

// ========================
// 404 - ROUTE NOT FOUND
// ========================

app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ========================
// ERROR HANDLER
// ========================

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something Went Wrong!" } = err;

  res.status(statusCode).render("error", {
    message,
  });
});

// ========================
// SERVER
// ========================

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
