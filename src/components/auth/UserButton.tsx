'use client';

import { UserButton as ClerkUserButton, useUser, useClerk } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { SubscriptionManager } from '@/components/auth/SubscriptionManager';
import { useState } from 'react';

export function UserButton() {
  const { isLoaded, isSignedIn } = useUser();
  const userStore = useUserStore();
  const { isPro } = useFeatureGate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSubscriptionManager, setShowSubscriptionManager] = useState(false);
  const { openSignIn } = useClerk();
  const { openModal } = useUpgradeModal();


  if (!isLoaded) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
    );
  }

  if (!isSignedIn) {
    return (
      <div className="relative">
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
        >
          Sign In
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl z-50">
            <div className="py-2">
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  openSignIn();
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-800/50 transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
                </svg>
                <div>
                  <div className="font-medium">Login</div>
                  <div className="text-sm text-gray-400">I have an account</div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  openModal('sequences');
                }}
                className="w-full px-4 py-3 text-left text-white hover:bg-gray-800/50 transition-all duration-200 flex items-center gap-3"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <div>
                  <div className="font-medium">Register</div>
                  <div className="text-sm text-gray-400">Get PRO access</div>
                </div>
              </button>
            </div>
          </div>
        )}
        
        {/* Overlay to close dropdown when clicking outside */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Subscription Status Badge */}
        <button
          onClick={() => setShowSubscriptionManager(true)}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 hover:scale-105 ${
            isPro 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          title={isPro ? 'Manage PRO subscription' : 'Upgrade to PRO'}
        >
          {isPro ? 'PRO' : 'FREE'}
        </button>
        
        <ClerkUserButton 
          appearance={{
            elements: {
              avatarBox: 'w-10 h-10',
              userButtonPopoverCard: 'bg-gray-900/95 backdrop-blur-sm border border-gray-800 shadow-2xl',
              userButtonPopoverActionButton: 'text-gray-300 hover:text-white hover:bg-gray-800/50',
              userButtonPopoverActionButtonText: 'text-gray-300',
              userButtonPopoverFooter: 'hidden',
            }
          }}
        >
          <ClerkUserButton.MenuItems>
            <ClerkUserButton.Action
              label={isPro ? "Subscription Settings" : "Upgrade to PRO"}
              labelIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isPro ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  )}
                </svg>
              }
              onClick={() => setShowSubscriptionManager(true)}
            />
          </ClerkUserButton.MenuItems>
        </ClerkUserButton>
      </div>

      {/* Subscription Manager Modal */}
      {showSubscriptionManager && (
        <SubscriptionManager onClose={() => setShowSubscriptionManager(false)} />
      )}
    </>
  );
}