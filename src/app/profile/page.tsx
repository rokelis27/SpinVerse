'use client';

import { UserProfile } from '@clerk/nextjs';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen cosmic-bg p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Profile Settings
              </h1>
              <p className="text-gray-400 mt-2">Manage your account and preferences</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard"
                className="px-4 py-2 glass-panel rounded-lg text-gray-300 hover:text-white transition-all duration-300"
              >
                ← Dashboard
              </Link>
              <Link 
                href="/"
                className="px-4 py-2 glass-panel rounded-lg text-gray-300 hover:text-white transition-all duration-300"
              >
                Home
              </Link>
            </div>
          </div>

          {/* Profile Section */}
          <div className="glass-panel hud-panel rounded-xl p-6 mb-8">
            <UserProfile 
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'w-full bg-transparent shadow-none',
                  navbar: 'bg-gray-800/50 border-gray-700',
                  navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700/50',
                  navbarButtonIcon: 'text-gray-400',
                  headerTitle: 'text-white',
                  headerSubtitle: 'text-gray-400',
                  profileSectionPrimaryButton: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                  formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
                  formFieldLabel: 'text-gray-300',
                  formFieldInput: 'bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-purple-500',
                  fileDropAreaBox: 'border-gray-700 bg-gray-800/30',
                  fileDropAreaIcon: 'text-gray-400',
                  fileDropAreaButtonPrimary: 'text-purple-400',
                  accordionTriggerButton: 'text-white hover:bg-gray-800/50',
                  accordionContent: 'bg-gray-800/30 border-gray-700',
                  badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  organizationPreview: 'bg-gray-800/30 border-gray-700',
                  organizationSwitcherTrigger: 'bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700/50',
                  organizationSwitcherTriggerIcon: 'text-gray-400',
                  pageScrollBox: 'bg-transparent',
                }
              }}
            />
          </div>

          {/* Account Status */}
          <div className="glass-panel hud-panel rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Account Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-sm">
                    FREE
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Sequences</span>
                  <span className="text-white">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Daily AI Stories</span>
                  <span className="text-white">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Max Sequence Steps</span>
                  <span className="text-white">10</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center p-6 border border-purple-500/30 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                <h3 className="text-lg font-bold text-white mb-2">Upgrade to PRO</h3>
                <p className="text-gray-400 text-sm text-center mb-4">
                  Unlock 100 saved sequences, 50 daily AI stories, and advanced features
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                  Upgrade Now - $9.99/mo
                </button>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="glass-panel hud-panel rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Usage This Month</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                <p className="text-gray-400 text-sm">Stories Created</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                <p className="text-gray-400 text-sm">Sequences Played</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">0</span>
                </div>
                <p className="text-gray-400 text-sm">AI Stories Generated</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}