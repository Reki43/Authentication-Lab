const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureAdmin } = require("../middleware/checkAuth");
const { database } = require("../models/userModel");

// Home route - accessible to everyone
router.get("/", (req, res) => {
  res.send("Welcome to the Home Page!");
});

// Dashboard route - accessible only to authenticated users
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// Admin route - accessible only to authenticated users with admin role
router.get("/admin", ensureAuthenticated, ensureAdmin, (req, res) => {
  // Get all active sessions
  const sessionList = Object.keys(req.sessionStore.sessions).map(sessionId => {
    const sessionData = JSON.parse(req.sessionStore.sessions[sessionId]);
    return {
      sessionId,
      sessionUser: sessionData.passport.user
    };
  });
  // Pass session list to the view
  res.render("admin", { user: req.user, sessionList });
});

// Revoke session route - admin can revoke a user's session
router.post("/admin/revoke/:sessionId", ensureAuthenticated, ensureAdmin, (req, res) => {
  req.sessionStore.destroy(req.params.sessionId, (err) => {
    if (err) {
      return res.status(500).send("Error revoking session.");
    }
    res.redirect("/admin");
  });
});

module.exports = router;
