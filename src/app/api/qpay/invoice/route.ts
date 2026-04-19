import { NextRequest, NextResponse } from 'next/server';
import { createQPayInvoice } from '@/lib/qpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, customerName, customerPhone, customerEmail } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'orderId and amount are required' },
        { status: 400 }
      );
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL
      || request.headers.get('origin')
      || `https://${request.headers.get('host')}`;

    const result = await createQPayInvoice({
      orderId,
      amount,
      description: `Good Cup захиалга #${orderId.slice(-6)}`,
      callbackUrl: `${origin}/api/qpay/callback?orderId=${encodeURIComponent(orderId)}`,
      customerPhone,
      customerName,
    });

    return NextResponse.json({
      invoiceId: result.invoice_id,
      qrImage: result.qr_image,
      qrText: result.qr_text,
      urls: result.urls,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error creating QPay invoice:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create QPay invoice', details: errorMessage },
      { status: 500 }
    );
  }
}
