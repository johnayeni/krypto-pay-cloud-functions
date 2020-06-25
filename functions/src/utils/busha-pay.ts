import axios from "axios";
import * as functions from "firebase-functions";

const CONFIG = functions.config().env;
const BUSHA_API_KEY = CONFIG.bushaPay.key;
// const BUSHA_WEBHOOK_SECRET = config.bushaPay.secret;

const BASE_URL = "https://api.pay.busha.co";

const bushaPay = axios.create({
  baseURL: BASE_URL,
});

bushaPay.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    "X-BP-Api-Key": BUSHA_API_KEY,
    "Content-Type": "application/json",
  };

  return config;
});

export default bushaPay;
