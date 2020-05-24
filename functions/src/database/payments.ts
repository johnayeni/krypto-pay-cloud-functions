import * as firebaseAdmin from "firebase-admin";

export default () => firebaseAdmin.firestore().collection("payments");
