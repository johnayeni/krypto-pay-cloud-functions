import { Request, Response } from "express";
import flutterwaveVAS from "../utils/flutterwave-vas";

export default async (request: Request, response: Response) => {
  try {
    const res = await flutterwaveVAS.get("/bill/service");
    return response.status(200).json(res.data);
  } catch (error) {
    return response.status(500).json(error);
  }
};
