import { Request, Response, NextFunction } from "express";
import * as functions from "firebase-functions";
import * as jose from "node-jose";

const CONFIG = functions.config().env;
const BUSHA_API_SECRET = CONFIG.bushaPay.secret;

const webhookAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers["X-BP-Webhook-Signature"]) {
    console.error(new Error("Unauthorized webhook call"));
    res.status(403).send("Unauthorized");
    return;
  }

  const signature = req.headers["X-BP-Webhook-Signature"];
  try {
    const options = { algorithms: ["HS256"] };
    //@ts-ignore
    const decoded = await jose.JWS.createVerify(BUSHA_API_SECRET, options).verify(signature);
    if (!decoded) {
      console.error(new Error("Unauthorized webhook call"));
      res.status(403).send("Unauthorized");
      return;
    }
    next();
    return;
  } catch (error) {
    res.status(403).send("Unauthorized");
    console.error(new Error("Failed webhook call"));
    return;
  }
};

export default webhookAuth;
