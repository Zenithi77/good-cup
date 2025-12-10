import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const VALID_POSTKEY = process.env.PAYMENT_WEBHOOK_KEY || '789456123';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 ============ WEBHOOK RECEIVED ============');
    console.log('📥 Full request body:', JSON.stringify(body, null, 2));
    
    const { from, sender, text, message, POSTKEY } = body;
    
    // Verify POSTKEY for security
    if (String(POSTKEY) !== VALID_POSTKEY) {
      console.log('⚠️ Invalid POSTKEY:', POSTKEY);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid POSTKEY' },
        { status: 401 }
      );
    }
    console.log('✅ POSTKEY verified');
    
    // Support both 'from'/'sender' and 'text'/'message' field names
    const senderName = from || sender || '';
    const smsText = text || message || '';
    
    console.log('📥 Parsed - Sender:', senderName);
    console.log('📥 Parsed - Text:', smsText);
    
    // Verify sender is from Khaan Bank
    const validSenders = ['khaan bank', 'khaanbank', 'khan bank', 'хаан банк', '95197775', '+97695197775'];
    const isValidSender = validSenders.some(valid => 
      senderName.toLowerCase().includes(valid.toLowerCase())
    );
    
    if (!isValidSender) {
      console.log('⚠️ Invalid sender:', senderName);
      return NextResponse.json(
        { error: 'Invalid sender', received: senderName, expected: 'Khaan Bank' },
        { status: 400 }
      );
    }
    
    console.log('✅ Valid sender: Khaan Bank');
    
    // Parse SMS text for payment info
    const amountMatch = smsText?.match(/ORLOGO:\s*([\d,\.]+)\s*MNT/i) || 
                       smsText?.match(/([\d,\.]+)\s*MNT/i) ||
                       smsText?.match(/([\d,]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null;
    
    console.log('💰 Parsed amount:', amount);
    
    // Extract transaction reference
    const refMatch = smsText?.match(/Guilgeenii utga:\s*(.+?)(?:\s*$|\.|\,)/i);
    const transactionText = refMatch ? refMatch[1].trim() : smsText || '';
    
    console.log('💰 Transaction text:', transactionText);
    
    // Find pending orders
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('paymentStatus', 'in', ['pending', 'Pending']));
    const snapshot = await getDocs(q);
    
    let matchedOrder = null;
    let matchedOrderId = '';
    
    for (const orderDoc of snapshot.docs) {
      const order = orderDoc.data();
      if (order.paymentRef && transactionText.includes(order.paymentRef)) {
        matchedOrder = order;
        matchedOrderId = orderDoc.id;
        console.log('✅ Found matching order by paymentRef:', order.paymentRef);
        break;
      }
    }
    
    if (!matchedOrder) {
      console.log('⚠️ No order found containing ref in text:', transactionText);
      return NextResponse.json(
        { error: 'Order not found', searchedText: transactionText },
        { status: 404 }
      );
    }
    
    // Verify amount
    if (!amount) {
      console.log('⚠️ Could not parse amount from SMS');
      return NextResponse.json(
        { error: 'Amount not found in SMS', smsText },
        { status: 400 }
      );
    }
    
    if (amount !== matchedOrder.total) {
      console.log('⚠️ Amount mismatch:', { received: amount, expected: matchedOrder.total });
      return NextResponse.json(
        { 
          error: 'Amount mismatch', 
          received: amount, 
          expected: matchedOrder.total,
          message: 'Төлбөрийн дүн таарахгүй байна' 
        },
        { status: 400 }
      );
    }
    
    console.log('✅ Amount verified:', amount);
    
    // Update order payment status
    await updateDoc(doc(db, 'orders', matchedOrderId), {
      paymentStatus: 'Paid',
      paidAt: new Date(),
      status: 'Processing',
      updatedAt: new Date(),
    });
    
    console.log('✅ Payment confirmed for order:', matchedOrderId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment confirmed',
      orderId: matchedOrderId,
      paymentRef: matchedOrder.paymentRef
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
