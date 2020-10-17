import * as express from "express";
import * as cors from "cors";
import * as functions from "firebase-functions";
import * as firebaseAdmin from "firebase-admin";

import webhookAuth from "./middleware/webhook-auth";

import categoriesRoutes from "./routes/categories";
import transactionRoutes from "./routes/transaction";
import paymentRoutes from "./routes/payment";
import sendEmail from "./utils/send-email";
import { Payment } from "./utils/types";

firebaseAdmin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const webhook = express();
webhook.use(cors({ origin: true }));
webhook.use(webhookAuth);

const categories = app;
categories.use(categoriesRoutes);
exports.categories = functions.https.onRequest(categories);

const transaction = app;
transaction.use(transactionRoutes);
exports.transaction = functions.https.onRequest(transaction);

const payment = webhook;
payment.use(paymentRoutes);
exports.payment = functions.https.onRequest(payment);

exports.sendReceipt = functions.firestore.document("payments/{paymentId}").onCreate((snap) => {
  const data = snap.data() as Payment;
  if (data.email) {
    sendEmail({ ...data, type: "success" });
  }
});
