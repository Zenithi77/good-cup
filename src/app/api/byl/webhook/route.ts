import { NextRequest, NextResponse } from 'next/server';
import { verifyBylSignature } from '@/lib/byl';
import { adminDb } from '@/lib/firebase-admin';
import { sendOrderSuccessEmail } from '@/lib/email';
import { Order } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('Byl-Signature') || '';

    // Verify webhook signature
    if (!verifyBylSignature(rawBody, signature)) {
      console.warn('Invalid Byl webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(rawBody);
    
    console.log('📥 Byl webhook received:', event.type, 'ID:', event.id);

    if (event.type === 'checkout.completed') {
      const checkout = event.data?.object;
      if (!checkout) {
        return NextResponse.json({ error: 'Missing checkout data' }, { status: 400 });
      }

      const orderId = checkout.client_reference_id;
      
      if (!orderId) {
        console.warn('No client_reference_id in checkout.completed event');
        return NextResponse.json({ received: true });
      }

      // Update order in Firestore
      const orderRef = adminDb.collection('orders').doc(orderId);
      const orderDoc = await orderRef.get();
      
      if (!orderDoc.exists) {
        console.warn('Order not found:', orderId);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      await orderRef.update({
        paymentStatus: 'Paid',
        status: 'Processing',
        paymentMethod: checkout.payment_method || 'byl',
        paidAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Order payment confirmed:', orderId);

      // Send confirmation email
      try {
        const orderData = orderDoc.data();
        if (orderData?.customerEmail) {
          const order: Order = {
            id: orderId,
            ...orderData,
            createdAt: orderData.createdAt?.toDate(),
            updatedAt: new Date(),
            paidAt: new Date(),
            paymentStatus: 'Paid',
            status: 'Processing',
          } as Order;
          
          await sendOrderSuccessEmail(order);
          console.log('📧 Confirmation email sent for order:', orderId);
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing Byl webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
