const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github").Strategy;
const userController = require("../controllers/userController");
const { userModel } = require("../models/userModel");
require('dotenv').config();

// Local strategy for email/password login
const localLogin = new LocalStrategy(
  {
    usernameField: "email",  // Field for username (email)
    passwordField: "password",  // Field for password
  },
  (email, password, done) => {
    // Try to find a user with the provided email and password
    const user = userController.getUserByEmailIdAndPassword(email, password);
    
    // If the user exists, proceed; otherwise, show error message
    return user
      ? done(null, user)
      : done(null, false, {
          message: "Your login details are not valid. Please try again",
        });
  }
);

// GitHub login strategy for OAuth authentication
const githubLogin = new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,  // GitHub OAuth client ID
    clientSecret: process.env.GITHUB_CLIENT_SECRET,  // GitHub OAuth client secret
    callbackURL: "http://localhost:8000/auth/github/callback",  // Redirect URL after GitHub authentication
  },
  (accessToken, refreshToken, profile, done) => {
    console.log(profile); // Log GitHub profile for debugging purposes

    // Search for a user in the database by the GitHub email
    const user = userModel.findOne(profile.emails[0].value);  // Extract email from GitHub profile

    if (user) {
      // If the user exists in the database, proceed with the existing user
      return done(null, user);
    } else {
      // No user found, so create a new user object
      const newUser = {
        id: profile.id,  // Store the GitHub ID
        name: profile.displayName || profile.username,  // Use display name or username
        email: profile.emails[0].value,  // Use primary email from GitHub profile
        role: "user",  // Default role for new users
      };

      // Add the new user to the database
      userModel.createUser(newUser);

      // Return the newly created user object
      return done(null, newUser);
    }
  }
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);  // Store user ID in the session
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  const user = userController.getUserById(id);
  done(user ? null : { message: "User not found" }, user);  // Retrieve user by ID, or return an error if not found
});

// Apply both strategies to Passport
passport.use(localLogin);  // Use the local login strategy for email/password authentication
passport.use(githubLogin);  // Use the GitHub login strategy for OAuth

module.exports = passport;
