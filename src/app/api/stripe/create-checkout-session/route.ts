import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { StripeServerOperations, STRIPE_PRODUCTS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { priceId = STRIPE_PRODUCTS.PRO_MONTHLY.priceId } = body;

    // Create or retrieve Stripe customer
    let customer;
    try {
      customer = await StripeServerOperations.createCustomer({
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.fullName || user.firstName || '',
        metadata: {
          clerk_user_id: user.id,
          created_via: 'spinverse_upgrade',
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }

    // Create Stripe checkout session
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customer.id,
      success_url: `${request.nextUrl.origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/upgrade/cancelled`,
      metadata: {
        clerk_user_id: user.id,
        upgrade_source: 'spinverse_pro',
      },
      subscription_data: {
        metadata: {
          clerk_user_id: user.id,
          upgrade_date: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    );
  }
}