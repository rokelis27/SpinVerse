'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAnonymousStore } from '@/stores/anonymousStore';
import { useAccountStore } from '@/stores/hybridStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { 
  getStripe, 
  STRIPE_PRODUCTS, 
  formatCurrency, 
  getStripeErrorMessage,
  isValidEmail 
} from '@/lib/stripe';
import { migrateAnonymousToAccount, MigrationResult } from '@/lib/dataMigration';
import { useTermsModal } from '@/components/providers/TermsModalProvider';

interface UpgradeFlowProps {
  isOpen: boolean;
  onClose: () => void;
  triggerFeature?: 'sequences' | 'steps' | 'options' | 'ai' | 'storage';
  className?: string;
}

type FlowStep = 'benefits' | 'email' | 'payment' | 'processing' | 'success' | 'error';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  clientSecret: string | null;
  customerId: string | null;
  subscriptionId: string | null;
}

interface MigrationState {
  isInProgress: boolean;
  result: MigrationResult | null;
  error: string | null;
}

export function UpgradeFlow({ isOpen, onClose, triggerFeature, className = '' }: UpgradeFlowProps) {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { openTerms } = useTermsModal();
  const [currentStep, setCurrentStep] = useState<FlowStep>('benefits');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  
  // Determine if user is logged in
  const isLoggedIn = clerkLoaded && !!user;
  
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    clientSecret: null,
    customerId: null,
    subscriptionId: null,
  });

  const [migrationState, setMigrationState] = useState<MigrationState>({
    isInProgress: false,
    result: null,
    error: null,
  });

  const anonymousStore = useAnonymousStore();
  const accountStore = useAccountStore();
  const { getAnalyticsData } = useFeatureGate();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('benefits');
      
      // Pre-fill user data if logged in
      if (isLoggedIn && user) {
        setEmail(user.emailAddresses[0]?.emailAddress || '');
        setName(user.fullName || user.firstName || '');
      } else {
        setEmail('');
        setName('');
      }
      
      setEmailError('');
      setPaymentState({
        isProcessing: false,
        error: null,
        clientSecret: null,
        customerId: null,
        subscriptionId: null,
      });
      setMigrationState({
        isInProgress: false,
        result: null,
        error: null,
      });
    }
  }, [isOpen, isLoggedIn, user]);

  // Email validation
  const validateEmail = useCallback((emailValue: string): string => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    if (!isValidEmail(emailValue)) {
      return 'Please enter a valid email address';
    }
    if (emailValue.length > 254) {
      return 'Email address is too long';
    }
    return '';
  }, []);

  // Handle authenticated user checkout (skip email step)
  const handleAuthenticatedCheckout = useCallback(async () => {
    if (!isLoggedIn || !user) {
      console.error('User not logged in');
      return;
    }

    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      console.log('Creating authenticated checkout session for user:', user.id);

      // Use authenticated checkout API
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: STRIPE_PRODUCTS.PRO_MONTHLY.priceId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create checkout session');
      }

      console.log('Authenticated checkout session created:', result.sessionId);

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }

    } catch (error: any) {
      console.error('Authenticated checkout creation failed:', error);
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Failed to create checkout session. Please try again.',
      }));
    }
  }, [isLoggedIn, user]);

  // Handle email step (for anonymous users)
  const handleEmailSubmit = useCallback(async () => {
    // Validate email
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      setEmailError(emailValidationError);
      return;
    }

    // Validate terms & conditions
    if (!agreedToTerms) {
      setTermsError('You must agree to the Terms & Conditions to continue');
      return;
    }

    setEmailError('');
    setTermsError('');
    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      // Get anonymous data for migration metadata
      const anonymousData = anonymousStore.migrateToAccount();
      const analyticsData = getAnalyticsData();

      console.log('Creating anonymous checkout session for email:', email);

      // Use anonymous checkout API for non-authenticated users
      const response = await fetch('/api/stripe/create-anonymous-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name?.trim() || undefined,
          priceId: STRIPE_PRODUCTS.PRO_MONTHLY.priceId,
          metadata: {
            trigger_feature: triggerFeature || 'direct',
            anonymous_sequences: anonymousData.sequences.length.toString(),
            total_spins: anonymousData.usage.totalSpins.toString(),
            sequences_created: anonymousData.usage.sequencesCreated.toString(),
            engagement_score: analyticsData.engagementScore.toString(),
            upgrade_source: 'anonymous_upgrade_flow',
            device_id: anonymousData.metadata.deviceId,
            first_visit: anonymousData.metadata.firstVisit,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error for existing email
        if (result.error === 'EXISTING_EMAIL' || result.error === 'EXISTING_SUBSCRIPTION') {
          setPaymentState(prev => ({
            ...prev,
            isProcessing: false,
            error: `${result.message} Please log in to manage your existing subscription.`,
          }));
          return;
        }
        throw new Error(result.error || result.details || 'Failed to create checkout session');
      }

      console.log('Anonymous checkout session created:', result.sessionId);

      // Store checkout info for post-payment processing
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spinverse_checkout_info', JSON.stringify({
          sessionId: result.sessionId,
          customerId: result.customerId,
          email: email.trim().toLowerCase(),
          name: name?.trim(),
          anonymousDataBackup: JSON.stringify(anonymousData),
          timestamp: new Date().toISOString(),
        }));
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('No checkout URL received from Stripe');
      }

    } catch (error: any) {
      console.error('Anonymous checkout creation failed:', error);
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Failed to create checkout session. Please try again.',
      }));
    }
  }, [email, name, agreedToTerms, triggerFeature, anonymousStore, getAnalyticsData, validateEmail]);

  // Handle payment processing
  const handlePaymentSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!paymentState.clientSecret) {
      console.error('No client secret available');
      return;
    }

    setPaymentState(prev => ({ ...prev, isProcessing: true, error: null }));
    setCurrentStep('processing');

    try {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Get form elements
      const form = event.target as HTMLFormElement;
      const cardElement = form.querySelector('#card-element');
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Processing payment...');

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentState.clientSecret, {
        payment_method: {
          card: cardElement as any,
          billing_details: {
            name: name.trim() || undefined,
            email: email.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      console.log('Payment successful:', paymentIntent?.id);

      // Start data migration
      setMigrationState(prev => ({ ...prev, isInProgress: true }));

      const anonymousData = anonymousStore.migrateToAccount();
      const migrationResult = await migrateAnonymousToAccount(anonymousData);

      setMigrationState(prev => ({
        ...prev,
        isInProgress: false,
        result: migrationResult,
        error: migrationResult.success ? null : migrationResult.errors.join(', '),
      }));

      if (migrationResult.success) {
        // Set up account store
        accountStore.setAccount({
          id: paymentState.customerId!,
          stripeCustomerId: paymentState.customerId!,
          email: email.trim(),
          name: name.trim() || undefined,
          subscription: {
            status: 'active',
            currentPeriodStart: new Date().toISOString(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancelAtPeriodEnd: false,
          },
          preferences: {
            theme: anonymousData.settings.theme,
            soundEnabled: anonymousData.settings.soundEnabled,
            animationsEnabled: anonymousData.settings.animationsEnabled,
            notifications: anonymousData.settings.notifications,
            emailNotifications: true,
          },
          usage: {
            totalSpins: anonymousData.usage.totalSpins,
            sequencesCreated: anonymousData.usage.sequencesCreated,
            sequencesPlayed: anonymousData.usage.sequencesPlayed,
            aiStoriesGenerated: anonymousData.usage.dailyAiGenerations,
            lastActiveDate: new Date().toISOString(),
          },
          metadata: {
            createdAt: new Date().toISOString(),
            lastSyncAt: new Date().toISOString(),
            migrationId: migrationResult.migrationId,
          },
        });

        setCurrentStep('success');
      } else {
        setCurrentStep('error');
      }

    } catch (error: any) {
      console.error('Payment failed:', error);
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: getStripeErrorMessage(error),
      }));
      setCurrentStep('error');
    }
  }, [paymentState.clientSecret, email, name, anonymousStore, accountStore]);

  // Handle closing modal
  const handleClose = useCallback(() => {
    if (currentStep === 'processing') {
      // Don't allow closing during processing
      return;
    }
    onClose();
  }, [currentStep, onClose]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setCurrentStep('email');
    setPaymentState(prev => ({ ...prev, error: null }));
    setMigrationState(prev => ({ ...prev, error: null }));
  }, []);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm ${className}`}>
      <div className="w-full max-w-sm sm:max-w-md max-h-[90vh] bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-800">
          <h2 className="text-lg sm:text-xl font-bold text-white">Upgrade to PRO</h2>
          {currentStep !== 'processing' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Benefits Step */}
          {currentStep === 'benefits' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isLoggedIn ? 'Upgrade to PRO' : 'Unlock Unlimited Creativity'}
                </h3>
                <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">
                  {isLoggedIn ? (
                    <>
                      Hi {user?.firstName || user?.fullName || 'there'}! Upgrade your account to PRO and get access to all premium features with cloud sync across devices.
                    </>
                  ) : (
                    'Get access to all premium features with cloud sync across devices. Your account will be created after successful payment.'
                  )}
                </p>
              </div>

              <div className="space-y-4">
                {STRIPE_PRODUCTS.PRO_MONTHLY.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatCurrency(STRIPE_PRODUCTS.PRO_MONTHLY.amount)}
                  <span className="text-lg font-normal text-gray-400">/month</span>
                </div>
                <p className="text-sm text-gray-500">Cancel anytime</p>
              </div>

              {paymentState.error && (
                <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{paymentState.error}</p>
                </div>
              )}

              <button
                onClick={isLoggedIn ? handleAuthenticatedCheckout : () => setCurrentStep('email')}
                disabled={paymentState.isProcessing}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentState.isProcessing ? 'Processing...' : (isLoggedIn ? 'Upgrade Now' : 'Get Started')}
              </button>
            </div>
          )}

          {/* Email Step */}
          {currentStep === 'email' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Create Your Account</h3>
                <p className="text-gray-400">Enter your details to complete payment. Your PRO account will be created after successful checkout.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError('');
                    }}
                    className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                      emailError 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-700 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {emailError && (
                    <p className="text-red-400 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Enter your name"
                    maxLength={100}
                  />
                </div>

                {/* Terms & Conditions Checkbox */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center h-5 mt-1">
                      <input
                        id="terms-checkbox"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => {
                          setAgreedToTerms(e.target.checked);
                          if (termsError) setTermsError('');
                        }}
                        className={`w-4 h-4 rounded border-2 bg-gray-800 focus:ring-2 focus:ring-offset-0 transition-colors ${
                          termsError 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-600 focus:ring-purple-500 text-purple-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="terms-checkbox" className="text-sm text-gray-300 leading-relaxed">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={openTerms}
                          className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                        >
                          Terms & Conditions
                        </button>{' '}
                      </label>
                      {termsError && (
                        <p className="text-red-400 text-xs mt-1">{termsError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {paymentState.error && (
                <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm">{paymentState.error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep('benefits')}
                  className="flex-1 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleEmailSubmit}
                  disabled={paymentState.isProcessing}
                  className="flex-2 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentState.isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Payment Details</h3>
                <p className="text-gray-400">Complete your upgrade to SpinVerse PRO.</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300">SpinVerse PRO (Monthly)</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(STRIPE_PRODUCTS.PRO_MONTHLY.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Email: {email}</span>
                  <span>Billed monthly</span>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                {/* Stripe Elements would go here */}
                <div className="p-4 border-2 border-dashed border-gray-700 rounded-lg text-center">
                  <p className="text-gray-400 mb-2">Card Element Placeholder</p>
                  <p className="text-xs text-gray-500">
                    In production, this would be the Stripe Elements card input
                  </p>
                  <div id="card-element" className="hidden">
                    {/* Stripe card element would be mounted here */}
                  </div>
                </div>

                {paymentState.error && (
                  <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-lg">
                    <p className="text-red-400 text-sm">{paymentState.error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={paymentState.isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentState.isProcessing ? 'Processing Payment...' : 'Complete Upgrade'}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center">
                By proceeding, you agree to our Terms of Service and Privacy Policy.
                You can cancel your subscription at any time.
              </p>
            </div>
          )}

          {/* Processing Step */}
          {currentStep === 'processing' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Setting Up Your Account</h3>
                <p className="text-gray-400 mb-4">Please wait while we process your payment and migrate your data.</p>
                
                {migrationState.isInProgress && (
                  <div className="bg-gray-800 rounded-lg p-4 text-left">
                    <p className="text-sm text-gray-300 mb-2">Migration Progress:</p>
                    <div className="space-y-2 text-xs text-gray-400">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Payment processed</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span>Migrating your sequences and data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Welcome to PRO! 🎉</h3>
                <p className="text-gray-400 mb-6">
                  Your account has been successfully upgraded and your data has been migrated.
                </p>
              </div>

              {migrationState.result && (
                <div className="bg-gray-800 rounded-lg p-4 text-left">
                  <h4 className="text-white font-semibold mb-3">Migration Summary:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sequences migrated:</span>
                      <span className="text-white">{migrationState.result.migratedSequences}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Settings migrated:</span>
                      <span className="text-white">{migrationState.result.migratedSettings ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Usage data migrated:</span>
                      <span className="text-white">{migrationState.result.migratedUsageData ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Creating
              </button>
            </div>
          )}

          {/* Error Step */}
          {currentStep === 'error' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">Upgrade Failed</h3>
                <p className="text-gray-400 mb-4">
                  {paymentState.error || migrationState.error || 'An unexpected error occurred during the upgrade process.'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 border border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleRetry}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}