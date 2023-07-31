// Email LookUp Function
const getUserByEmail = function (email, users) {
  for (const key in users) {
    if (users[key].email === email) {
      return users[key]; // Return the entire user object if found
    }
  }
  return null; // Return null if not found
};
module.exports = { getUserByEmail };