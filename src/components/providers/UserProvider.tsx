'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';

/**
 * Production-ready UserProvider that syncs Clerk user metadata with userStore
 * 
 * This component serves as the bridge between Clerk's authentication state
 * and our internal userStore, ensuring subscription status is always accurate.
 * 
 * Key responsibilities:
 * - Sync user data from Clerk to userStore on login
 * - Update subscription status when Clerk metadata changes
 * - Clear userStore on logout
 * - Handle edge cases and error states
 * - Provide fallback verification for subscription status
 */

interface ClerkUserMetadata {
  subscription_tier?: 'FREE' | 'PRO';
  subscription_status?: 'active' | 'cancelled' | 'past_due' | 'unpaid';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  subscription_start_date?: number;
  subscription_end_date?: number;
  cancel_at_period_end?: boolean;
  updated_at?: string;
  created_via?: string;
  payment_first_flow?: boolean;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const { 
    setUser, 
    clearUser, 
    updateSubscription,
    subscription: currentSubscription 
  } = useUserStore();
  
  // Ref to track previous user state to prevent unnecessary updates
  const previousUserRef = useRef<{
    userId: string | null;
    metadataHash: string;
  }>({ userId: null, metadataHash: '' });

  /**
   * Calculate hash of relevant metadata for change detection
   */
  const getMetadataHash = useCallback((metadata: ClerkUserMetadata) => {
    const relevantFields = {
      subscription_tier: metadata.subscription_tier,
      subscription_status: metadata.subscription_status,
      stripe_customer_id: metadata.stripe_customer_id,
      stripe_subscription_id: metadata.stripe_subscription_id,
      updated_at: metadata.updated_at,
    };
    return JSON.stringify(relevantFields);
  }, []);

  /**
   * Sync user data from Clerk to userStore
   */
  const syncUserData = useCallback((clerkUser: typeof user) => {
    if (!clerkUser) return;

    try {
      // Extract user basic info
      const userData = {
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: clerkUser.fullName || clerkUser.firstName || '',
        avatarUrl: clerkUser.imageUrl,
      };

      // Update user data in store
      setUser(userData);
      
      console.log('✅ UserProvider: Synced user data for', userData.email);
    } catch (error) {
      console.error('❌ UserProvider: Failed to sync user data:', error);
    }
  }, [setUser]);

  /**
   * Sync subscription data from Clerk metadata to userStore
   */
  const syncSubscriptionData = useCallback((clerkUser: typeof user) => {
    if (!clerkUser) return;

    try {
      const metadata = (clerkUser.publicMetadata || {}) as ClerkUserMetadata;
      
      // Extract subscription info with safe defaults
      const subscriptionTier = metadata.subscription_tier || 'FREE';
      const subscriptionStatus = metadata.subscription_status || 'active';
      const stripeCustomerId = metadata.stripe_customer_id;
      const stripeSubscriptionId = metadata.stripe_subscription_id;
      
      // Check if subscription is set to cancel at period end
      const cancelAtPeriodEnd = metadata.cancel_at_period_end;
      
      // Determine actual status based on tier, status, and cancellation state
      let finalStatus: 'active' | 'inactive' | 'cancelled' = 'active';
      if (subscriptionTier === 'FREE') {
        finalStatus = 'inactive';
      } else if (subscriptionStatus === 'cancelled' || subscriptionStatus === 'past_due') {
        finalStatus = 'cancelled';
      } else if (cancelAtPeriodEnd && subscriptionTier === 'PRO') {
        // Subscription is active but set to cancel at period end
        finalStatus = 'cancelled';
      }

      // Build subscription update object
      const subscriptionUpdate = {
        tier: subscriptionTier,
        status: finalStatus,
        startDate: metadata.subscription_start_date 
          ? new Date(metadata.subscription_start_date * 1000).toISOString()
          : undefined,
        endDate: metadata.subscription_end_date 
          ? new Date(metadata.subscription_end_date * 1000).toISOString()
          : undefined,
      };

      // Only update if subscription data has actually changed
      const hasChanged = (
        currentSubscription.tier !== subscriptionUpdate.tier ||
        currentSubscription.status !== subscriptionUpdate.status ||
        currentSubscription.startDate !== subscriptionUpdate.startDate
      );

      if (hasChanged) {
        updateSubscription(subscriptionUpdate);
        
        console.log('✅ UserProvider: Updated subscription status', {
          userId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          tier: subscriptionUpdate.tier,
          status: subscriptionUpdate.status,
          stripeCustomerId,
          stripeSubscriptionId,
        });
      }
    } catch (error) {
      console.error('❌ UserProvider: Failed to sync subscription data:', error);
      
      // Fallback: If we can't parse metadata, verify with API
      if (clerkUser.id) {
        console.log('⚠️ UserProvider: Will verify subscription via API fallback');
        verifySubscriptionFallback(clerkUser.id);
      }
    }
  }, [updateSubscription, currentSubscription]);

  /**
   * Fallback verification via API when metadata sync fails
   */
  const verifySubscriptionFallback = useCallback(async (clerkUserId: string) => {
    try {
      const response = await fetch('/api/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkUserId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.subscription) {
          updateSubscription(data.subscription);
          console.log('✅ UserProvider: Fallback verification successful');
        }
      } else {
        console.warn('⚠️ UserProvider: Fallback verification failed:', response.status);
      }
    } catch (error) {
      console.error('❌ UserProvider: Fallback verification error:', error);
    }
  }, [updateSubscription]);

  /**
   * Main effect to handle user state changes
   */
  useEffect(() => {
    // Wait for Clerk to load
    if (!isLoaded) return;

    const currentUserId = user?.id || null;
    const currentMetadata = (user?.publicMetadata || {}) as ClerkUserMetadata;
    const currentMetadataHash = getMetadataHash(currentMetadata);
    
    const previous = previousUserRef.current;
    
    // Handle user logout
    if (!user) {
      if (previous.userId) {
        clearUser();
        console.log('✅ UserProvider: Cleared user state on logout');
      }
      previousUserRef.current = { userId: null, metadataHash: '' };
      return;
    }

    // Handle user login or metadata changes
    const isNewUser = currentUserId !== previous.userId;
    const isMetadataChanged = currentMetadataHash !== previous.metadataHash;
    
    if (isNewUser || isMetadataChanged) {
      // Sync user data (always on new user, conditionally on metadata change)
      if (isNewUser) {
        syncUserData(user);
      }
      
      // Sync subscription data
      syncSubscriptionData(user);
      
      // Update tracking
      previousUserRef.current = {
        userId: currentUserId,
        metadataHash: currentMetadataHash,
      };
      
      // Log the sync event
      if (isNewUser) {
        console.log('🔄 UserProvider: New user login detected', currentUserId);
      } else if (isMetadataChanged) {
        console.log('🔄 UserProvider: User metadata changed', currentUserId);
      }
    }
  }, [
    user, 
    isLoaded, 
    syncUserData, 
    syncSubscriptionData, 
    clearUser,
    getMetadataHash
  ]);

  /**
   * DISABLED: Automatic periodic verification to prevent accidental downgrades
   * Verification is now only triggered manually when user clicks the badge
   */
  // useEffect(() => {
  //   if (!user || currentSubscription.tier !== 'PRO') return;
  //   const verifyInterval = setInterval(() => {
  //     console.log('🔍 UserProvider: Periodic subscription verification');
  //     verifySubscriptionFallback(user.id);
  //   }, 10 * 60 * 1000);
  //   return () => clearInterval(verifyInterval);
  // }, [user, currentSubscription.tier, verifySubscriptionFallback]);

  // No UI rendering - this is purely a data synchronization provider
  return <>{children}</>;
}