'use client';

import { UserButton as ClerkUserButton, useUser, SignInButton } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';

export function UserButton() {
  const { isLoaded, isSignedIn } = useUser();
  const userStore = useUserStore();
  const { isPro } = useFeatureGate();

  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton>
        <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
          Sign In
        </button>
      </SignInButton>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Debug Badge */}
      <div className={`px-2 py-1 rounded text-xs font-bold ${
        isPro 
          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
          : 'bg-gray-700 text-gray-300'
      }`}>
        {isPro ? 'PRO' : 'FREE'}
      </div>
      
      <ClerkUserButton 
        appearance={{
          elements: {
            avatarBox: 'w-8 h-8',
            userButtonPopoverCard: 'bg-gray-900/95 backdrop-blur-sm border border-gray-800 shadow-2xl',
            userButtonPopoverActionButton: 'text-gray-300 hover:text-white hover:bg-gray-800/50',
            userButtonPopoverActionButtonText: 'text-gray-300',
            userButtonPopoverFooter: 'hidden',
          }
        }}
      />
    </div>
  );
}