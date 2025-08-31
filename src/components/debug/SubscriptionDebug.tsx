'use client';

import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import useSubscriptionStatus from '@/hooks/useSubscriptionStatus';
import { useState } from 'react';

/**
 * Debug component to test subscription integration
 * Shows all subscription-related data and provides manual verification button
 */
export function SubscriptionDebug() {
  const { user, isLoaded } = useUser();
  const userStore = useUserStore();
  const subscriptionStatus = useSubscriptionStatus();
  const [showRawData, setShowRawData] = useState(false);

  if (!isLoaded) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 m-4">
        <p className="text-white">Loading Clerk...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-4 m-4">
        <p className="text-white">No user logged in</p>
      </div>
    );
  }

  const clerkMetadata = user.publicMetadata as any;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 m-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">🔍 Subscription Debug Panel</h2>
        <button
          onClick={() => setShowRawData(!showRawData)}
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          {showRawData ? 'Hide' : 'Show'} Raw Data
        </button>
      </div>

      {/* Quick Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Current Status</h3>
          <div className={`px-3 py-2 rounded-lg font-bold text-center ${
            subscriptionStatus.isPro 
              ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            {subscriptionStatus.tier} - {subscriptionStatus.status.toUpperCase()}
          </div>
          <p className="text-sm text-gray-400">{subscriptionStatus.getStatusMessage()}</p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-white">Feature Access</h3>
          <div className="text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">Can Access PRO:</span>
              <span className={subscriptionStatus.canAccessProFeatures() ? 'text-green-400' : 'text-red-400'}>
                {subscriptionStatus.canAccessProFeatures() ? 'YES' : 'NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Needs Attention:</span>
              <span className={subscriptionStatus.needsAttention() ? 'text-yellow-400' : 'text-green-400'}>
                {subscriptionStatus.needsAttention() ? 'YES' : 'NO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Actions</h3>
        <div className="flex gap-2">
          <button
            onClick={subscriptionStatus.verifyWithStripe}
            disabled={subscriptionStatus.isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {subscriptionStatus.isLoading ? 'Verifying...' : 'Verify with Stripe'}
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reload Page
          </button>
        </div>
        
        {subscriptionStatus.lastError && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">❌ {subscriptionStatus.lastError}</p>
            <button
              onClick={subscriptionStatus.clearError}
              className="text-red-300 hover:text-red-200 text-xs underline mt-1"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      {/* Data Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-md font-semibold text-white mb-2">UserStore Data</h4>
          <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Tier:</span>
                <span className="text-white">{userStore.subscription.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">{userStore.subscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Date:</span>
                <span className="text-white text-xs">{userStore.subscription.startDate || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">End Date:</span>
                <span className="text-white text-xs">{userStore.subscription.endDate || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-md font-semibold text-white mb-2">Clerk Metadata</h4>
          <div className="bg-gray-900/50 rounded-lg p-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Tier:</span>
                <span className="text-white">{clerkMetadata?.subscription_tier || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white">{clerkMetadata?.subscription_status || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Customer ID:</span>
                <span className="text-white text-xs">{clerkMetadata?.stripe_customer_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Subscription ID:</span>
                <span className="text-white text-xs">{clerkMetadata?.stripe_subscription_id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Raw Data */}
      {showRawData && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold text-white">Raw Debug Data</h4>
          
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-1">Subscription Status Hook</h5>
            <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(subscriptionStatus.debugInfo, null, 2)}
            </pre>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-1">Clerk PublicMetadata</h5>
            <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(clerkMetadata, null, 2)}
            </pre>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-1">UserStore Full State</h5>
            <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify({
                user: {
                  clerkUserId: userStore.clerkUserId,
                  email: userStore.email,
                  name: userStore.name,
                },
                subscription: userStore.subscription,
                usage: userStore.usage,
                limits: userStore.limits,
              }, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}