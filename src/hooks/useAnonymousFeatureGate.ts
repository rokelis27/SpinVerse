'use client';

import { useAnonymousStore, ANONYMOUS_LIMITS, PRO_LIMITS } from '@/stores/anonymousStore';
import { useCallback, useMemo } from 'react';

export interface FeatureGateResult {
  canUse: boolean;
  usagePercentage: number;
  currentUsage: number;
  limit: number;
  remainingUses: number;
  upgradeMessage: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface UpgradePromptConfig {
  shouldShow: boolean;
  title: string;
  description: string;
  features: string[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
  triggerUsagePercentage: number;
}

/**
 * Production-ready hook for anonymous user feature gating
 * Handles all edge cases and provides comprehensive validation
 */
export function useAnonymousFeatureGate() {
  const {
    sequences,
    usage,
    isAtSequenceLimit,
    isAtAiLimit,
    validateAndRepairData,
    getStorageSize,
  } = useAnonymousStore();

  // Validate data integrity on each use
  const ensureDataIntegrity = useCallback(() => {
    try {
      return validateAndRepairData();
    } catch (error) {
      console.error('Data integrity check failed:', error);
      return false;
    }
  }, [validateAndRepairData]);

  // Calculate urgency level based on usage percentage
  const calculateUrgencyLevel = (percentage: number): FeatureGateResult['urgencyLevel'] => {
    if (percentage >= 100) return 'critical';
    if (percentage >= 90) return 'high';
    if (percentage >= 70) return 'medium';
    return 'low';
  };

  // Sequence steps feature gate
  const checkSequenceSteps = useCallback((currentSteps: number): FeatureGateResult => {
    // Input validation
    if (typeof currentSteps !== 'number' || currentSteps < 0) {
      console.warn('Invalid currentSteps value:', currentSteps);
      currentSteps = 0;
    }

    const limit = ANONYMOUS_LIMITS.MAX_SEQUENCE_STEPS;
    const canUse = currentSteps < limit;
    const usagePercentage = Math.min(100, (currentSteps / limit) * 100);
    const remainingUses = Math.max(0, limit - currentSteps);
    const urgencyLevel = calculateUrgencyLevel(usagePercentage);

    let upgradeMessage = 'Upgrade to PRO for 50 steps per sequence!';
    if (urgencyLevel === 'critical') {
      upgradeMessage = 'You\'ve reached the 10-step limit. Upgrade to PRO for 5x more steps!';
    } else if (urgencyLevel === 'high') {
      upgradeMessage = `Only ${remainingUses} steps remaining. Upgrade to PRO for unlimited creativity!`;
    }

    return {
      canUse,
      usagePercentage,
      currentUsage: currentSteps,
      limit,
      remainingUses,
      upgradeMessage,
      urgencyLevel,
    };
  }, []);

  // Saved sequences feature gate
  const checkSavedSequences = useCallback((): FeatureGateResult => {
    ensureDataIntegrity();
    
    const currentUsage = sequences.length;
    const limit = ANONYMOUS_LIMITS.MAX_SEQUENCES;
    const canUse = currentUsage < limit;
    const usagePercentage = Math.min(100, (currentUsage / limit) * 100);
    const remainingUses = Math.max(0, limit - currentUsage);
    const urgencyLevel = calculateUrgencyLevel(usagePercentage);

    let upgradeMessage = 'Upgrade to PRO to save up to 100 sequences!';
    if (urgencyLevel === 'critical') {
      upgradeMessage = 'You\'ve saved 5 sequences. Upgrade to PRO for 20x more storage!';
    } else if (urgencyLevel === 'high') {
      upgradeMessage = `Only ${remainingUses} save slots remaining. Upgrade for unlimited saves!`;
    }

    return {
      canUse,
      usagePercentage,
      currentUsage,
      limit,
      remainingUses,
      upgradeMessage,
      urgencyLevel,
    };
  }, [sequences.length, ensureDataIntegrity]);

  // Wheel options feature gate
  const checkWheelOptions = useCallback((currentOptions: number): FeatureGateResult => {
    // Input validation
    if (typeof currentOptions !== 'number' || currentOptions < 0) {
      console.warn('Invalid currentOptions value:', currentOptions);
      currentOptions = 0;
    }

    const limit = ANONYMOUS_LIMITS.MAX_WHEEL_OPTIONS;
    const canUse = currentOptions < limit;
    const usagePercentage = Math.min(100, (currentOptions / limit) * 100);
    const remainingUses = Math.max(0, limit - currentOptions);
    const urgencyLevel = calculateUrgencyLevel(usagePercentage);

    let upgradeMessage = 'Upgrade to PRO for up to 100 wheel options!';
    if (urgencyLevel === 'critical') {
      upgradeMessage = 'You\'ve reached the 20-option limit. Upgrade to PRO for 5x more options!';
    } else if (urgencyLevel === 'high') {
      upgradeMessage = `Only ${remainingUses} options remaining. Upgrade for more flexibility!`;
    }

    return {
      canUse,
      usagePercentage,
      currentUsage: currentOptions,
      limit,
      remainingUses,
      upgradeMessage,
      urgencyLevel,
    };
  }, []);

  // AI generation feature gate
  const checkAiGeneration = useCallback((): FeatureGateResult => {
    ensureDataIntegrity();
    
    const currentUsage = usage.dailyAiGenerations;
    const limit = ANONYMOUS_LIMITS.MAX_DAILY_AI_GENERATIONS;
    const canUse = !isAtAiLimit && currentUsage < limit;
    const usagePercentage = Math.min(100, (currentUsage / limit) * 100);
    const remainingUses = Math.max(0, limit - currentUsage);
    const urgencyLevel = calculateUrgencyLevel(usagePercentage);

    let upgradeMessage = `Upgrade to PRO for ${PRO_LIMITS.MAX_DAILY_AI_GENERATIONS} daily AI stories!`;
    if (urgencyLevel === 'critical') {
      upgradeMessage = `You've used all ${limit} daily AI stories. Upgrade to PRO for ${PRO_LIMITS.MAX_DAILY_AI_GENERATIONS}/day!`;
    } else if (urgencyLevel === 'high') {
      upgradeMessage = `Only ${remainingUses} AI stories left today. Upgrade for ${PRO_LIMITS.MAX_DAILY_AI_GENERATIONS}/day!`;
    }

    return {
      canUse,
      usagePercentage,
      currentUsage,
      limit,
      remainingUses,
      upgradeMessage,
      urgencyLevel,
    };
  }, [usage.dailyAiGenerations, isAtAiLimit, ensureDataIntegrity]);

  // Storage usage check
  const checkStorageUsage = useCallback((): FeatureGateResult => {
    const currentSize = getStorageSize();
    const limit = 5 * 1024 * 1024; // 5MB limit
    const canUse = currentSize < limit * 0.9; // 90% threshold
    const usagePercentage = Math.min(100, (currentSize / limit) * 100);
    const remainingUses = Math.max(0, limit - currentSize);
    const urgencyLevel = calculateUrgencyLevel(usagePercentage);

    const sizeInMB = (currentSize / (1024 * 1024)).toFixed(2);
    const limitInMB = (limit / (1024 * 1024)).toFixed(2);

    let upgradeMessage = 'Upgrade to PRO for unlimited cloud storage!';
    if (urgencyLevel === 'critical') {
      upgradeMessage = `Local storage is full (${sizeInMB}/${limitInMB}MB). Upgrade to PRO for cloud storage!`;
    } else if (urgencyLevel === 'high') {
      upgradeMessage = `Storage almost full (${sizeInMB}/${limitInMB}MB). Upgrade for unlimited cloud storage!`;
    }

    return {
      canUse,
      usagePercentage,
      currentUsage: currentSize,
      limit,
      remainingUses,
      upgradeMessage,
      urgencyLevel,
    };
  }, [getStorageSize]);

  // Steps AI Enhancer feature gate (PRO-only)
  const checkStepsAiEnhancer = useCallback((): FeatureGateResult => {
    // Anonymous users cannot use this feature at all
    return {
      canUse: false,
      usagePercentage: 100, // Always at limit for anonymous
      currentUsage: 0,
      limit: 0,
      remainingUses: 0,
      upgradeMessage: 'Steps AI Enhancer is a PRO-only feature. Upgrade to enhance your sequence steps!',
      urgencyLevel: 'high' as const,
    };
  }, []);

  // Comprehensive upgrade prompt configuration
  const getUpgradePromptConfig = useCallback((
    featureName: 'sequences' | 'steps' | 'options' | 'ai' | 'storage',
    result: FeatureGateResult
  ): UpgradePromptConfig => {
    const baseConfig = {
      shouldShow: result.usagePercentage >= 70 || result.urgencyLevel === 'critical',
      urgency: result.urgencyLevel,
      triggerUsagePercentage: result.usagePercentage,
    };

    const configs = {
      sequences: {
        ...baseConfig,
        title: 'Need More Sequence Storage?',
        description: 'Save up to 100 sequences with cloud sync across all your devices.',
        features: [
          '100 saved sequences (vs 5 free)',
          'Cloud sync across devices',
          'Automatic backups',
          'Export to multiple formats',
          'Share with team members'
        ],
      },
      steps: {
        ...baseConfig,
        title: 'Create Longer Sequences?',
        description: 'Build complex stories with up to 50 steps per sequence.',
        features: [
          '50 steps per sequence (vs 10 free)',
          'Advanced branching logic',
          'Complex narrative structures',
          'Professional storytelling tools',
          'Advanced analytics'
        ],
      },
      options: {
        ...baseConfig,
        title: 'Need More Wheel Options?',
        description: 'Create wheels with up to 100 options for maximum variety.',
        features: [
          '100 wheel options (vs 20 free)',
          'Advanced wheel customization',
          'Multiple wheel types',
          'Custom themes and colors',
          'Weighted probability controls'
        ],
      },
      ai: {
        ...baseConfig,
        title: 'Generate More AI Stories?',
        description: 'Create up to 50 AI-generated stories every day.',
        features: [
          '50 daily AI stories (vs 3 free)',
          'Advanced AI prompts',
          'Multiple writing styles',
          'Custom AI personalities',
          'Story export and sharing'
        ],
      },
      storage: {
        ...baseConfig,
        title: 'Running Out of Space?',
        description: 'Get unlimited cloud storage with automatic sync and backup.',
        features: [
          'Unlimited cloud storage',
          'Automatic device sync',
          'Secure encrypted backup',
          'Version history',
          'Multi-device access'
        ],
      },
    };

    return configs[featureName];
  }, []);

  // Batch feature check for performance
  const getAllFeatureStates = useCallback(() => {
    ensureDataIntegrity();
    
    return {
      sequences: checkSavedSequences(),
      ai: checkAiGeneration(),
      storage: checkStorageUsage(),
      // Note: steps and options require parameters, so they're checked on-demand
    };
  }, [checkSavedSequences, checkAiGeneration, checkStorageUsage, ensureDataIntegrity]);

  // Get priority upgrade prompt (most urgent feature)
  const getPriorityUpgradePrompt = useCallback((): UpgradePromptConfig | null => {
    const features = getAllFeatureStates();
    
    // Find the most urgent feature that needs an upgrade
    let mostUrgent: { feature: string; result: FeatureGateResult } | null = null;
    
    Object.entries(features).forEach(([key, result]) => {
      if (result.urgencyLevel === 'critical' || result.usagePercentage >= 90) {
        if (!mostUrgent || result.usagePercentage > mostUrgent.result.usagePercentage) {
          mostUrgent = { feature: key, result };
        }
      }
    });
    
    if (mostUrgent) {
      return getUpgradePromptConfig(
        mostUrgent.feature as Parameters<typeof getUpgradePromptConfig>[0],
        mostUrgent.result
      );
    }
    
    return null;
  }, [getAllFeatureStates, getUpgradePromptConfig]);

  // Analytics data for upgrade optimization
  const getAnalyticsData = useCallback(() => {
    const features = getAllFeatureStates();
    
    return {
      totalUsage: Object.values(features).reduce((sum, f) => sum + f.usagePercentage, 0) / Object.keys(features).length,
      criticalFeatures: Object.entries(features).filter(([, f]) => f.urgencyLevel === 'critical').map(([name]) => name),
      nearLimitFeatures: Object.entries(features).filter(([, f]) => f.usagePercentage >= 80).map(([name]) => name),
      engagementScore: Math.min(100, usage.totalSpins / 10 + sequences.length * 20), // Custom engagement calculation
      daysSinceFirstVisit: Math.floor((Date.now() - new Date(usage.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)),
    };
  }, [getAllFeatureStates, usage, sequences.length]);

  // Memoized return value for performance
  return useMemo(() => ({
    // Feature checks
    checkSequenceSteps,
    checkSavedSequences,
    checkWheelOptions,
    checkAiGeneration,
    checkStorageUsage,
    checkStepsAiEnhancer,
    
    // Batch operations
    getAllFeatureStates,
    
    // Upgrade prompts
    getUpgradePromptConfig,
    getPriorityUpgradePrompt,
    
    // Analytics
    getAnalyticsData,
    
    // Current state
    limits: ANONYMOUS_LIMITS,
    usage,
    sequences: sequences.map(s => ({ id: s.id, name: s.name, updatedAt: s.updatedAt })), // Minimal data for performance
    
    // Quick access to critical states
    isAtLimit: isAtSequenceLimit || isAtAiLimit,
    hasHighUsage: getAllFeatureStates().sequences.usagePercentage >= 80 || getAllFeatureStates().ai.usagePercentage >= 80,
    needsUpgrade: getPriorityUpgradePrompt() !== null,
  }), [
    checkSequenceSteps,
    checkSavedSequences,
    checkWheelOptions,
    checkAiGeneration,
    checkStorageUsage,
    getAllFeatureStates,
    getUpgradePromptConfig,
    getPriorityUpgradePrompt,
    getAnalyticsData,
    usage,
    sequences,
    isAtSequenceLimit,
    isAtAiLimit,
  ]);
}

// Export types and constants for component usage
export type { FeatureGateResult, UpgradePromptConfig };
export { ANONYMOUS_LIMITS };