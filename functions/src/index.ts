import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
import auth from "./middleware/auth";

import getServicesRequest from "./requests/get-services";
import getBillersRequest from "./requests/get-billers";
import getProductsRequest from "./requests/get-products";
import createTransactionRequest from "./requests/create-transaction";
import paymentWebhook from "./requests/payment-webhook";

firebaseAdmin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
const main = app;
main.use(auth);

const services = main;
services.get("/", getServicesRequest);
exports.services = functions.https.onRequest(services);

const service = main;
service.get("/:serviceCode/billers", getBillersRequest);
exports.service = functions.https.onRequest(service);

const biller = main;
biller.get("/:billerCode/products", getProductsRequest);
exports.biller = functions.https.onRequest(biller);

const transaction = main;
transaction.post("/", createTransactionRequest);
exports.transaction = functions.https.onRequest(transaction);

const payment = app;
payment.post("/webhook", paymentWebhook);
exports.payment = functions.https.onRequest(payment);
