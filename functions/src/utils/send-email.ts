import mailgun from "./mailgun";
import { SendEmailPayload } from "./types";

export default function sendEmail(payload: SendEmailPayload) {
  try {
    let subject = "";
    let template = "";
    if (payload.type === "success") {
      subject = "Payment receipt";
      template = "payment_success";
    } else if (payload.type === "failure") {
      subject = "Payment failed";
      template = "payment_failed";
    }

    mailgun.messages().send({
      from: "Peeerpay <no-reply@peeerpay.app>",
      to: payload.email,
      subject,
      template,
      "v:amount": payload.amount,
      "v:service": payload.service,
      "v:customer": payload.service_customer_id,
      "v:tx_ref": payload.tx_ref,
    });
  } catch (error) {
    console.error(new Error(`Failed to send email: ${error.stack || error.message}`));
  }
}
