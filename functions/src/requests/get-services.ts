import { Request, Response } from "express";
import flutterwaveVAS from "../utils/flutterwave-vas";

export default async (request: Request, response: Response) => {
  try {
    const res = await flutterwaveVAS.get("/bill/service");
    const { status, data } = res.data;
    if (status === "success") {
      return response.status(200).json(data.services);
    } else {
      return response.status(400).json({ message: "Could not fetch services" });
    }
  } catch (error) {
    return response.status(500).json(error);
  }
};
