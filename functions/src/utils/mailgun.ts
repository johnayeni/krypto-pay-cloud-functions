import * as functions from "firebase-functions";
const CONFIG = functions.config().env;
const MAILGUN_API_KEY = CONFIG.mailgun.apiKey;

const mailgun = require("mailgun-js")({ apiKey: MAILGUN_API_KEY, domain: "peeerpay.app" });

export default mailgun;
