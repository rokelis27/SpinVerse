import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { StripeServerOperations } from '@/lib/stripe';
import { headers } from 'next/headers';

// Rate limiting for security
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 5; // Conservative limit for portal sessions
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

interface PortalRequest {
  clerkUserId: string;
  returnUrl: string;
}

/**
 * Create Stripe Customer Portal Session
 * 
 * This endpoint creates a secure session for PRO users to manage their subscription
 * through Stripe's customer portal interface.
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
          message: 'Too many portal requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request
    let body: PortalRequest;
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

    const { clerkUserId, returnUrl } = body;
    
    // Validate required fields
    if (!clerkUserId || typeof clerkUserId !== 'string') {
      return NextResponse.json(
        {
          error: 'INVALID_USER_ID',
          message: 'Valid clerkUserId is required.',
        },
        { status: 400 }
      );
    }

    if (!returnUrl || typeof returnUrl !== 'string') {
      return NextResponse.json(
        {
          error: 'INVALID_RETURN_URL',
          message: 'Valid returnUrl is required.',
        },
        { status: 400 }
      );
    }

    // Validate return URL for security
    try {
      const url = new URL(returnUrl);
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001', 
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ].filter(Boolean);

      const isAllowed = allowedOrigins.some(origin => 
        origin && url.origin === origin
      );

      if (!isAllowed) {
        return NextResponse.json(
          {
            error: 'INVALID_RETURN_URL',
            message: 'Return URL not allowed.',
          },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          error: 'INVALID_RETURN_URL',
          message: 'Invalid return URL format.',
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

    // Get Stripe customer ID from user metadata
    const metadata = user.publicMetadata as any;
    const stripeCustomerId = metadata?.stripe_customer_id;

    if (!stripeCustomerId) {
      return NextResponse.json(
        {
          error: 'NO_STRIPE_CUSTOMER',
          message: 'No Stripe customer found for this user. Please contact support.',
        },
        { status: 400 }
      );
    }

    // Create Stripe customer portal session
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        url: portalSession.url,
        metadata: {
          created_at: new Date().toISOString(),
          response_time_ms: responseTime,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
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
          message: 'Unable to create portal session. Please try again.',
          code: error.code,
        },
        { status: 402 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'PORTAL_CREATION_FAILED',
        message: 'Failed to create customer portal session. Please try again.',
        request_id: `portal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      service: 'stripe-customer-portal',
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