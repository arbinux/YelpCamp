const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const Campground = require("./models/campground");

// ========================
// DATABASE CONNECTION
// ========================

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp"); 
const db = mongoose.connection; 
db.on("error", console.error.bind(console, "connection error:")); 
db.once("open", () => {
  console.log("Database Connected");
});

// ========================
// EXPRESS
// ========================

const app = express();

// ========================
// SETTINGS
// ========================

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ========================
// MIDDLEWARE
// ========================

 
app.use(express.urlencoded({ extended: true })); // Parse form data 
app.use(methodOverride("_method"));// Allows PUT and DELETE from HTML forms

// ========================
// HOME
// ========================

app.get("/", (req, res) => {
  res.render("home");
});

// ========================
// CAMPGROUND ROUTES
// ========================

// ------------------------
// INDEX
// GET /campgrounds
// Show all campgrounds
// ------------------------

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});

  res.render("campgrounds/index", {
    campgrounds,
  });
});

// ------------------------
// NEW
// GET /campgrounds/new
// Show form for new campground
// ------------------------

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// ------------------------
// CREATE
// POST /campgrounds
// Create new campground
// ------------------------

app.post("/campgrounds", async (req, res) => {
  const campground = new Campground(req.body.campground);

  await campground.save();

  res.redirect(`/campgrounds/${campground._id}`);
});

// ------------------------
// EDIT
// GET /campgrounds/:id/edit
// Show edit form
// ------------------------

app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findById(id);

  res.render("campgrounds/edit", {
    campground,
  });
});

// ------------------------
// SHOW
// GET /campgrounds/:id
// Show one campground
// ------------------------

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findById(id);

  res.render("campgrounds/show", {
    campground,
  });
});

// ------------------------
// UPDATE
// PUT /campgrounds/:id
// Update campground
// ------------------------

app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findByIdAndUpdate(
    id,
    { ...req.body.campground },
    {
      new: true,
      runValidators: true,
    },
  );

  res.redirect(`/campgrounds/${campground._id}`);
});

// ------------------------
// DELETE
// DELETE /campgrounds/:id
// Delete campground
// ------------------------

app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;

  await Campground.findByIdAndDelete(id);

  res.redirect("/campgrounds");
});

// ========================
// SERVER
// ========================

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
