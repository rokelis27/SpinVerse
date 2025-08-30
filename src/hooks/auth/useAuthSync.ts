'use client';

import { useUser } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import { useEffect } from 'react';

/**
 * Hook that syncs Clerk user data with our internal user store
 * This ensures our Zustand store stays in sync with Clerk authentication
 */
export function useAuthSync() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { setUser, clearUser, clerkUserId } = useUserStore();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      // Only update if the user has changed
      if (clerkUserId !== user.id) {
        setUser({
          clerkUserId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.fullName || user.firstName || user.username || null,
          avatarUrl: user.imageUrl || null,
        });
      }
    } else if (!isSignedIn && clerkUserId) {
      // User signed out, clear the store
      clearUser();
    }
  }, [isLoaded, isSignedIn, user, clerkUserId, setUser, clearUser]);

  return {
    isLoaded,
    isSignedIn,
    user,
  };
}