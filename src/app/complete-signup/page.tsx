'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useSignUp, useUser } from '@clerk/nextjs';
import { useState, useEffect, Suspense } from 'react';
import { useUserStore } from '@/stores/userStore';

function CompleteSignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user } = useUser();
  const { updateSubscription, setUser } = useUserStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Get the ticket from the URL params
  const ticket = searchParams.get('__clerk_ticket');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!ticket) {
      setError('No invitation token found. Please check your email link.');
    }
  }, [ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !ticket) return;

    setIsProcessing(true);
    setError('');

    try {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please try again.');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }

      // Create sign-up with invitation ticket
      // For ticket strategy, only pass the required parameters
      const signUpAttempt = await signUp.create({
        strategy: 'ticket',
        ticket: ticket,
        password,
      });

      if (signUpAttempt.status === 'complete') {
        // Set the session to active
        await setActive({ session: signUpAttempt.createdSessionId });
        
        // Wait a moment for the session to be fully established
        setTimeout(() => {
          // Update userStore with PRO status from completed signup
          // We'll get the full user data once the user object is loaded
          updateSubscription({
            tier: 'PRO',
            status: 'active',
            startDate: new Date().toISOString(),
          });
          
          console.log('✅ Updated userStore to PRO status after invitation signup');
        }, 500); // Small delay to ensure session is active
        
        // Redirect to success page or dashboard
        router.push('/upgrade/success?setup=complete&source=invitation');
      } else {
        console.error('Signup not complete:', signUpAttempt);
        setError('Account setup not completed. Please try again.');
      }
    } catch (err: any) {
      console.error('Signup failed:', err);
      setError(err.errors?.[0]?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Invalid Invitation Link</h1>
          <p className="text-white/70 mb-4">
            This invitation link is invalid or expired. Please check your email or request a new invitation.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Complete Your PRO Account</h1>
          <p className="text-white/70">
            Your payment was successful! Set up your account to access all PRO features.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Create a secure password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Re-enter your password"
              required
              minLength={8}
            />
          </div>

          {/* Clerk CAPTCHA element */}
          <div id="clerk-captcha" />

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Creating Account...' : 'Complete Setup & Access PRO Features'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <CompleteSignupContent />
    </Suspense>
  );
}