'use client';

import { useRouter } from 'next/navigation';

export default function UpgradeCancelledPage() {
  const router = useRouter();

  const handleReturnHome = () => {
    router.push('/');
  };

  const handleTryAgain = () => {
    router.push('/?upgrade=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-600 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">Upgrade Cancelled</h1>
        <p className="text-white/70 mb-8">
          No worries! Your upgrade was cancelled and no payment was processed. 
          You can continue using SpinVerse with the free features.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleReturnHome}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-200 border border-white/20"
          >
            Continue with Free Version
          </button>
          
          <button
            onClick={handleTryAgain}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Upgrade Again
          </button>
        </div>

        <p className="text-xs text-white/50 mt-6">
          Need help? Contact us at support@spinverse.app
        </p>
      </div>
    </div>
  );
}