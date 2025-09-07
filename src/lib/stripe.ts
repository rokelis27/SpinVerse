import { loadStripe, Stripe } from '@stripe/stripe-js';

// Production-safe Stripe configuration
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Validate environment variables (only in production or when explicitly setting up payments)
if (process.env.NODE_ENV === 'production' && !STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in production');
}

// Warn in development if Stripe keys are missing
if (process.env.NODE_ENV === 'development' && !STRIPE_PUBLISHABLE_KEY) {
  console.warn('⚠️  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY not set - payment features will be disabled');
}

// Singleton pattern for Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('Stripe publishable key not available');
    return Promise.resolve(null);
  }
  
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Product configuration
export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: {
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY || 'price_pro_monthly',
    name: 'SpinVerse PRO',
    description: '100 saved sequences, 50 daily AI stories, and premium features',
    amount: 399, // €3.99/mo in cents
    currency: 'eur',
    interval: 'month' as const,
    features: [
      '100 saved sequences (vs 3 free)',
      '50 steps per sequence (vs 10 free)',
      '100 wheel options (vs 20 free)',
      '50 daily stories (vs 3 free daily)',
      'Automated step enhancer feature',
      'Export to all formats',
    ],
  },
} as const;

// Customer creation data
export interface CreateCustomerData {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

// Subscription creation data
export interface CreateSubscriptionData {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

// Payment intent creation data
export interface CreatePaymentIntentData {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

// Stripe error types for better error handling
export type StripeErrorType = 
  | 'card_error'
  | 'validation_error'
  | 'api_error'
  | 'authentication_error'
  | 'rate_limit_error'
  | 'generic_error';

// Custom error class for Stripe operations
export class StripeOperationError extends Error {
  public readonly type: StripeErrorType;
  public readonly code?: string;
  public readonly declineCode?: string;
  public readonly userMessage: string;

  constructor(
    message: string,
    type: StripeErrorType,
    code?: string,
    declineCode?: string,
    userMessage?: string
  ) {
    super(message);
    this.name = 'StripeOperationError';
    this.type = type;
    this.code = code;
    this.declineCode = declineCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(type);
  }

  private getDefaultUserMessage(type: StripeErrorType): string {
    switch (type) {
      case 'card_error':
        return 'There was an issue with your card. Please try a different payment method.';
      case 'validation_error':
        return 'Please check your payment information and try again.';
      case 'api_error':
        return 'A temporary error occurred. Please try again in a moment.';
      case 'authentication_error':
        return 'Payment authentication failed. Please contact support.';
      case 'rate_limit_error':
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  }
}

// Safe API call wrapper with retry logic
async function safeStripeOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain error types
      if (
        error?.type === 'card_error' ||
        error?.type === 'validation_error' ||
        error?.type === 'authentication_error'
      ) {
        break;
      }

      // Only retry on the last attempt if it's a retryable error
      if (attempt < maxRetries && (
        error?.type === 'api_error' ||
        error?.type === 'rate_limit_error' ||
        error?.code === 'network_error'
      )) {
        console.warn(`${operationName} failed (attempt ${attempt}/${maxRetries}), retrying...`, error);
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        continue;
      }

      break;
    }
  }

  // Convert Stripe errors to our custom error type
  if (lastError) {
    throw new StripeOperationError(
      `${operationName} failed: ${lastError.message}`,
      (lastError as any).type || 'generic_error',
      (lastError as any).code,
      (lastError as any).decline_code
    );
  }

  throw new Error(`${operationName} failed after ${maxRetries} attempts`);
}

// Server-side Stripe operations (for API routes)
export class StripeServerOperations {
  private static stripe: any = null;

  private static getServerStripe() {
    if (!StripeServerOperations.stripe) {
      if (!STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
      }

      // Dynamic import for server-side only
      const Stripe = require('stripe');
      StripeServerOperations.stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
      });
    }
    return StripeServerOperations.stripe;
  }

  static async createCustomer(data: CreateCustomerData) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      
      return await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: {
          source: 'spinverse_upgrade',
          created_at: new Date().toISOString(),
          ...data.metadata,
        },
      });
    }, 'createCustomer');
  }

  static async createSubscription(data: CreateSubscriptionData) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      
      return await stripe.subscriptions.create({
        customer: data.customerId,
        items: [{ price: data.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          source: 'spinverse_pro_upgrade',
          created_at: new Date().toISOString(),
          ...data.metadata,
        },
      });
    }, 'createSubscription');
  }

  static async createPaymentIntent(data: CreatePaymentIntentData) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      
      return await stripe.paymentIntents.create({
        amount: data.amount,
        currency: data.currency,
        customer: data.customerId,
        setup_future_usage: 'off_session',
        metadata: {
          source: 'spinverse_payment',
          created_at: new Date().toISOString(),
          ...data.metadata,
        },
      });
    }, 'createPaymentIntent');
  }

  static async retrieveCustomer(customerId: string) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      return await stripe.customers.retrieve(customerId);
    }, 'retrieveCustomer');
  }

  static async retrieveSubscription(subscriptionId: string) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      return await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice', 'default_payment_method'],
      });
    }, 'retrieveSubscription');
  }

  static async cancelSubscription(subscriptionId: string, reason?: string) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      return await stripe.subscriptions.cancel(subscriptionId, {
        metadata: {
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || 'user_requested',
        },
      });
    }, 'cancelSubscription');
  }

  static async updateSubscription(subscriptionId: string, updates: any) {
    return safeStripeOperation(async () => {
      const stripe = StripeServerOperations.getServerStripe();
      return await stripe.subscriptions.update(subscriptionId, {
        ...updates,
        metadata: {
          updated_at: new Date().toISOString(),
          ...updates.metadata,
        },
      });
    }, 'updateSubscription');
  }

  // Webhook signature verification
  static verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string) {
    try {
      const stripe = StripeServerOperations.getServerStripe();
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (error: any) {
      throw new StripeOperationError(
        `Webhook verification failed: ${error.message}`,
        'authentication_error'
      );
    }
  }
}

// Client-side payment processing utilities
export class StripeClientOperations {
  static async confirmPayment(stripe: Stripe, elements: any, clientSecret: string) {
    return safeStripeOperation(async () => {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/upgrade/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        throw error;
      }

      return paymentIntent;
    }, 'confirmPayment');
  }

  static async confirmCardPayment(stripe: Stripe, clientSecret: string, cardElement: any) {
    return safeStripeOperation(async () => {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw error;
      }

      return paymentIntent;
    }, 'confirmCardPayment');
  }
}

// Utility functions for error handling
export function getStripeErrorMessage(error: any): string {
  if (error instanceof StripeOperationError) {
    return error.userMessage;
  }

  if (error?.type === 'card_error') {
    switch (error.code) {
      case 'card_declined':
        return 'Your card was declined. Please try a different payment method.';
      case 'expired_card':
        return 'Your card has expired. Please use a different card.';
      case 'incorrect_cvc':
        return 'Your card\'s security code is incorrect. Please check and try again.';
      case 'insufficient_funds':
        return 'Your card has insufficient funds. Please use a different card.';
      case 'processing_error':
        return 'An error occurred while processing your card. Please try again.';
      default:
        return 'There was an issue with your card. Please try a different payment method.';
    }
  }

  return error?.message || 'An unexpected error occurred. Please try again.';
}

// Format currency for display
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100); // Stripe uses cents
}

// Validate email for Stripe customer creation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
}

// Generate secure metadata for Stripe operations
export function generateStripeMetadata(additionalData: Record<string, any> = {}): Record<string, string> {
  return {
    timestamp: new Date().toISOString(),
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    origin: typeof window !== 'undefined' ? window.location.origin : 'server',
    version: '1.0',
    ...Object.entries(additionalData).reduce((acc, [key, value]) => {
      acc[key] = String(value);
      return acc;
    }, {} as Record<string, string>),
  };
}

export default {
  getStripe,
  StripeServerOperations,
  StripeClientOperations,
  getStripeErrorMessage,
  formatCurrency,
  isValidEmail,
  generateStripeMetadata,
  STRIPE_PRODUCTS,
};