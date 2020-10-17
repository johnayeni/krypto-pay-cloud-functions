import * as express from "express";
import * as firebaseAdmin from "firebase-admin";

import flutterwave from "../utils/flutterwave";
import transactions from "../database/transactions";
import payments from "../database/payments";
import asyncWrap from "../utils/async-wrap";

import { BushaPayWebhookPayload, FlutterwavePaymentPayload, Payment } from "../utils/types";

const router = express.Router();

export default router.post(
  "/webhook",
  async (
    request: express.Request<any, any, BushaPayWebhookPayload>,
    response: express.Response
  ) => {
    try {
      const { event } = request.body;

      console.info("webhook payload", request.body);

      const transactionId = event.data.id;

      const transaction = await transactions().doc(transactionId).get();

      if (!transaction.exists) {
        console.info("Non-existent transaction", transactionId);
        response.status(400).end();
      }

      if (event.type !== "charge:completed") {
        const [, currentTransactionStatus] = event.type.split(":");
        await transactions().doc(transactionId).update({ status: currentTransactionStatus });
        response.status(200).end();
        return;
      }

      const payload: FlutterwavePaymentPayload = {
        country: event.data.metadata.country,
        customer: event.data.metadata.service_customer_id,
        recurrence: "ONCE",
        type: event.data.metadata.service_name,
        amount: event.data.pricing.local.value,
        reference: event.data.code,
      };

      const [err, res] = await asyncWrap(flutterwave.post(`/v3/bills`, payload));

      if (err || res?.data?.status !== "success" || !res?.data?.data) {
        await transactions().doc(transactionId).update({
          status: "payment_failed",
        });
        if (err) {
          console.error(new Error(`Failed payment: ${err.stack || err.message}}`));
        }
        response.status(500).end();
        return;
      }

      console.info("payment response: ", res);
      const { data } = res.data;

      const paymentId = data.flw_ref;

      const { amount, reference, flw_ref } = data;

      const payment: Payment = {
        created: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        amount,
        tx_ref: reference,
        flw_ref,
        email: event.data.metadata.email,
        service: event.data.metadata.service_name,
        service_customer_id: event.data.metadata.service_customer_id,
      };

      await payments().doc(paymentId).set(payment);

      await transactions().doc(transactionId).update({
        status: "payment_success",
        payment_reference: paymentId,
      });

      response.status(200).end();
    } catch (error) {
      console.error(new Error(`Failed webhook payment: ${error.stack || error.message}}`));
      response.status(500).end();
    }
  }
);
