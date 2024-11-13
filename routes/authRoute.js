const express = require("express");
const passport = require("../middleware/passport");
const { forwardAuthenticated } = require("../middleware/checkAuth");

const router = express.Router();

// Route to display login page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Route to handle login
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
  })
);

// Route to initiate GitHub login
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback route
router.get(
  "/github/callback",
  passport.authenticate("github", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
  })
);

// Route for logging out
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/auth/login");
});

// Route for dashboard (Only accessible if logged in)
router.get("/dashboard", (req, res) => {
  if (!req.user) {
    return res.redirect("/auth/login");
  }
  res.render("dashboard", { user: req.user });
});

module.exports = router;
