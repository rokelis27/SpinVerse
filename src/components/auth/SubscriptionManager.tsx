'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';

/**
 * Subscription Management Component
 * 
 * Provides PRO users with subscription management options:
 * - View current subscription status
 * - Cancel subscription
 * - Update payment method
 * - Download invoices
 */

interface SubscriptionManagerProps {
  onClose: () => void;
}

export function SubscriptionManager({ onClose }: SubscriptionManagerProps) {
  const { user } = useUser();
  const subscriptionStatus = useSubscriptionStatus();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelConfirm = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cancel subscription API error:', errorData);
        throw new Error(errorData.message || 'Failed to cancel subscription');
      }

      const data = await response.json();
      console.log('Cancel subscription success:', data);
      
      setShowCancelConfirm(false);
      
      // Wait a moment for API/webhook to process, then refresh subscription status
      setTimeout(async () => {
        try {
          await subscriptionStatus.verifyWithStripe();
          console.log('✅ Subscription status refreshed after cancellation');
        } catch (error) {
          console.error('⚠️ Failed to refresh subscription status:', error);
        }
      }, 1500);
      
      setError(null);
      // Success will be shown in the UI automatically when subscription status updates
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clerkUserId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Reactivate subscription API error:', errorData);
        throw new Error(errorData.message || 'Failed to reactivate subscription');
      }

      const data = await response.json();
      console.log('Reactivate subscription success:', data);
      
      // Wait a moment for API/webhook to process, then refresh subscription status
      setTimeout(async () => {
        try {
          await subscriptionStatus.verifyWithStripe();
          console.log('✅ Subscription status refreshed after reactivation');
        } catch (error) {
          console.error('⚠️ Failed to refresh subscription status:', error);
          // If verification fails, reload the page as fallback
          window.location.reload();
        }
      }, 1500);
      
      setError(null);
      // Success will be shown in the UI automatically when subscription status updates
    } catch (err: any) {
      console.error('Failed to reactivate subscription:', err);
      setError(err.message || 'Failed to reactivate subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Subscription Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Current Plan</h3>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Plan:</span>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscriptionStatus.isPro 
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {subscriptionStatus.tier}
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Status:</span>
                <span className={`capitalize ${
                  subscriptionStatus.status === 'active' ? 'text-green-400' :
                  subscriptionStatus.status === 'cancelled' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {subscriptionStatus.status}
                </span>
              </div>

              {subscriptionStatus.startDate && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">{formatDate(subscriptionStatus.startDate)}</span>
                </div>
              )}

              {subscriptionStatus.endDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    {subscriptionStatus.status === 'cancelled' ? 'Access ends:' : 'Next billing:'}
                  </span>
                  <span className={`text-white ${subscriptionStatus.status === 'cancelled' ? 'text-orange-400' : 'text-white'}`}>
                    {formatDate(subscriptionStatus.endDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PRO Features */}
          {subscriptionStatus.isPro && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">PRO Features</h3>
              <div className="space-y-2">
                {[
                  '50 steps per sequence (vs 10 free)',
                  '100 saved sequences (vs 5 free)', 
                  '100 wheel options (vs 20 free)',
                  '50 daily AI stories (vs 3 free)',
                  'AI Steps Enhancer access',
                  'Cloud sync across devices',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {subscriptionStatus.isPro ? (
              <>
                {subscriptionStatus.status === 'cancelled' ? (
                  <>
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <svg className="w-5 h-5 text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-orange-300 font-medium">Subscription Cancelled</span>
                      </div>
                      <p className="text-orange-200 text-sm mb-3">
                        Your subscription has been cancelled. You'll keep PRO access until{' '}
                        <strong>{subscriptionStatus.endDate ? formatDate(subscriptionStatus.endDate) : 'the end of your billing period'}</strong>.
                      </p>
                    </div>
                    
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Reactivating...' : 'Reactivate Subscription'}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Resume your PRO subscription and continue enjoying all features
                    </p>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelClick}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Cancel your PRO subscription (you'll keep access until the end of your billing period)
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Upgrade to PRO
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Get unlimited access to all features for $9.99/month
                </p>
              </>
            )}

            {/* Refresh Status */}
            <button
              onClick={subscriptionStatus.verifyWithStripe}
              disabled={subscriptionStatus.isLoading}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
            >
              {subscriptionStatus.isLoading ? 'Refreshing...' : 'Refresh Status'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-200 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}

          {subscriptionStatus.lastError && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{subscriptionStatus.lastError}</p>
              <button
                onClick={subscriptionStatus.clearError}
                className="text-red-300 hover:text-red-200 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-sm w-full">
            <div className="p-6 text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">Cancel PRO Subscription?</h3>
              <p className="text-gray-300 text-sm mb-6">
                Are you sure you want to cancel your PRO subscription? You'll keep access to all PRO features until the end of your current billing period.
              </p>

              {subscriptionStatus.endDate && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
                  <p className="text-yellow-300 text-sm">
                    <strong>Your PRO access will end on:</strong><br />
                    {formatDate(subscriptionStatus.endDate)}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}