import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";
// import auth from "./middleware/auth";

import categoriesRoutes from "./routes/categories";
import transactionRoutes from "./routes/transaction";
import paymentRoutes from "./routes/payment";

firebaseAdmin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const webhook = express();
webhook.use(cors({ origin: true }));

const categories = app;
categories.use(categoriesRoutes);
exports.categories = functions.https.onRequest(categories);

const transaction = app;
transaction.use(transactionRoutes);
exports.transaction = functions.https.onRequest(transaction);

const payment = webhook;
payment.use(paymentRoutes);
exports.payment = functions.https.onRequest(payment);
