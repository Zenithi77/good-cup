import { NextRequest, NextResponse } from 'next/server';
import { createBylCheckout } from '@/lib/byl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, orderId, customerEmail } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || '';

    // Map cart items to Byl checkout format
    const bylItems = items.map((item: { name: string; price: number; quantity: number; size: string; productId: string }) => ({
      price_data: {
        unit_amount: item.price,
        product_data: {
          name: `${item.name} (${item.size})`,
        },
      },
      quantity: item.quantity,
    }));

    const result = await createBylCheckout({
      items: bylItems,
      successUrl: `${origin}/orders?payment=success&orderId=${orderId}`,
      cancelUrl: `${origin}/orders?payment=cancelled&orderId=${orderId}`,
      customerEmail: customerEmail || undefined,
      clientReferenceId: orderId,
    });

    return NextResponse.json({
      checkoutId: result.data.id,
      checkoutUrl: result.data.url,
    });
  } catch (error) {
    console.error('Error creating Byl checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}
