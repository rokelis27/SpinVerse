import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { StripeServerOperations } from '@/lib/stripe';
import { clerkClient } from '@clerk/nextjs/server';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Send welcome email with account setup instructions
async function sendWelcomeEmail(email: string, customerName?: string, invitationUrl?: string) {
  console.log(`📧 Welcome email would be sent to ${email}${invitationUrl ? ' with invitation URL' : ''}`);
  
  // In production, integrate with your email service:
  // - SendGrid, Resend, or similar
  // - Send branded welcome message
  // - Include invitation link or login URL
  
  const welcomeMessage = {
    to: email,
    subject: 'Welcome to SpinVerse PRO! Complete Your Account Setup 🎉',
    body: invitationUrl ? `
      Hi ${customerName || 'there'}!
      
      🎉 Your SpinVerse PRO payment was successful!
      
      To complete your account setup and start using PRO features, click this secure link:
      ${invitationUrl}
      
      This will:
      ✅ Create your secure account
      ✅ Let you set your password
      ✅ Activate all PRO features instantly
      
      🚀 PRO Features Available:
      • Create sequences with up to 50 steps each
      • Save up to 100 sequences with cloud sync
      • Generate 50 AI stories daily
      • Use the Steps AI Enhancer feature
      
      Link expires in 7 days for security.
      
      Welcome to unlimited creativity!
      The SpinVerse Team
    ` : `
      Hi ${customerName || 'there'}!
      
      Welcome to SpinVerse PRO! Your payment was successful and your account is ready.
      
      🚀 You can now:
      • Create unlimited sequences (up to 50 steps each)
      • Save up to 100 sequences with cloud sync
      • Generate 50 AI stories daily
      • Use the Steps AI Enhancer feature
      
      📱 Access your account: ${process.env.NEXT_PUBLIC_APP_URL}
      
      Need help? Reply to this email or visit our support center.
      
      Happy creating!
      The SpinVerse Team
    `
  };
  
  return welcomeMessage;
}

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
        const isAnonymousUpgrade = session.metadata?.user_type === 'anonymous_upgrade';
        const needsAccountCreation = session.metadata?.needs_account_creation === 'true';
        
        console.log(`✅ Checkout completed:`, {
          sessionId: session.id,
          customerId: session.customer,
          isAnonymousUpgrade,
          needsAccountCreation,
          email: session.metadata?.customer_email
        });

        // Handle anonymous upgrade flow (payment-first registration)
        if (isAnonymousUpgrade && needsAccountCreation) {
          const email = session.metadata?.customer_email;
          const name = session.metadata?.customer_name;
          
          if (email) {
            try {
              console.log(`🏗️ Creating Clerk account for anonymous user: ${email}`);
              
              // Create Clerk invitation (secure approach)
              const clerk = await clerkClient();
              const invitation = await clerk.invitations.createInvitation({
                emailAddress: email,
                redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/complete-signup?session_id=${session.id}`,
                publicMetadata: {
                  subscription_tier: 'PRO',
                  stripe_customer_id: session.customer,
                  stripe_session_id: session.id,
                  created_via: 'anonymous_upgrade',
                  payment_first_flow: true,
                },
              });
              
              console.log(`✅ Clerk invitation created: ${invitation.id}`);
              
              // Send welcome email with invitation link
              await sendWelcomeEmail(email, name, invitation.url);
              
            } catch (error) {
              console.error('❌ Failed to create Clerk invitation:', error);
            }
          } else {
            console.log(`📝 Anonymous upgrade completed - no email for account creation`);
          }
        }
        // Handle existing Clerk user upgrade
        else if (clerkUserId) {
          console.log(`✅ Checkout completed for existing user ${clerkUserId}`);
          // Update existing user's subscription status in your database if needed
        }
        
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        const clerkUserId = subscription.metadata?.clerk_user_id;
        const isAnonymousUpgrade = subscription.metadata?.user_type === 'anonymous_upgrade';
        const customerEmail = subscription.metadata?.customer_email;
        
        console.log(`✅ Subscription created:`, {
          subscriptionId: subscription.id,
          clerkUserId,
          isAnonymousUpgrade,
          customerEmail,
          status: subscription.status
        });
        
        if (clerkUserId) {
          // For existing Clerk users, update their subscription status
          try {
            const clerk = await clerkClient();
            await clerk.users.updateUser(clerkUserId, {
              publicMetadata: {
                subscription_tier: 'PRO',
                subscription_status: subscription.status,
                stripe_customer_id: subscription.customer,
                stripe_subscription_id: subscription.id,
                upgraded_at: new Date().toISOString(),
              }
            });
            console.log(`📝 Updated Clerk user ${clerkUserId} to PRO status`);
          } catch (error) {
            console.error(`❌ Failed to update Clerk user ${clerkUserId}:`, error);
          }
        } else if (isAnonymousUpgrade && customerEmail) {
          // For the optimal hybrid flow, find the user by email and update
          // This handles the case where user just signed up through hybrid flow
          try {
            const clerk = await clerkClient();
            const users = await clerk.users.getUserList({
              emailAddress: [customerEmail]
            });
            
            if (users.data.length > 0) {
              const user = users.data[0];
              await clerk.users.updateUser(user.id, {
                publicMetadata: {
                  subscription_tier: 'PRO',
                  subscription_status: subscription.status,
                  stripe_customer_id: subscription.customer,
                  stripe_subscription_id: subscription.id,
                  upgraded_at: new Date().toISOString(),
                  created_via: 'payment_first_flow',
                }
              });
              console.log(`📝 Updated hybrid flow user ${user.id} (${customerEmail}) to PRO status`);
            } else {
              console.warn(`⚠️ Could not find user with email ${customerEmail} to update subscription status`);
            }
          } catch (error) {
            console.error(`❌ Failed to update hybrid flow user:`, error);
          }
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

      case 'customer.created': {
        const customer = event.data.object;
        console.log(`✅ Customer created: ${customer.id} (${customer.email})`);
        // Customer creation is handled automatically by Stripe during checkout
        // No additional action needed for our flow
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