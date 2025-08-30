'use client';

import { UserButton as ClerkUserButton, useUser, SignInButton } from '@clerk/nextjs';

export function UserButton() {
  const { isLoaded, isSignedIn } = useUser();

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
  );
}