import { NextRequest, NextResponse } from 'next/server';
import { checkQPayPayment } from '@/lib/qpay';
import { adminDb } from '@/lib/firebase-admin';
import { sendOrderSuccessEmail } from '@/lib/email';
import { Order } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    // Get order from Firestore
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      console.warn('QPay callback: Order not found:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderDoc.data();
    const qpayInvoiceId = orderData?.qpayInvoiceId;

    if (!qpayInvoiceId) {
      console.warn('QPay callback: No QPay invoice ID for order:', orderId);
      return NextResponse.json({ error: 'No QPay invoice for this order' }, { status: 400 });
    }

    // Already paid, skip
    if (orderData?.paymentStatus === 'Paid') {
      return NextResponse.json({ success: true, message: 'Already paid' });
    }

    // Check payment status with QPay
    const paymentResult = await checkQPayPayment(qpayInvoiceId);
    const isPaid = paymentResult.count > 0 && paymentResult.rows.some(r => r.payment_status === 'PAID');

    if (isPaid) {
      // Update order
      await orderRef.update({
        paymentStatus: 'Paid',
        status: 'Processing',
        paymentMethod: 'qpay',
        paidAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ QPay callback: Order payment confirmed:', orderId);

      // Send confirmation email
      try {
        if (orderData?.customerEmail) {
          const order: Order = {
            id: orderId,
            ...orderData,
          } as Order;
          await sendOrderSuccessEmail(order);
          console.log('📧 Confirmation email sent for order:', orderId);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }
    }

    return NextResponse.json({ success: true, paid: isPaid });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('QPay callback error:', errorMessage);
    return NextResponse.json(
      { error: 'Callback processing failed', details: errorMessage },
      { status: 500 }
    );
  }
}
