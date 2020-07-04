import * as firebaseAdmin from "firebase-admin";
import * as express from "express";

import bushaPay from "../utils/busha-pay";
import flutterwave from "../utils/flutterwave";
import transactions from "../database/transactions";

import { AxiosResponse } from "axios";
import { check, validationResult } from "express-validator";
import {
  BushaPayChargeResponse,
  BushaPayChargePayload,
  Transaction,
} from "../utils/types";

const router = express.Router();

const validator = [
  check("billerCode").notEmpty(),
  check("itemCode").notEmpty(),
  check("serviceName").notEmpty(),
  check("serviceCustomerId").notEmpty(),
  check("amount")
    .toInt()
    .isInt({ gt: 499 })
    .withMessage("Least amount that can be processed is N500"),
  check("country")
    .isIn(["NG", "GH", "US", "KE"])
    .withMessage("Cannot process transactions in this region yet"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Email is required for transaction to be processed properly"),
];

export default router.post(
  "/",
  validator,
  async (request: express.Request, response: express.Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({
        errors: errors.array(),
        message: "Validation errors occurred",
      });
    }

    try {
      const {
        billerCode,
        itemCode,
        serviceName,
        amount,
        serviceCustomerId,
        country,
        email,
      } = request.body;

      const validateCustomer = await flutterwave.get(
        `/v3/bill-items/${itemCode}/validate?code=${billerCode}&customer=${serviceCustomerId}`
      );

      if (
        validateCustomer?.data?.status !== "success" ||
        !validateCustomer.data.data
      )
        return response.status(400).json({ message: "Customer ID is invalid" });

      const payload: BushaPayChargePayload = {
        local_price: {
          amount: `${amount + validateCustomer.data.data.fee}`,
          currency: "NGN",
        },
        redirect_url: "https://krypto-pay.netlify.com/buy",
        cancel_url: "https://krypto-pay.netlify.com/buy",
        metadata: {
          email,
          service_customer_id: serviceCustomerId,
          biller_code: billerCode,
          item_code: itemCode,
          service_name: serviceName,
          amount: amount + validateCustomer.data.data.fee,
          country,
        },
      };

      const bushaPayReponse: AxiosResponse<BushaPayChargeResponse> = await bushaPay.post(
        `/charges`,
        payload
      );

      if (!bushaPayReponse?.data?.data?.id)
        return response
          .status(400)
          .json({ message: "Could not process transaction" });

      const transactionId = bushaPayReponse.data.data.id;

      const transaction: Transaction = {
        created: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        currency: bushaPayReponse.data.data.pricing.local.currency,
        amount: bushaPayReponse.data.data.pricing.local.value,
        hosted_url: bushaPayReponse.data.data.hosted_url,
        code: bushaPayReponse.data.data.code,
        payment_reference: "",
        email,
        fees: validateCustomer.data.data.fee,
        service: serviceName,
        service_customer_id: serviceCustomerId,
        status: "created",
      };

      await transactions().doc(transactionId).set(transaction);

      return response
        .status(201)
        .json({ transaction, customer: validateCustomer.data.data });
    } catch (error) {
      return response.status(500).json(error);
    }
  }
);
