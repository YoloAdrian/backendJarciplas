require('dotenv').config();

const config = {
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
};

module.exports = config;
