import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeServerOperations } from '@/lib/stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: any;

  try {
    event = StripeServerOperations.verifyWebhookSignature(body, signature, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  console.log('Received Stripe webhook:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const clerkUserId = session.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          console.log(`✅ Checkout completed for user ${clerkUserId}`);
          // In production, you would update your database here
          // For now, we'll just log it
        }
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          console.log(`✅ Subscription created for user ${clerkUserId}`);
          // Update user to PRO status in your database
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          console.log(`📝 Subscription updated for user ${clerkUserId}:`, subscription.status);
          // Update user subscription status
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        
        if (clerkUserId) {
          console.log(`❌ Subscription cancelled for user ${clerkUserId}`);
          // Revert user to FREE tier
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('✅ Payment succeeded for invoice:', invoice.id);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('❌ Payment failed for invoice:', invoice.id);
        // Handle failed payment - maybe send email notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}