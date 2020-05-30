import axios from "axios";
import * as functions from "firebase-functions";

const CONFIG = functions.config().env;
const FLUTTERWAVE_TOKEN = CONFIG.flutterwave.token;

const BASE_URL = "https://api.flutterwave.com";

const flutterwave = axios.create({
  baseURL: BASE_URL,
});

flutterwave.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${FLUTTERWAVE_TOKEN}`,
  };

  return config;
});

export default flutterwave;
