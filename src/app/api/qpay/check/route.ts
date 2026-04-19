import { NextRequest, NextResponse } from 'next/server';
import { checkQPayPayment } from '@/lib/qpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'invoiceId is required' },
        { status: 400 }
      );
    }

    const result = await checkQPayPayment(invoiceId);

    const isPaid = result.count > 0 && result.rows.some(r => r.payment_status === 'PAID');

    return NextResponse.json({
      isPaid,
      paidAmount: result.paid_amount,
      count: result.count,
      rows: result.rows,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error checking QPay payment:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to check payment', details: errorMessage },
      { status: 500 }
    );
  }
}
