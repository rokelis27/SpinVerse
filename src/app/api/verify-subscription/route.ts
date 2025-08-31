import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { StripeServerOperations } from '@/lib/stripe';
import { headers } from 'next/headers';

// Rate limiting for security (production-ready)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 20; // Allow more requests for this endpoint
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  record.count++;
  return true;
}

interface VerificationRequest {
  clerkUserId: string;
}

interface SubscriptionData {
  tier: 'FREE' | 'PRO';
  status: 'active' | 'inactive' | 'cancelled';
  startDate?: string;
  endDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

/**
 * Production-ready subscription verification endpoint
 * 
 * This endpoint serves as a fallback when webhook sync fails or
 * when we need to verify subscription status directly with Stripe.
 * 
 * Flow:
 * 1. Get user from Clerk
 * 2. Check current metadata
 * 3. Verify with Stripe if needed
 * 4. Update Clerk metadata if out of sync
 * 5. Return normalized subscription data
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const headersList = await headers();
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown';

    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many verification requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    let body: VerificationRequest;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'INVALID_JSON',
          message: 'Invalid JSON in request body.',
        },
        { status: 400 }
      );
    }

    const { clerkUserId } = body;
    
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return NextResponse.json(
        {
          error: 'INVALID_USER_ID',
          message: 'Valid clerkUserId is required.',
        },
        { status: 400 }
      );
    }

    // Get user from Clerk
    const clerk = await clerkClient();
    let user;
    
    try {
      user = await clerk.users.getUser(clerkUserId);
    } catch (error: any) {
      if (error?.status === 404) {
        return NextResponse.json(
          {
            error: 'USER_NOT_FOUND',
            message: 'User not found in Clerk.',
          },
          { status: 404 }
        );
      }
      throw error; // Re-throw other errors
    }

    // Extract current metadata
    const metadata = user.publicMetadata as any || {};
    const currentTier = metadata.subscription_tier || 'FREE';
    const currentStatus = metadata.subscription_status || 'inactive';
    const stripeCustomerId = metadata.stripe_customer_id;
    const stripeSubscriptionId = metadata.stripe_subscription_id;

    console.log('🔍 Verifying subscription for user:', {
      userId: clerkUserId,
      email: user.emailAddresses[0]?.emailAddress,
      currentTier,
      currentStatus,
      hasStripeCustomerId: !!stripeCustomerId,
      hasStripeSubscriptionId: !!stripeSubscriptionId,
    });

    // If user claims to be PRO, verify with Stripe
    let verifiedSubscriptionData: SubscriptionData = {
      tier: currentTier as 'FREE' | 'PRO',
      status: currentTier === 'PRO' ? 'active' : 'inactive',
    };

    if (currentTier === 'PRO' && stripeSubscriptionId) {
      try {
        console.log('📞 Verifying PRO subscription with Stripe:', stripeSubscriptionId);
        
        const stripeSubscription = await StripeServerOperations.retrieveSubscription(stripeSubscriptionId);
        
        // Determine actual subscription status
        const isActive = stripeSubscription.status === 'active';
        const isPastDue = stripeSubscription.status === 'past_due';
        const isCancelled = stripeSubscription.status === 'canceled' || stripeSubscription.status === 'cancelled';
        
        // Build verified subscription data
        verifiedSubscriptionData = {
          tier: isActive || isPastDue ? 'PRO' : 'FREE',
          status: isActive ? 'active' : isCancelled ? 'cancelled' : 'inactive',
          startDate: stripeSubscription.current_period_start 
            ? new Date(stripeSubscription.current_period_start * 1000).toISOString()
            : undefined,
          endDate: stripeSubscription.current_period_end 
            ? new Date(stripeSubscription.current_period_end * 1000).toISOString()
            : undefined,
          stripeCustomerId: stripeSubscription.customer as string,
          stripeSubscriptionId: stripeSubscription.id,
        };

        // Check if metadata needs updating
        const needsUpdate = (
          currentTier !== verifiedSubscriptionData.tier ||
          currentStatus !== stripeSubscription.status ||
          !metadata.subscription_start_date ||
          !metadata.subscription_end_date
        );

        if (needsUpdate) {
          console.log('🔄 Updating Clerk metadata to match Stripe:', {
            oldTier: currentTier,
            newTier: verifiedSubscriptionData.tier,
            oldStatus: currentStatus,
            newStatus: stripeSubscription.status,
          });

          // Update Clerk metadata to match Stripe
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
              ...metadata,
              subscription_tier: verifiedSubscriptionData.tier,
              subscription_status: stripeSubscription.status,
              subscription_start_date: stripeSubscription.current_period_start,
              subscription_end_date: stripeSubscription.current_period_end,
              stripe_customer_id: stripeSubscription.customer,
              stripe_subscription_id: stripeSubscription.id,
              last_verified_at: Math.floor(Date.now() / 1000),
              updated_at: new Date().toISOString(),
            },
          });

          console.log('✅ Clerk metadata updated successfully');
        } else {
          console.log('✅ Clerk metadata is already up to date');
        }

      } catch (stripeError: any) {
        console.error('❌ Failed to verify subscription with Stripe:', {
          error: stripeError.message,
          subscriptionId: stripeSubscriptionId,
          userId: clerkUserId,
        });

        // If Stripe verification fails, assume FREE for safety
        verifiedSubscriptionData = {
          tier: 'FREE',
          status: 'inactive',
        };

        // Update Clerk metadata to reflect the failure
        try {
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
              ...metadata,
              subscription_tier: 'FREE',
              subscription_status: 'inactive',
              stripe_verification_failed_at: Math.floor(Date.now() / 1000),
              last_error: `Stripe verification failed: ${stripeError.message}`,
              updated_at: new Date().toISOString(),
            },
          });
        } catch (updateError) {
          console.error('❌ Failed to update Clerk metadata after Stripe error:', updateError);
        }
      }
    } else if (currentTier === 'PRO' && !stripeSubscriptionId && stripeCustomerId) {
      // User claims PRO but missing subscription ID - try to find it via customer ID
      console.warn('⚠️ User marked as PRO but missing Stripe subscription ID, searching by customer ID');
      
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length > 0) {
          const activeSubscription = subscriptions.data[0];
          console.log('🔧 Found active subscription, updating Clerk metadata:', activeSubscription.id);
          
          // Update Clerk with the found subscription
          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
              ...metadata,
              subscription_tier: 'PRO',
              subscription_status: activeSubscription.status,
              stripe_subscription_id: activeSubscription.id,
              subscription_start_date: activeSubscription.current_period_start,
              subscription_end_date: activeSubscription.current_period_end,
              repaired_at: Math.floor(Date.now() / 1000),
              updated_at: new Date().toISOString(),
            },
          });

          verifiedSubscriptionData = {
            tier: 'PRO',
            status: 'active',
            startDate: activeSubscription.current_period_start 
              ? new Date(activeSubscription.current_period_start * 1000).toISOString()
              : undefined,
            endDate: activeSubscription.current_period_end 
              ? new Date(activeSubscription.current_period_end * 1000).toISOString()
              : undefined,
            stripeCustomerId: stripeCustomerId,
            stripeSubscriptionId: activeSubscription.id,
          };

          console.log('✅ Repaired PRO user subscription data');
        } else {
          // No active subscription found - downgrade to FREE
          console.log('🔍 No active subscription found, downgrading to FREE');
          
          verifiedSubscriptionData = {
            tier: 'FREE',
            status: 'inactive',
          };

          await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
              ...metadata,
              subscription_tier: 'FREE',
              subscription_status: 'inactive',
              downgraded_reason: 'no_active_stripe_subscription',
              downgraded_at: Math.floor(Date.now() / 1000),
              updated_at: new Date().toISOString(),
            },
          });
        }
      } catch (stripeError: any) {
        console.error('❌ Failed to search for subscription by customer ID:', stripeError);
        // Keep as PRO for now, don't downgrade on error
        verifiedSubscriptionData = {
          tier: 'PRO',
          status: 'active',
        };
      }
    }

    const responseTime = Date.now() - startTime;

    // Log successful verification
    console.log('✅ Subscription verification completed:', {
      userId: clerkUserId,
      verifiedTier: verifiedSubscriptionData.tier,
      verifiedStatus: verifiedSubscriptionData.status,
      responseTimeMs: responseTime,
    });

    // Return verified subscription data
    return NextResponse.json(
      {
        success: true,
        subscription: verifiedSubscriptionData,
        metadata: {
          verified_at: new Date().toISOString(),
          response_time_ms: responseTime,
          source: 'stripe_verification',
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    console.error('❌ Subscription verification failed:', {
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      responseTimeMs: responseTime,
    });

    // Return generic error for production safety
    return NextResponse.json(
      {
        error: 'VERIFICATION_FAILED',
        message: 'Failed to verify subscription status. Please try again.',
        request_id: `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      service: 'subscription-verification',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
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