// Byl.mn API helper (server-side only)

const BYL_API_BASE = 'https://byl.mn/api/v1';

function getConfig() {
  const token = process.env.BYL_API_TOKEN;
  const projectId = process.env.BYL_PROJECT_ID;
  
  if (!token || !projectId) {
    throw new Error('BYL_API_TOKEN and BYL_PROJECT_ID environment variables are required');
  }
  
  return { token, projectId };
}

interface BylCheckoutItem {
  price_data: {
    unit_amount: number;
    product_data: {
      name: string;
      client_reference_id?: string;
    };
  };
  quantity: number;
}

interface CreateCheckoutParams {
  items: BylCheckoutItem[];
  successUrl: string;
  cancelUrl?: string;
  customerEmail?: string;
  clientReferenceId?: string;
}

interface BylCheckoutResponse {
  data: {
    id: number;
    url: string;
  };
}

export async function createBylCheckout(params: CreateCheckoutParams): Promise<BylCheckoutResponse> {
  const { token, projectId } = getConfig();
  
  const body: Record<string, unknown> = {
    success_url: params.successUrl,
    items: params.items,
  };
  
  if (params.cancelUrl) {
    body.cancel_url = params.cancelUrl;
  }
  
  if (params.customerEmail) {
    body.customer_email = params.customerEmail;
  }
  
  if (params.clientReferenceId) {
    body.client_reference_id = params.clientReferenceId;
  }

  const response = await fetch(
    `${BYL_API_BASE}/projects/${projectId}/checkouts`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Byl API error:', response.status, errorText);
    throw new Error(`Byl API error: ${response.status}`);
  }

  return response.json();
}

export async function getBylCheckout(checkoutId: number) {
  const { token, projectId } = getConfig();

  const response = await fetch(
    `${BYL_API_BASE}/projects/${projectId}/checkouts/${checkoutId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Byl API error: ${response.status}`);
  }

  return response.json();
}

// Verify webhook signature
export function verifyBylSignature(payload: string, signature: string): boolean {
  const secret = process.env.BYL_WEBHOOK_SECRET;
  if (!secret) {
    console.error('BYL_WEBHOOK_SECRET not configured');
    return false;
  }

  const crypto = require('crypto');
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return computedSignature === signature;
}
