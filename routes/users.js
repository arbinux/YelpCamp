const express = require("express");
const router = express.Router();

const passport = require("passport");
const userController = require("../controllers/users");

const { storeReturnTo } = require("../middleware");

// ========================
// REGISTER
// ========================

router
  .route("/register")
  .get(userController.renderRegister)
  .post(userController.register);

// ========================
// LOGIN PAGE
// ========================

router
  .route("/login")
  .get(userController.renderLogin)
  .post( 
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    userController.login,
  );

// ========================
// LOGOUT
// ========================

router.get("/logout", userController.logout);

module.exports = router;
