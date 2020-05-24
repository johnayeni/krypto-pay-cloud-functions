import { AxiosResponse } from "axios";
import { Request, Response } from "express";
import bushaPay from "../utils/busha-pay";
import transactions from "../database/transactions";
import {
  BushaPayChargeResponse,
  BushaPayChargePayload,
  Transaction,
} from "../utils/types";

export default async (request: Request, response: Response) => {
  try {
    //@ts-ignore
    const user = request.user;

    if (user) {
      const {
        billerCode,
        productCode,
        amount,
        phoneNumber,
        description,
      } = request.body;

      const payload: BushaPayChargePayload = {
        description,
        local_price: {
          amount: `${amount}`,
          currency: "NGN",
        },
        redirect_url: "https://example.com",
        cancel_url: "https://goal.com",
        metadata: {
          customer_id: phoneNumber,
          biller_code: billerCode,
          product_code: productCode,
          amount: amount,
        },
      };

      const bushaPayReponse: AxiosResponse<BushaPayChargeResponse> = await bushaPay.post(
        `/charges`,
        payload
      );

      if (bushaPayReponse) {
        const transactionId = bushaPayReponse.data.data.id;

        const transaction: Transaction = {
          description: bushaPayReponse.data.data.description,
          fiat_currency: bushaPayReponse.data.data.pricing.local.currency,
          fiat_amount: bushaPayReponse.data.data.pricing.local.value,
          crypto_currency: "BTC",
          crypto_amount: bushaPayReponse.data.data.pricing.bitcoin.value,
          hosted_url: bushaPayReponse.data.data.hosted_url,
          code: bushaPayReponse.data.data.code,
          payment_reference: "",
          user_id: user.uid,
          status: "created",
        };

        await transactions().doc(transactionId).set(transaction);

        return response.status(201).json(transaction);
      } else {
        return response
          .status(500)
          .json({ message: "Could not process transaction" });
      }
    } else {
      return response
        .status(500)
        .json({ message: "Could not process transaction" });
    }
  } catch (error) {
    return response.status(500).json(error);
  }
};
