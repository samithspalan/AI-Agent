// user.js - User data management logic
const getUserProfile = (userId) => {
  return { id: userId, username: 'jdoe', email: 'jdoe@gmail.com' };
};

const updateAccount = (userId, data) => {
  console.log(`Updating user ${userId} with data:`, data);
  return { success: true, updated: true };
};

module.exports = { getUserProfile, updateAccount };
