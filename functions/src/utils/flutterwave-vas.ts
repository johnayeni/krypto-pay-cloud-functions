import axios from "axios";
import * as functions from "firebase-functions";

const CONFIG = functions.config().env;
const FLUTTERWAVE_VAS_MERCHANT_KEY = CONFIG.flutterwaveVAS.token;
const FLUTTERWAVE_VAS_MERCHANT_TOKEN = Buffer.from(
  `${FLUTTERWAVE_VAS_MERCHANT_KEY}:`
).toString("base64");

const BASE_URL = "https://flutterwavestagingv2.com/billpayment/api";

const flutterwaveVAS = axios.create({
  baseURL: BASE_URL,
});

flutterwaveVAS.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Basic ${FLUTTERWAVE_VAS_MERCHANT_TOKEN}`,
  };

  return config;
});

export default flutterwaveVAS;
