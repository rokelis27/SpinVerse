import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

// Rate limiting for security
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 5; // Allow reasonable reactivation attempts
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

interface ReactivateRequest {
  clerkUserId: string;
}

/**
 * Reactivate Stripe Subscription
 * 
 * This endpoint reactivates a cancelled subscription by removing the cancel_at_period_end flag.
 * The subscription will continue billing on the next period instead of ending.
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
          message: 'Too many reactivation requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    let body: ReactivateRequest;
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
            message: 'User not found.',
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get Stripe subscription ID from user metadata
    const metadata = user.publicMetadata as any;
    const stripeSubscriptionId = metadata?.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      return NextResponse.json(
        {
          error: 'NO_SUBSCRIPTION',
          message: 'No subscription found for this user.',
        },
        { status: 400 }
      );
    }



    // Reactivate subscription by removing cancel_at_period_end
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    // Update Clerk metadata to reflect reactivation
    await clerk.users.updateUser(clerkUserId, {
      publicMetadata: {
        ...metadata,
        subscription_status: subscription.status,
        cancel_at_period_end: false,
        reactivated_at: Math.floor(Date.now() / 1000),
        updated_at: new Date().toISOString(),
      },
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: 'Subscription reactivated successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
        metadata: {
          reactivated_at: new Date().toISOString(),
          next_billing: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
          response_time_ms: responseTime,
        },
      },
      { status: 200 }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;

    // Handle specific Stripe errors
    if (error.type?.startsWith('Stripe')) {
      return NextResponse.json(
        {
          error: 'STRIPE_ERROR',
          message: 'Unable to reactivate subscription. Please try again.',
          code: error.code,
        },
        { status: 402 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'REACTIVATION_FAILED',
        message: 'Failed to reactivate subscription. Please try again.',
        request_id: `reactivate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      service: 'stripe-subscription-reactivation',
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