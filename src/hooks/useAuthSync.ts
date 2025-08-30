'use client';

import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import { useAnonymousStore } from '@/stores/anonymousStore';
import { useEffect, useState } from 'react';

export function useAuthSync() {
  const { user, isLoaded } = useUser();
  const userStore = useUserStore();
  const anonymousStore = useAnonymousStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    // User is signed in
    if (user) {
      const userData = {
        clerkUserId: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || '',
        avatarUrl: user.imageUrl || '',
      };

      // Set user data in store
      userStore.setUser(userData);

      // Check if this user has PRO subscription
      // For now, we'll keep existing subscription data
      // In production, this would check against Stripe/database

      console.log('✅ Clerk user synced:', userData);
      setIsInitialized(true);
    } else {
      // User is not signed in, clear user store
      userStore.clearUser();
      setIsInitialized(true);
    }
  }, [user, isLoaded, userStore]);

  const getCurrentMode = () => {
    if (!isInitialized) return 'loading';
    return user ? 'authenticated' : 'anonymous';
  };

  const isAuthenticated = () => !!user && isLoaded;
  const isPro = () => userStore.subscription.tier === 'PRO' && userStore.subscription.status === 'active';
  const isFree = () => !isPro();

  return {
    user,
    isLoaded,
    isInitialized,
    mode: getCurrentMode(),
    isAuthenticated: isAuthenticated(),
    isPro: isPro(),
    isFree: isFree(),
    userStore,
    anonymousStore,
  };
}