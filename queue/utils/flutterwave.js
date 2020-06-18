const axios = require("axios");

const BASE_URL = "https://api.flutterwave.com";

const flutterwave = axios.create({
  baseURL: BASE_URL,
});

flutterwave.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${process.env.FLUTTERWAVE_TOKEN}`,
  };

  return config;
});

module.exports = flutterwave;
