'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUser } from '@clerk/nextjs';

function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const userStore = useUserStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingMessage, setProcessingMessage] = useState('Setting up your PRO account...');

  const sessionId = searchParams.get('session_id');
  const flow = searchParams.get('flow'); // 'anonymous' or undefined

  useEffect(() => {
    const handleUpgradeSuccess = async () => {
      if (!sessionId) {
        setProcessingMessage('No session found. Redirecting...');
        setTimeout(() => router.push('/'), 2000);
        return;
      }

      // Handle anonymous flow (payment-first registration)
      if (flow === 'anonymous') {
        setProcessingMessage('Payment successful! Creating your account...');
        
        // Get stored checkout info
        const checkoutInfo = sessionStorage.getItem('spinverse_checkout_info');
        if (checkoutInfo) {
          const info = JSON.parse(checkoutInfo);
          console.log('Anonymous checkout completed:', info);
        }

        setTimeout(() => {
          setProcessingMessage('Account creation in progress. Check your email for login details.');
          setTimeout(() => {
            setIsProcessing(false);
          }, 2000);
        }, 2000);
        
        return;
      }

      // Handle authenticated user flow (existing Clerk user upgrading)
      if (user && sessionId) {
        setProcessingMessage('Upgrading your account to PRO...');
        
        setTimeout(() => {
          userStore.updateSubscription({
            tier: 'PRO',
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });

          userStore.setUser({
            clerkUserId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            name: user.fullName || '',
            avatarUrl: user.imageUrl || '',
          });

          setIsProcessing(false);
        }, 2000);
      } else {
        // User not authenticated, might be anonymous flow without proper flow param
        setProcessingMessage('Processing your upgrade...');
        setTimeout(() => {
          setIsProcessing(false);
        }, 3000);
      }
    };

    handleUpgradeSuccess();
  }, [user, sessionId, flow, userStore, router]);

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        {isProcessing ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Processing Your Upgrade</h1>
              <p className="text-white/70">{processingMessage}</p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">
                {flow === 'anonymous' ? 'Payment Successful! 🎉' : 'Welcome to SpinVerse PRO! 🎉'}
              </h1>
              <p className="text-white/70 mb-6">
                {flow === 'anonymous' 
                  ? 'Your payment was processed successfully! Check your email for account setup instructions.'
                  : 'Your upgrade was successful! You now have access to all PRO features.'
                }
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 text-left space-y-3">
              <h3 className="text-white font-semibold mb-3">Your PRO Benefits:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">100 saved sequences (was 5)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">50 steps per sequence (was 10)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">100 wheel options (was 20)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">50 daily AI stories (was 3)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white/80">Steps AI Enhancer unlocked</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              I have checked my email!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <UpgradeSuccessContent />
    </Suspense>
  );
}