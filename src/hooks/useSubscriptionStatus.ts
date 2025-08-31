'use client';

import { useCallback, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';

interface SubscriptionStatus {
  tier: 'FREE' | 'PRO';
  status: 'active' | 'inactive' | 'cancelled';
  isActive: boolean;
  isPro: boolean;
  isFree: boolean;
  startDate?: string;
  endDate?: string;
  cancelAtPeriodEnd?: boolean;
  isLoading: boolean;
  lastVerified?: string;
}

/**
 * Production-ready hook for subscription status management
 * 
 * This hook provides:
 * - Real-time subscription status from userStore (synced via UserProvider)
 * - Manual verification with Stripe when needed
 * - Loading states and error handling
 * - Convenience flags for common checks
 */
export function useSubscriptionStatus() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const { subscription } = useUserStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  /**
   * Force verification with Stripe API
   * Use this when you suspect the cached status might be stale
   */
  const verifyWithStripe = useCallback(async (): Promise<boolean> => {
    if (!user || !clerkLoaded) {
      console.warn('useSubscriptionStatus: Cannot verify - user not loaded');
      return false;
    }

    setIsVerifying(true);
    setLastError(null);

    try {
      const response = await fetch('/api/verify-subscription', {
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
        throw new Error(errorData.message || 'Verification failed');
      }

      const result = await response.json();
      console.log('✅ Subscription verification completed:', result.subscription);
      
      // The verification API updates Clerk metadata, which will trigger
      // UserProvider to update userStore automatically
      
      return true;
    } catch (error: any) {
      console.error('❌ Subscription verification failed:', error);
      setLastError(error.message);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [user, clerkLoaded]);

  /**
   * Build the subscription status object
   */
  const buildSubscriptionStatus = useCallback((): SubscriptionStatus => {
    const isLoading = !clerkLoaded || isVerifying;
    const tier = subscription.tier;
    const status = subscription.status;
    const isActive = status === 'active';
    // PRO users include both active and cancelled (until period end)
    const isPro = tier === 'PRO' && (status === 'active' || status === 'cancelled');
    const isFree = tier === 'FREE' || (!isPro && !isActive);

    return {
      tier,
      status,
      isActive,
      isPro,
      isFree,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      cancelAtPeriodEnd: false, // TODO: Add this to subscription interface if needed
      isLoading,
      lastVerified: new Date().toISOString(), // Approximate
    };
  }, [subscription, clerkLoaded, isVerifying]);

  /**
   * Check if user can access PRO features
   * This is the definitive method for feature gating
   */
  const canAccessProFeatures = useCallback((): boolean => {
    return subscription.tier === 'PRO' && subscription.status === 'active';
  }, [subscription.tier, subscription.status]);

  /**
   * Check if subscription needs attention (failed payments, etc.)
   */
  const needsAttention = useCallback((): boolean => {
    return subscription.tier === 'PRO' && subscription.status !== 'active';
  }, [subscription.tier, subscription.status]);

  /**
   * Get user-friendly status message
   */
  const getStatusMessage = useCallback((): string => {
    if (!clerkLoaded) return 'Loading...';
    
    if (subscription.tier === 'PRO') {
      switch (subscription.status) {
        case 'active':
          return 'PRO subscription active';
        case 'cancelled':
          return 'PRO subscription cancelled';
        default:
          return 'PRO subscription inactive';
      }
    }
    
    return 'Free account';
  }, [subscription, clerkLoaded]);

  /**
   * Get appropriate upgrade message
   */
  const getUpgradeMessage = useCallback((feature?: string): string => {
    if (subscription.tier === 'PRO' && subscription.status !== 'active') {
      return 'Please update your payment method to continue using PRO features.';
    }

    const featureMessages: Record<string, string> = {
      sequences: 'Upgrade to PRO to save up to 100 sequences with cloud sync!',
      steps: 'Upgrade to PRO for 50 steps per sequence!',
      options: 'Upgrade to PRO for up to 100 wheel options!',
      ai: 'Upgrade to PRO for 50 daily AI stories!',
      enhancer: 'Upgrade to PRO to use the AI Steps Enhancer!',
    };

    return feature && featureMessages[feature] 
      ? featureMessages[feature]
      : 'Upgrade to PRO for unlimited access to all features!';
  }, [subscription]);

  const status = buildSubscriptionStatus();

  return {
    // Current status
    ...status,
    
    // Actions
    verifyWithStripe,
    
    // Convenience methods
    canAccessProFeatures,
    needsAttention,
    getStatusMessage,
    getUpgradeMessage,
    
    // Error state
    lastError,
    clearError: () => setLastError(null),
    
    // Debug info
    debugInfo: {
      clerkLoaded,
      hasUser: !!user,
      userId: user?.id,
      rawSubscription: subscription,
      isVerifying,
    },
  };
}

export default useSubscriptionStatus;