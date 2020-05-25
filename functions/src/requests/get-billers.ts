import { Request, Response } from "express";
import flutterwaveVAS from "../utils/flutterwave-vas";

export default async (request: Request, response: Response) => {
  try {
    const { serviceCode } = request.params;

    const res = await flutterwaveVAS.get(`/bill/fetch/${serviceCode}`);

    const { status, data } = res.data;
    if (status === "success") {
      return response.status(200).json(data.billers);
    } else {
      return response.status(400).json({ message: "Could not fetch billers" });
    }
  } catch (error) {
    return response.status(500).json(error);
  }
};
