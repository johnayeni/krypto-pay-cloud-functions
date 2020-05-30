import * as express from "express";
import * as firebaseAdmin from "firebase-admin";

import flutterwave from "../utils/flutterwave";
import transactions from "../database/transactions";
import payments from "../database/payments";

import { AxiosResponse } from "axios";
import {
  BushaPayWebhookPayload,
  FlutterwavePaymentResponse,
  FlutterwavePaymentPayload,
  Payment,
} from "../utils/types";

const router = express.Router();

export default router.post(
  "/webhook",
  async (
    request: express.Request<any, any, BushaPayWebhookPayload>,
    response: express.Response
  ) => {
    try {
      const { event } = request.body;

      const transactionId = event.data.id;

      if (event.type !== "charge:completed") {
        const [, currentTransactionStatus] = event.type.split(":");
        await transactions()
          .doc(transactionId)
          .update({ status: currentTransactionStatus });
        response.status(200).end();
      }

      const payload: FlutterwavePaymentPayload = {
        country: event.data.metadata.country,
        customer: event.data.metadata.service_customer_id,
        recurrence: "ONCE",
        type: event.data.metadata.service_name,
        amount: event.data.pricing.local.value,
        reference: event.data.code,
      };

      const res: AxiosResponse<FlutterwavePaymentResponse> = await flutterwave.post(
        `/v3/bills`,
        payload
      );

      const { data, status } = res.data;

      if (status !== "success" || !data) {
        await transactions().doc(transactionId).update({
          status,
        });

        response.status(200).end();
        return;
      }

      const paymentId = data.flw_ref;

      const { amount, tx_ref, flw_ref } = data;

      const payment: Payment = {
        created: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        amount,
        tx_ref,
        flw_ref,
        email: event.data.metadata.email,
        service_customer_id: event.data.metadata.service_customer_id,
      };

      await payments().doc(paymentId).set(payment);

      await transactions().doc(transactionId).update({
        status,
        payment_reference: paymentId,
      });

      response.status(200).end();
    } catch (error) {
      console.error(new Error(error));
      response.status(500).end();
    }
  }
);
