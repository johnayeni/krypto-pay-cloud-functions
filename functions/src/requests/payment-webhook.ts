import { Request, Response } from "express";
import { AxiosResponse } from "axios";
import flutterwaveVAS from "../utils/flutterwave-vas";
import transactions from "../database/transactions";
import payments from "../database/payments";
import {
  BushaPayWebhookPayload,
  FlutterwaveVasPaymentResponse,
  Payment,
} from "../utils/types";

export default async (
  request: Request<any, any, BushaPayWebhookPayload>,
  response: Response
) => {
  try {
    const { event } = request.body;

    const transactionId = event.data.id;

    if (event.type === "charge:completed") {
      const payload = {
        billercode: event.data.metadata.biller_code,
        productcode: event.data.metadata.product_code,
        amount: event.data.pricing.local.value,
        customerid: event.data.metadata.customer_id,
        transactionreference: event.data.code,
      };

      const res: AxiosResponse<FlutterwaveVasPaymentResponse> = await flutterwaveVAS.post(
        `/bill/pay`,
        payload
      );

      const { data, status } = res.data;

      if (status === "success" && data) {
        const paymentId = data.flw_reference;

        const {
          date,
          amount,
          transaction_reference,
          flw_reference,
          biller_code,
          product_code,
        } = data;

        const payment: Payment = {
          date,
          amount,
          transaction_reference,
          flw_reference,
          biller_code,
          product_code,
        };

        await payments().doc(paymentId).set(payment);

        await transactions().doc(transactionId).update({
          status,
          payment_reference: paymentId,
        });
      } else {
        await transactions().doc(transactionId).update({
          status,
        });
      }
    } else {
      const [, status] = event.type.split(":");

      await transactions().doc(transactionId).update({ status });
    }

    response.status(200).end();
  } catch (error) {
    console.error(new Error(error));
    response.status(500).end();
  }
};
