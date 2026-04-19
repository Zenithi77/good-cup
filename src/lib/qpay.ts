// QPay API helper (server-side only)

const QPAY_API_BASE = 'https://merchant.qpay.mn/v2';

let cachedToken: { access_token: string; expires_at: number } | null = null;

function getConfig() {
  const username = process.env.QPAY_USERNAME;
  const password = process.env.QPAY_PASSWORD;
  const invoiceCode = process.env.QPAY_INVOICE_CODE;

  if (!username || !password || !invoiceCode) {
    throw new Error('QPAY_USERNAME, QPAY_PASSWORD, and QPAY_INVOICE_CODE environment variables are required');
  }

  return { username, password, invoiceCode };
}

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expires_at - 60000) {
    return cachedToken.access_token;
  }

  const { username, password } = getConfig();
  const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');

  const response = await fetch(`${QPAY_API_BASE}/auth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('QPay auth error:', response.status, errorText);
    throw new Error(`QPay auth error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000),
  };

  return data.access_token;
}

export interface QPayInvoiceParams {
  orderId: string;
  amount: number;
  description: string;
  callbackUrl: string;
  customerPhone?: string;
  customerName?: string;
}

export interface QPayBankUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface QPayInvoiceResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  urls: QPayBankUrl[];
}

export async function createQPayInvoice(params: QPayInvoiceParams): Promise<QPayInvoiceResponse> {
  const token = await getAccessToken();
  const { invoiceCode } = getConfig();

  const body: Record<string, unknown> = {
    invoice_code: invoiceCode,
    sender_invoice_no: params.orderId,
    invoice_receiver_code: params.orderId,
    invoice_description: params.description,
    amount: params.amount,
    callback_url: params.callbackUrl,
  };

  if (params.customerPhone) {
    body.invoice_receiver_data = {
      name: params.customerName || '',
      phone: params.customerPhone,
    };
  }

  const response = await fetch(`${QPAY_API_BASE}/invoice`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('QPay invoice error:', response.status, errorText);
    throw new Error(`QPay invoice error ${response.status}: ${errorText}`);
  }

  return response.json();
}

export interface QPayPaymentCheckResponse {
  count: number;
  paid_amount: number;
  rows: Array<{
    payment_id: string;
    payment_status: 'NEW' | 'FAILED' | 'PAID' | 'REFUNDED';
    payment_date: string;
    payment_fee: string;
    payment_amount: string;
    payment_currency: string;
    payment_wallet: string;
    transaction_type: string;
  }>;
}

export async function checkQPayPayment(invoiceId: string): Promise<QPayPaymentCheckResponse> {
  const token = await getAccessToken();

  const response = await fetch(`${QPAY_API_BASE}/payment/check`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
      offset: {
        page_number: 1,
        page_limit: 100,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('QPay payment check error:', response.status, errorText);
    throw new Error(`QPay payment check error ${response.status}: ${errorText}`);
  }

  return response.json();
}
