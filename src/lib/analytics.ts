import { track } from '@vercel/analytics';

// SpinVerse-specific analytics events
export const analytics = {
  // Wheel spinning events
  wheelSpin: (themeId: string, stepId: string, userMode: 'anonymous' | 'account') => {
    track('wheel_spin', {
      theme_id: themeId,
      step_id: stepId,
      user_mode: userMode,
    });
  },

  // Sequence events
  sequenceStart: (themeId: string, userMode: 'anonymous' | 'account') => {
    track('sequence_start', {
      theme_id: themeId,
      user_mode: userMode,
    });
  },

  sequenceComplete: (themeId: string, stepCount: number, userMode: 'anonymous' | 'account') => {
    track('sequence_complete', {
      theme_id: themeId,
      step_count: stepCount,
      user_mode: userMode,
    });
  },

  // AI story generation
  storyGenerate: (themeId: string, userMode: 'anonymous' | 'account', isCustomSequence: boolean) => {
    track('story_generate', {
      theme_id: themeId,
      user_mode: userMode,
      is_custom: isCustomSequence,
    });
  },

  storyGenerateSuccess: (themeId: string, rarityTier: string, userMode: 'anonymous' | 'account') => {
    track('story_generate_success', {
      theme_id: themeId,
      rarity_tier: rarityTier,
      user_mode: userMode,
    });
  },

  // Upgrade flow events
  upgradeModalOpen: (triggerFeature?: string) => {
    track('upgrade_modal_open', {
      trigger_feature: triggerFeature || 'direct',
    });
  },

  upgradeStart: (userMode: 'anonymous' | 'account') => {
    track('upgrade_start', {
      user_mode: userMode,
    });
  },

  upgradeComplete: (userMode: 'anonymous' | 'account') => {
    track('upgrade_complete', {
      user_mode: userMode,
    });
  },

  // Authentication events
  signUpStart: () => {
    track('sign_up_start');
  },

  signUpComplete: () => {
    track('sign_up_complete');
  },

  signIn: () => {
    track('sign_in');
  },

  // Feature usage
  sequenceBuilderOpen: (userMode: 'anonymous' | 'account') => {
    track('sequence_builder_open', {
      user_mode: userMode,
    });
  },

  stepEnhanceRequest: () => {
    track('step_enhance_request');
  },

  stepEnhanceSuccess: (addedOptions: number) => {
    track('step_enhance_success', {
      added_options: addedOptions,
    });
  },

  // Error tracking (complementing Sentry)
  analyticsError: (errorType: string, feature: string) => {
    track('analytics_error', {
      error_type: errorType,
      feature: feature,
    });
  },

  // User engagement
  pageView: (pageName: string, userMode: 'anonymous' | 'account') => {
    track('page_view', {
      page_name: pageName,
      user_mode: userMode,
    });
  },

  // Mobile-specific events
  mobileGesture: (gestureType: 'swipe' | 'pinch' | 'tap', element: string) => {
    track('mobile_gesture', {
      gesture_type: gestureType,
      element: element,
    });
  },

  // Performance tracking
  performanceMetric: (metricName: string, value: number, context?: string) => {
    track('performance_metric', {
      metric_name: metricName,
      value: value,
      context: context || 'general',
    });
  },
};

// Helper function to get user mode
export function getUserMode(): 'anonymous' | 'account' {
  // This would typically check Clerk authentication
  // For now, we'll use a simple check
  if (typeof window !== 'undefined') {
    // Check if user is authenticated (you can integrate with Clerk here)
    // For now, just return anonymous
    return 'anonymous';
  }
  return 'anonymous';
}

// Batch analytics for multiple events
export function trackBatch(events: Array<{
  name: string;
  properties?: Record<string, any>;
}>) {
  events.forEach(event => {
    track(event.name, event.properties);
  });
}