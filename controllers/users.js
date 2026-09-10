const User = require("../models/user");

// ========================
// REGISTER PAGE
// ========================

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

// ========================
// REGISTER
// ========================

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    const user = new User({
      email,
      username,
    });

    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }

      req.flash("success", "Welcome to YelpCamp!");

      res.redirect("/campgrounds");
    });
  } catch (err) {
    req.flash("error", err.message);

    res.redirect("/register");
  }
};

// ========================
// LOGIN PAGE
// ========================

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

// ========================
// LOGIN
// ========================

module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");

  const redirectUrl = res.locals.returnTo || "/campgrounds";

  delete req.session.returnTo;

  res.redirect(redirectUrl);
};

// ========================
// LOGOUT
// ========================

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    req.flash("success", "Goodbye!");

    res.redirect("/campgrounds");
  });
};
