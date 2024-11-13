const userModel = require("../models/userModel").userModel;

// Finds a user by email and password for local authentication
const getUserByEmailIdAndPassword = (email, password) => {
  let user = userModel.findOne(email);
  if (user) {
    if (isUserValid(user, password)) {
      return user;
    }
  }
  return null;
};

// Finds a user by ID, used in session management
const getUserById = (id) => {
  let user = userModel.findById(id);
  if (user) {
    return user;
  }
  return null;
};

// Finds a user by GitHub ID for GitHub authentication
const getUserByGitHubId = (githubId) => {
  return userModel.findOne({ githubId }) || null;
};

// Creates a new user with GitHub details for first-time login via GitHub
const createGitHubUser = ({ githubId, username, email }) => {
  const newUser = {
    githubId,
    username,
    email,
  };
  return userModel.create(newUser);
};

// Helper function to validate user password for local authentication
function isUserValid(user, password) {
  return user.password === password;
}

module.exports = {
  getUserByEmailIdAndPassword,
  getUserById,
  getUserByGitHubId,
  createGitHubUser,
};
