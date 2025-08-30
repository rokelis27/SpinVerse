import { NextRequest, NextResponse } from 'next/server';
import { StripeServerOperations } from '@/lib/stripe';
import { headers } from 'next/headers';

// Webhook endpoint secret (should be set in environment)
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
  console.error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
}

// Account creation handler for successful payments
async function handleAccountCreation(customerId: string, subscriptionId: string, eventData: any) {
  try {
    // This would typically create an account in your database
    // For now, we'll log the event
    console.log('Account creation triggered:', {
      customerId,
      subscriptionId,
      event: eventData.type,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual account creation
    // const account = await createProAccount({
    //   stripeCustomerId: customerId,
    //   stripeSubscriptionId: subscriptionId,
    //   email: eventData.data.object.customer_email,
    //   status: 'active',
    // });

    return { success: true };
  } catch (error) {
    console.error('Account creation failed:', error);
    throw error;
  }
}

// Handle subscription status updates
async function handleSubscriptionUpdate(subscriptionId: string, eventData: any) {
  try {
    const subscription = eventData.data.object;
    
    console.log('Subscription update:', {
      subscriptionId,
      status: subscription.status,
      customerId: subscription.customer,
      event: eventData.type,
      timestamp: new Date().toISOString(),
    });

    // TODO: Update account status in database
    // await updateAccountSubscriptionStatus(subscriptionId, subscription.status);

    return { success: true };
  } catch (error) {
    console.error('Subscription update failed:', error);
    throw error;
  }
}

// Handle payment failures
async function handlePaymentFailed(customerId: string, subscriptionId: string, eventData: any) {
  try {
    const paymentIntent = eventData.data.object;
    
    console.error('Payment failed:', {
      customerId,
      subscriptionId,
      paymentIntentId: paymentIntent.id,
      lastPaymentError: paymentIntent.last_payment_error,
      timestamp: new Date().toISOString(),
    });

    // TODO: Handle payment failure (email notification, account suspension, etc.)
    // await handlePaymentFailure(customerId, paymentIntent.last_payment_error);

    return { success: true };
  } catch (error) {
    console.error('Payment failure handling failed:', error);
    throw error;
  }
}

// Main webhook event handler
async function handleWebhookEvent(event: any) {
  const { type, data } = event;
  
  try {
    switch (type) {
      // Successful payment and subscription creation
      case 'checkout.session.completed':
      case 'invoice.payment_succeeded': {
        const object = data.object;
        const customerId = object.customer;
        const subscriptionId = object.subscription;
        
        if (customerId && subscriptionId) {
          await handleAccountCreation(customerId, subscriptionId, event);
        }
        break;
      }

      // Subscription lifecycle events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = data.object;
        await handleSubscriptionUpdate(subscription.id, event);
        break;
      }

      // Payment failures
      case 'invoice.payment_failed':
      case 'payment_intent.payment_failed': {
        const object = data.object;
        const customerId = object.customer;
        const subscriptionId = object.subscription;
        
        if (customerId && subscriptionId) {
          await handlePaymentFailed(customerId, subscriptionId, event);
        }
        break;
      }

      // Customer events
      case 'customer.created':
      case 'customer.updated': {
        const customer = data.object;
        console.log('Customer event:', {
          customerId: customer.id,
          email: customer.email,
          event: type,
          timestamp: new Date().toISOString(),
        });
        break;
      }

      // Subscription trial events
      case 'customer.subscription.trial_will_end': {
        const subscription = data.object;
        console.log('Trial ending soon:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          trialEnd: new Date(subscription.trial_end * 1000).toISOString(),
        });
        // TODO: Send trial ending notification
        break;
      }

      // Dispute/chargeback events
      case 'charge.dispute.created': {
        const dispute = data.object;
        console.error('Dispute created:', {
          chargeId: dispute.charge,
          amount: dispute.amount,
          reason: dispute.reason,
          timestamp: new Date().toISOString(),
        });
        // TODO: Handle dispute
        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${type}`);
        break;
    }

    return { success: true, processed: true };
  } catch (error) {
    console.error(`Error handling webhook event ${type}:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Verify webhook secret is configured
    if (!WEBHOOK_SECRET) {
      console.error('Webhook secret not configured');
      return NextResponse.json(
        { error: 'WEBHOOK_NOT_CONFIGURED', message: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Get the raw body and signature
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event;
    try {
      event = StripeServerOperations.verifyWebhookSignature(body, signature, WEBHOOK_SECRET);
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'INVALID_SIGNATURE', message: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Log the received event (without sensitive data)
    console.log('Webhook received:', {
      eventId: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString(),
      livemode: event.livemode,
    });

    // Handle the event
    const result = await handleWebhookEvent(event);
    
    const responseTime = Date.now() - startTime;
    
    // Log successful processing
    console.log('Webhook processed successfully:', {
      eventId: event.id,
      type: event.type,
      responseTime,
      result,
    });

    return NextResponse.json(
      {
        success: true,
        eventId: event.id,
        eventType: event.type,
        processed: result.processed,
        responseTime,
      },
      { status: 200 }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Log error details
    console.error('Webhook processing failed:', {
      error: error.message,
      responseTime,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // Return error response
    return NextResponse.json(
      {
        error: 'WEBHOOK_ERROR',
        message: 'Failed to process webhook event',
        timestamp: new Date().toISOString(),
        responseTime,
      },
      { status: 500 }
    );
  }
}

// Health check for webhook endpoint
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      service: 'stripe-webhook',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      webhook_configured: !!WEBHOOK_SECRET,
    },
    { status: 200 }
  );
}

// Method not allowed for other HTTP methods
export async function PUT() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'PUT method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'DELETE method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'METHOD_NOT_ALLOWED', message: 'PATCH method not allowed' },
    { status: 405 }
  );
}