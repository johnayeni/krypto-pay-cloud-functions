require("dotenv").config();
const Queue = require("firebase-queue");
const FirebaseAdmin = require("firebase-admin");
const bushaPay = require("./utils/busha-pay");
const flutterwave = require("./utils/flutterwave");
const asyncWrap = require("./utils/async-wrap");

const serviceAccount = require("./serviceAccountCredentials.json");

FirebaseAdmin.initializeApp({
  credential: FirebaseAdmin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const queueRef = FirebaseAdmin.database().ref("queue/failed_payments");

const queue = new Queue(queueRef, async (data, progress, resolve, reject) => {
  try {
    const { transactionId, retries } = data;

    if (retries >= 3) {
      resolve();
      return;
    }

    const transaction = await bushaPay.get(`/charges/${transactionId}`);

    if (
      !transaction &&
      !transaction.data &&
      !transaction.data.data &&
      !transaction.data.data.id &&
      !transaction.data.data.id !== transactionId
    ) {
      resolve();
      return;
    }

    const payload = {
      country: data.metadata.country,
      customer: data.metadata.service_customer_id,
      recurrence: "ONCE",
      type: data.metadata.service_name,
      amount: data.pricing.local.value,
      reference: data.code,
    };

    const [err, res] = await asyncWrap(flutterwave.post(`/v3/bills`, payload));

    if (
      err ||
      !res ||
      !res.data ||
      !res.data.data ||
      !res.data.status ||
      res.data.status !== "success"
    ) {
      if (retries < 3) {
        const queueRef = firebase.database().ref("queue/failed_payments/tasks");
        queueRef.push({ transactionId, retries: retries + 1 });
      }
      resolve();
      return;
    }

    console.log(res.data);

    const { data } = res.data;

    const paymentId = data.flw_ref;

    const { amount, tx_ref, flw_ref } = data;

    const payment = {
      created: new Date().toString(),
      amount,
      tx_ref,
      flw_ref,
      email: data.metadata.email,
      service_customer_id: data.metadata.service_customer_id,
    };

    await FirebaseAdmin.firestore()
      .collection("payments")
      .doc(paymentId)
      .set(payment);

    await FirebaseAdmin.firestore()
      .collection("transactions")
      .doc(transactionId)
      .update({
        status: "payment_success",
        payment_reference: paymentId,
      });

    resolve();
  } catch (error) {
    console.error(error);
    reject();
  }
});
