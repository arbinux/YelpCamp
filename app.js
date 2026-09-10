if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const User = require("./models/user");
const sanitizeV5 = require("./utils/mongoSanitizeV5.js");
const helmet = require("helmet");

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdn.maptiler.com",
        ],

        styleSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdn.maptiler.com",
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com",
          "https://api.maptiler.com",
        ],

        connectSrc: ["'self'", "https://api.maptiler.com"],

        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],

        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
      },
    },
  }),
);

app.set("query parser", "extended");

// ========================
// DATABASE
// ========================

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp-map")
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("MongoDB Connection Error");
    console.log(err);
  });

// ========================
// SETTINGS
// ========================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(sanitizeV5({ replaceWith: "_" }));

// ========================
// MIDDLEWARE
// ========================

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "public")));

// ========================
// SESSION
// ========================

const sessionConfig = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// ========================
// FLASH
// ========================

app.use(flash());

// ========================
// PASSPORT
// ========================

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ========================
// LOCALS
// ========================

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ========================
// HOME
// ========================

app.get("/", (req, res) => {
  res.render("home");
});

// ========================
// ROUTERS
// ========================

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// ========================
// TEST ERROR
// ========================

app.get("/test-error", (req, res) => {
  throw new ExpressError("This is a test error!", 500);
});

// ========================
// 404
// ========================

app.all("/{*path}", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// ========================
// ERROR HANDLER
// ========================

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  const message =
    process.env.NODE_ENV === "production"
      ? "Something Went Wrong!"
      : err.message;

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
