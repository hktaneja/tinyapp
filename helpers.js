const { users, urlDatabase } = require('./database.js');

// Email LookUp Function
const getUserByEmail = function (email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; // Return the entire user object if found
    }
  }
  return null; // Return null if not found
};

//Generate a Random Short URL ID
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < 6; i++) {
    //get a random number in the range of [0, characters.length] and rounds down a given number to the nearest integer
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

// User LookUp Function
const getUserById = function (id) {
  for (const key in users) {
    if (users[key].id  === id ) {
      return users[key]; // Return the entire user object if found
    }
  }
  return null; // Return null if not found
};


// URLs of logged in user
const urlsForUser = function (user) {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === user.id) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
}

module.exports = {
  getUserByEmail,
  getUserById,
  urlsForUser,
  generateRandomString,
};

