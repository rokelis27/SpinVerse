'use client';

import { useUserStore } from '@/stores/userStore';
import { useSavedSequences } from '@/hooks/useSavedSequences';

export interface FeatureGateResult {
  canUse: boolean;
  usagePercentage: number;
  currentUsage: number;
  limit: number | null;
  isPro: boolean;
}

/**
 * Hook for checking feature gates and usage limits
 */
export function useFeatureGate() {
  const { subscription, limits, canUseFeature, getUsagePercentage, usage } = useUserStore();
  const { savedSequences } = useSavedSequences();
  
  const isPro = subscription.tier === 'PRO';

  /**
   * Check if user can create more sequence steps
   */
  const checkSequenceSteps = (currentSteps: number): FeatureGateResult => {
    const limit = limits.maxSequenceSteps;
    return {
      canUse: canUseFeature('maxSequenceSteps', currentSteps),
      usagePercentage: getUsagePercentage('maxSequenceSteps', currentSteps),
      currentUsage: currentSteps,
      limit,
      isPro,
    };
  };

  /**
   * Check if user can save more sequences
   */
  const checkSavedSequences = (): FeatureGateResult => {
    const currentUsage = savedSequences.length;
    const limit = limits.maxSavedSequences;
    return {
      canUse: canUseFeature('maxSavedSequences', currentUsage),
      usagePercentage: getUsagePercentage('maxSavedSequences', currentUsage),
      currentUsage,
      limit,
      isPro,
    };
  };

  /**
   * Check if user can add more wheel options
   */
  const checkWheelOptions = (currentOptions: number): FeatureGateResult => {
    const limit = limits.maxWheelOptions;
    return {
      canUse: canUseFeature('maxWheelOptions', currentOptions),
      usagePercentage: getUsagePercentage('maxWheelOptions', currentOptions),
      currentUsage: currentOptions,
      limit,
      isPro,
    };
  };

  /**
   * Check if user can generate AI stories
   */
  const checkAiGeneration = (): FeatureGateResult => {
    const limit = limits.dailyAiGenerations;
    const currentUsage = usage.dailyAiGenerations;
    return {
      canUse: canUseFeature('dailyAiGenerations', currentUsage),
      usagePercentage: limit ? getUsagePercentage('dailyAiGenerations', currentUsage) : 0,
      currentUsage,
      limit,
      isPro,
    };
  };

  /**
   * Get upgrade message for a specific feature
   */
  const getUpgradeMessage = (featureName: string) => {
    const messages = {
      sequenceSteps: 'Upgrade to PRO to create sequences with up to 50 steps!',
      savedSequences: 'Upgrade to PRO to save up to 100 sequences!',
      wheelOptions: 'Upgrade to PRO to add up to 100 wheel options!',
      aiGeneration: 'Upgrade to PRO for 50 daily AI story generations!',
    };
    return messages[featureName as keyof typeof messages] || 'Upgrade to PRO for unlimited access!';
  };

  /**
   * Check if user should see upgrade prompts
   */
  const shouldShowUpgrade = (usagePercentage: number, threshold: number = 80) => {
    return !isPro && usagePercentage >= threshold;
  };

  return {
    // Feature checks
    checkSequenceSteps,
    checkSavedSequences,
    checkWheelOptions,
    checkAiGeneration,
    
    // Utils
    getUpgradeMessage,
    shouldShowUpgrade,
    
    // Current state
    isPro,
    limits,
    usage,
  };
}