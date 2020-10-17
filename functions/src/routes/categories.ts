import * as express from "express";
import flutterwave from "../utils/flutterwave";
import {
  getCategoriesForCountry,
  getCategoriesForBillerName,
  sanitizeCategories,
} from "../utils/helpers";

const router = express.Router();

export default router.get("/", async (_, response: express.Response) => {
  try {
    const res = await flutterwave.get("/v3/bill-categories");

    const { status, data } = res.data;
    if (status !== "success" || !data)
      return response.status(400).json({ message: "Could not fetch categories" });

    const filteredCategories = getCategoriesForBillerName(
      getCategoriesForCountry(data, "NG"),
      "AIRTIME"
    );

    const sanitizedCategories = sanitizeCategories(filteredCategories);

    return response.status(200).json(sanitizedCategories);
  } catch (error) {
    return response.status(500).json(error);
  }
});
