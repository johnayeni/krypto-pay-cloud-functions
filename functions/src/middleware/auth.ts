import * as firebaseAdmin from "firebase-admin";
import { Request, Response, NextFunction } from "express";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  //Check if request is authorized with Firebase ID token
  if (
    (!req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")) &&
    !(req.cookies && req.cookies.__session)
  ) {
    res.status(403).send("Unauthorized");
    return;
  }

  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    // Read the ID Token from the Authorization header.
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else if (req.cookies) {
    console.log('Found "__session" cookie');
    // Read the ID Token from cookie.
    idToken = req.cookies.__session;
  } else {
    // No cookie
    res.status(403).send("Unauthorized");
    return;
  }

  try {
    const decodedIdToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    //@ts-ignore
    req.user = decodedIdToken;
    next();
    return;
  } catch (error) {
    res.status(403).send("Unauthorized");
    return;
  }
};

export default auth;
