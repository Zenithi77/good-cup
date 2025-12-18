import { NextRequest, NextResponse } from 'next/server';
import { sendOrderSuccessEmail } from '@/lib/email';
import { Order } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order } = body as { order: Order };

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order data is required' },
        { status: 400 }
      );
    }

    if (!order.customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    const emailSent = await sendOrderSuccessEmail(order);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Order confirmation email sent successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in send-order-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
