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
    metadata: {
      [key: string]: string | number;
    };
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
  description: string;
  local_price: {
    amount: string;
    currency: string;
  };
  redirect_url: string;
  cancel_url: string;
  metadata: {
    customer_id: string;
    biller_code: string;
    product_code: string;
    amount: string;
  };
}

export interface FlutterwaveVasPaymentResponse {
  data?: {
    date: string;
    amount: string;
    balance: string;
    transaction_reference: string;
    response_code: string;
    response_message: string;
    flw_reference: string;
    biller_code: string;
    product_code: string;
  };
  description: string;
  status: string;
}

export interface FlutterwaveVasPaymentPayload {
  billercode: string;
  productcode: string;
  amount: string;
  customerid: string;
  transactionreference: string;
}

export interface Transaction {
  description: string;
  fiat_currency: string;
  fiat_amount: string;
  crypto_currency: string;
  crypto_amount: string;
  hosted_url: string;
  code: string;
  payment_reference: string;
  user_id: string;
  status: string;
}

export interface Payment {
  date: string;
  amount: string;
  transaction_reference: string;
  flw_reference: string;
  biller_code: string;
  product_code: string;
}
