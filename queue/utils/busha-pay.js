const axios = require("axios");

const BASE_URL = "https://api.staging.pay.busha.co";

const bushaPay = axios.create({
  baseURL: BASE_URL,
});

bushaPay.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    "X-BP-Api-Key": process.env.BUSHA_API_KEY,
    "Content-Type": "application/json",
  };

  return config;
});

module.exports = bushaPay;
