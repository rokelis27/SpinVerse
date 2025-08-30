'use client';

import { useUserStore } from '@/stores/userStore';
import { useFeatureGate } from '@/hooks/auth/useFeatureGate';

interface SubscriptionStatusProps {
  variant?: 'minimal' | 'detailed';
  className?: string;
}

export function SubscriptionStatus({ variant = 'minimal', className = '' }: SubscriptionStatusProps) {
  const { subscription, usage, limits } = useUserStore();
  const { isPro } = useFeatureGate();

  if (variant === 'minimal') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          isPro 
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {subscription.tier}
        </div>
        {!isPro && (
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            Upgrade
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`glass-panel hud-panel rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">Account Status</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isPro 
            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' 
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        }`}>
          {subscription.tier} Plan
        </div>
      </div>

      {/* Usage Stats */}
      <div className="space-y-3">
        {/* Saved Sequences */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Saved Sequences</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${limits.maxSavedSequences ? (usage.sequencesCreated / limits.maxSavedSequences) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-white min-w-max">
              {usage.sequencesCreated}/{limits.maxSavedSequences || '∞'}
            </span>
          </div>
        </div>

        {/* Daily AI Stories */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Daily AI Stories</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 bg-gray-700 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${limits.dailyAiGenerations ? (usage.dailyAiGenerations / limits.dailyAiGenerations) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-white min-w-max">
              {usage.dailyAiGenerations}/{limits.dailyAiGenerations || '∞'}
            </span>
          </div>
        </div>

        {/* Total Spins */}
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total Spins</span>
          <span className="text-xs text-white">{usage.totalSpins.toLocaleString()}</span>
        </div>
      </div>

      {/* Upgrade Section */}
      {!isPro && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
            Upgrade to PRO - $9.99/mo
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            100 saved sequences, 50 daily AI stories & advanced features
          </p>
        </div>
      )}
    </div>
  );
}