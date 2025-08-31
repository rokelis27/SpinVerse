'use client';

import { UserButton as ClerkUserButton, useUser, useClerk } from '@clerk/nextjs';
import { useUserStore } from '@/stores/userStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { useState } from 'react';

export function UserButton() {
  const { isLoaded, isSignedIn } = useUser();
  const userStore = useUserStore();
  const { isPro } = useFeatureGate();
  const [showDropdown, setShowDropdown] = useState(false);
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