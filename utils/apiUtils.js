// utils/apiUtils.js
const { request } = require('@playwright/test');

const BASE_URL = 'https://buggy.justtestit.org'; // Adjust if different

// 🔐 Register User
async function registerUser(userData) {
  const context = await request.newContext();
  const response = await context.post(`${BASE_URL}/register`, {
    data: userData,
  });
  return response;
}

// 🔐 Login User
async function loginUser(username, password) {
  const context = await request.newContext();
  const response = await context.post(`${BASE_URL}`, {
    form: {
      login: username,
      password: password,
    },
  });

  const cookies = await context.storageState(); // capture auth state
  return { response, cookies };
}

module.exports = {
  registerUser,
  loginUser,
};
