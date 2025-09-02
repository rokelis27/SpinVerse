import { NextRequest, NextResponse } from 'next/server';
import { StripeServerOperations, StripeOperationError, STRIPE_PRODUCTS, isValidEmail } from '@/lib/stripe';
import { headers } from 'next/headers';

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10;
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

// Request validation schema
interface CreateSubscriptionRequest {
  email: string;
  name?: string;
  priceId: string; // Required after validation
  anonymousData?: any; // Data to migrate from anonymous usage
  metadata?: Record<string, string>;
}

function validateRequest(body: any): CreateSubscriptionRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const { email, name, priceId = STRIPE_PRODUCTS.PRO_MONTHLY.priceId, anonymousData, metadata } = body;

  // Validate required fields
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return null;
  }

  // Ensure priceId is valid
  if (!priceId || typeof priceId !== 'string') {
    console.error('Invalid priceId:', priceId);
    return null;
  }

  // Validate optional fields
  if (name && (typeof name !== 'string' || name.length > 100)) {
    return null;
  }

  if (priceId && typeof priceId !== 'string') {
    return null;
  }

  if (metadata && typeof metadata !== 'object') {
    return null;
  }

  return { email, name, priceId, anonymousData, metadata };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    'unknown';

    // Rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
          retryAfter: 60,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: 'INVALID_JSON',
          message: 'Invalid JSON in request body.',
        },
        { status: 400 }
      );
    }

    const validatedData = validateRequest(requestBody);
    if (!validatedData) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data. Please check your input and try again.',
        },
        { status: 400 }
      );
    }

    const { email, name, priceId, anonymousData, metadata } = validatedData;

    // Step 1: Create Stripe customer
    console.log(`Creating Stripe customer for email: ${email}`);
    const customer = await StripeServerOperations.createCustomer({
      email,
      name,
      metadata: {
        source: 'spinverse_pro_upgrade',
        has_anonymous_data: anonymousData ? 'true' : 'false',
        signup_timestamp: new Date().toISOString(),
        client_ip: clientIP,
        ...metadata,
      },
    });

    // Step 2: Create subscription
    console.log(`Creating subscription for customer: ${customer.id}`);
    const subscription = await StripeServerOperations.createSubscription({
      customerId: customer.id,
      priceId,
      metadata: {
        anonymous_sequences_count: anonymousData?.sequences?.length?.toString() || '0',
        anonymous_total_spins: anonymousData?.usage?.totalSpins?.toString() || '0',
        upgrade_source: 'direct_payment',
        ...metadata,
      },
    });

    // Step 3: Handle the payment intent
    const paymentIntent = subscription.latest_invoice?.payment_intent;
    if (!paymentIntent) {
      throw new Error('Payment intent not found in subscription');
    }

    const responseTime = Date.now() - startTime;
    
    // Log successful operation
    console.log(`Subscription created successfully:`, {
      customerId: customer.id,
      subscriptionId: subscription.id,
      responseTime,
      email: email.replace(/(.{2})(.*)(.{2})/, '$1***$3'), // Mask email for logs
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
        subscription: {
          id: subscription.id,
          status: subscription.status,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
        },
        payment: {
          client_secret: typeof paymentIntent === 'string' 
            ? paymentIntent 
            : paymentIntent.client_secret,
          status: typeof paymentIntent === 'string' 
            ? 'requires_payment_method' 
            : paymentIntent.status,
        },
        metadata: {
          created_at: new Date().toISOString(),
          response_time_ms: responseTime,
        },
      },
      { status: 201 }
    );

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Log error details
    console.error('Subscription creation failed:', {
      error: error.message,
      type: error.type,
      code: error.code,
      responseTime,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    // Handle specific error types
    if (error instanceof StripeOperationError) {
      return NextResponse.json(
        {
          error: error.type.toUpperCase(),
          message: error.userMessage,
          code: error.code,
          decline_code: error.declineCode,
        },
        { status: 400 }
      );
    }

    // Handle Stripe API errors
    if (error.type && error.type.startsWith('Stripe')) {
      return NextResponse.json(
        {
          error: 'STRIPE_ERROR',
          message: 'Payment processing error. Please try again.',
          code: error.code,
        },
        { status: 402 }
      );
    }

    // Handle customer already exists
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        {
          error: 'CUSTOMER_EXISTS',
          message: 'An account with this email already exists. Please contact support.',
        },
        { status: 409 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again or contact support.',
        request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      service: 'stripe-subscription-creation',
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