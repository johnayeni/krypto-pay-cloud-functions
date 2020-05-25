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
app.use(auth);

const webhook = express();
webhook.use(cors({ origin: true }));

const services = app;
services.get("/", getServicesRequest);
exports.services = functions.https.onRequest(services);

const service = app;
service.get("/:serviceCode/billers", getBillersRequest);
exports.service = functions.https.onRequest(service);

const biller = app;
biller.get("/:billerCode/products", getProductsRequest);
exports.biller = functions.https.onRequest(biller);

const transaction = app;
transaction.post("/", createTransactionRequest);
exports.transaction = functions.https.onRequest(transaction);

const payment = webhook;
payment.post("/webhook", paymentWebhook);
exports.payment = functions.https.onRequest(payment);
