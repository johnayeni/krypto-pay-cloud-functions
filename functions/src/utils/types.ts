type country = "NG" | "GH" | "US" | "KE";

interface BushaPayPayment {
  created_at: string;
  network: string;
  transaction_id: string;
  transaction_hash: string;
  status: string;
  detected_at: string;
  traded: boolean;
  value: {
    [key: string]: {
      amount: string;
      value: string;
    };
  };
}

interface BushaPayTimeline {
  time: string;
  status: string;
  context: any;
}

interface BushaPayMetaData {
  email: string;
  service_customer_id: string;
  biller_code: string;
  item_code: string;
  service_name: string;
  amount: string;
  country: country;
}

export interface BushaPayChargeResponse {
  data: {
    addresses: {
      [key: string]: string;
    };
    description: string;
    pricing: {
      [key: string]: {
        currency: string;
        value: string;
      };
    };
    id: string;
    created_at: string;
    code: string;
    hosted_url: string;
    redirect_url: string;
    cancel_url: string;
    expires_at: string;
    confirmed_at?: string;
    timeline: BushaPayTimeline[];
    payments: BushaPayPayment[];
    metadata: BushaPayMetaData;
  };
}

interface BushaPayEvent extends BushaPayChargeResponse {
  resource: string;
  type:
    | "charge:completed"
    | "charge:created"
    | "charge:confirmed"
    | "charge:failed"
    | "charge:delayed"
    | "charge:pending"
    | "charge:resolved";
  api_version: string;
  created_at: string;
}

export interface BushaPayWebhookPayload {
  id: number | string;
  event: BushaPayEvent;
}

export interface BushaPayChargePayload {
  local_price: {
    amount: string;
    currency: string;
  };
  redirect_url?: string;
  cancel_url?: string;
  metadata: BushaPayMetaData;
}

export interface FlutterwavePaymentResponse {
  message: string;
  status: string;
  data?: {
    phone_number: string;
    amount: number | string;
    network: string;
    flw_ref: string;
    tx_ref: string;
  };
}

export interface FlutterwavePaymentPayload {
  country: country;
  customer: string;
  amount: number | string;
  recurrence: "ONCE";
  type: string;
  reference: string;
}

export interface Transaction {
  created: any;
  currency: string;
  amount: string;
  fees: string;
  hosted_url: string;
  code: string;
  payment_reference: string;
  email: string;
  status: string;
  service_customer_id?: string | number;
  service: string;
}

export interface Payment {
  created: any;
  amount: string | number;
  tx_ref: string;
  flw_ref: string;
  service_customer_id: string | number;
  service: string;
  email: string;
}

export interface SendEmailPayload {
  amount: string | number;
  tx_ref?: string;
  flw_ref: string;
  service_customer_id?: string | number;
  service: string;
  email: string;
  type: "success" | "failure";
}
