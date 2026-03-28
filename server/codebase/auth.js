// auth.js - Sample authentication logic
const login = (username, password) => {
  if (username === 'admin' && password === 'password123') {
    return { success: true, user: { id: 1, role: 'admin' } };
  }
  return { success: false, message: 'Invalid credentials' };
};

const logout = () => {
  console.log('User logged out');
};

module.exports = { login, logout };
