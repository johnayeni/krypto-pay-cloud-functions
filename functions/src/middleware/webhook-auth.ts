import { Request, Response, NextFunction } from "express";
import * as functions from "firebase-functions";

const crypto = require("crypto");

const CONFIG = functions.config().env;
const BUSHA_API_SECRET = CONFIG.bushaPay.secret;

const webhookAuth = async (req: Request, res: Response, next: NextFunction) => {
  console.log("headers:", JSON.stringify(req.headers));
  if (!req.headers["x-bp-webhook-signature"]) {
    console.error(new Error("Unauthorized webhook call: no X-BP-HEADER"));
    res.status(403).send("Unauthorized");
    return;
  }

  const signature = req.headers["x-bp-webhook-signature"];
  try {
    //@ts-ignore
    const computedSignature = crypto
      .createHmac("sha256", BUSHA_API_SECRET)
      .update(Buffer.from(JSON.stringify(req.body)))
      .digest("hex");

    if (signature !== computedSignature) {
      console.log("signature", signature);
      console.log("computed signature", computedSignature);
      console.error(new Error("Unauthorized webhook call: invalid signature"));
      res.status(403).send("Unauthorized");
      return;
    }
    next();
    return;
  } catch (error) {
    res.status(403).send("Unauthorized");
    console.error(new Error(`Failed webhook call: ${error.stack || error.message}`));
    return;
  }
};

export default webhookAuth;
