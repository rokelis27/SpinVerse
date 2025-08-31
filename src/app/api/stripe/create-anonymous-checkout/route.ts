import { NextRequest, NextResponse } from 'next/server';
import { StripeServerOperations, STRIPE_PRODUCTS } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      name, 
      priceId = STRIPE_PRODUCTS.PRO_MONTHLY.priceId,
      metadata = {} 
    } = body;

    // Validate required fields
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email address is required' }, 
        { status: 400 }
      );
    }

    // Check if customer already exists with this email
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    let customer;
    
    try {
      // Search for existing customers with this email
      const existingCustomers = await stripe.customers.list({
        email: email.trim().toLowerCase(),
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        // Customer with this email already exists - they should log in instead
        console.warn(`⚠️ User ${email} already exists in Stripe, blocking anonymous upgrade`);
        return NextResponse.json(
          { 
            error: 'EXISTING_EMAIL',
            message: 'An account with this email address already exists.',
            details: 'If you need help accessing your account, please contact support.'
          }, 
          { status: 409 }
        );
      } else {
        // Create new customer
        customer = await StripeServerOperations.createCustomer({
          email: email.trim().toLowerCase(),
          name: name?.trim() || undefined,
          metadata: {
            user_type: 'anonymous_upgrade',
            upgrade_source: 'anonymous_to_pro',
            registration_flow: 'payment_first',
            ...metadata,
          },
        });
        console.log(`✨ Created new Stripe customer for ${email}:`, customer.id);
      }
    } catch (error) {
      console.error('Failed to create/retrieve customer for anonymous user:', error);
      return NextResponse.json(
        { error: 'Failed to create customer account' }, 
        { status: 500 }
      );
    }

    // Create Stripe checkout session for anonymous user
    
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
      success_url: `${request.nextUrl.origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}&flow=anonymous`,
      cancel_url: `${request.nextUrl.origin}/upgrade/cancelled?flow=anonymous`,
      metadata: {
        user_type: 'anonymous_upgrade',
        customer_email: email.trim().toLowerCase(),
        customer_name: name?.trim() || '',
        upgrade_source: 'anonymous_pro_upgrade',
        needs_account_creation: 'true',
        payment_first_flow: 'true',
        ...metadata,
      },
      subscription_data: {
        metadata: {
          user_type: 'anonymous_upgrade',
          customer_email: email.trim().toLowerCase(),
          upgrade_date: new Date().toISOString(),
          payment_first_flow: 'true',
          needs_clerk_account: 'true',
          ...metadata,
        },
      },
      // Set up automatic tax calculation with address collection
      automatic_tax: { enabled: true },
      customer_update: {
        address: 'auto', // Automatically save address from checkout to customer
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Set payment collection method for subscriptions
      payment_method_collection: 'if_required',
    });

    console.log(`✅ Anonymous checkout session created for ${email}:`, session.id);

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      customerId: customer.id,
      message: 'Checkout session created for anonymous user'
    });

  } catch (error: any) {
    console.error('Anonymous checkout session creation failed:', error);
    
    // Return user-friendly error messages
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { 
          error: 'Invalid payment configuration', 
          details: 'Please check your payment information and try again.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create checkout session', 
        details: error.message || 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}