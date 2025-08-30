import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserSubscription {
  tier: 'FREE' | 'PRO';
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive' | 'cancelled';
}

export interface UsageStats {
  dailyAiGenerations: number;
  totalSpins: number;
  sequencesCreated: number;
  sequencesPlayed: number;
  lastAiResetDate: string;
}

export interface FeatureLimits {
  maxSequenceSteps: number;
  maxSavedSequences: number;
  maxWheelOptions: number;
  dailyAiGenerations: number; // Daily limit for AI story generations
}

export interface UserState {
  // User data
  clerkUserId: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  
  // Subscription
  subscription: UserSubscription;
  
  // Usage tracking
  usage: UsageStats;
  
  // Feature limits (computed from subscription)
  limits: FeatureLimits;
  
  // Actions
  setUser: (userData: {
    clerkUserId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }) => void;
  clearUser: () => void;
  updateSubscription: (subscription: Partial<UserSubscription>) => void;
  incrementUsage: (type: keyof Pick<UsageStats, 'totalSpins' | 'sequencesCreated' | 'sequencesPlayed'>) => void;
  incrementAiGeneration: () => boolean; // Returns false if limit exceeded
  resetDailyAiUsage: () => void;
  canUseFeature: (featureName: keyof FeatureLimits, currentUsage?: number) => boolean;
  getUsagePercentage: (featureName: keyof FeatureLimits, currentUsage: number) => number;
}

const getFeatureLimits = (tier: 'FREE' | 'PRO'): FeatureLimits => {
  return tier === 'PRO' 
    ? {
        maxSequenceSteps: 50,
        maxSavedSequences: 100,
        maxWheelOptions: 100,
        dailyAiGenerations: 50, // 50 per day
      }
    : {
        maxSequenceSteps: 10,
        maxSavedSequences: 5,
        maxWheelOptions: 20,
        dailyAiGenerations: 3,
      };
};

const initialState = {
  clerkUserId: null,
  email: null,
  name: null,
  avatarUrl: null,
  subscription: {
    tier: 'FREE' as const,
    status: 'active' as const,
  },
  usage: {
    dailyAiGenerations: 0,
    totalSpins: 0,
    sequencesCreated: 0,
    sequencesPlayed: 0,
    lastAiResetDate: new Date().toISOString().split('T')[0],
  },
  limits: getFeatureLimits('FREE'),
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (userData) => {
        set((state) => ({
          clerkUserId: userData.clerkUserId,
          email: userData.email,
          name: userData.name || null,
          avatarUrl: userData.avatarUrl || null,
        }));
      },

      clearUser: () => {
        set(() => ({
          ...initialState,
        }));
      },

      updateSubscription: (subscriptionUpdate) => {
        set((state) => {
          const newSubscription = { ...state.subscription, ...subscriptionUpdate };
          return {
            subscription: newSubscription,
            limits: getFeatureLimits(newSubscription.tier),
          };
        });
      },

      incrementUsage: (type) => {
        set((state) => ({
          usage: {
            ...state.usage,
            [type]: state.usage[type] + 1,
          },
        }));
      },

      incrementAiGeneration: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Reset daily counter if it's a new day
        if (state.usage.lastAiResetDate !== today) {
          set((state) => ({
            usage: {
              ...state.usage,
              dailyAiGenerations: 0,
              lastAiResetDate: today,
            },
          }));
        }

        // Check if user can generate more
        const currentState = get();
        if (currentState.limits.dailyAiGenerations !== null && 
            currentState.usage.dailyAiGenerations >= currentState.limits.dailyAiGenerations) {
          return false; // Limit exceeded
        }

        // Increment usage
        set((state) => ({
          usage: {
            ...state.usage,
            dailyAiGenerations: state.usage.dailyAiGenerations + 1,
          },
        }));

        return true; // Success
      },

      resetDailyAiUsage: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => ({
          usage: {
            ...state.usage,
            dailyAiGenerations: 0,
            lastAiResetDate: today,
          },
        }));
      },

      canUseFeature: (featureName, currentUsage) => {
        const state = get();
        const limit = state.limits[featureName];
        
        // Null means unlimited (PRO feature)
        if (limit === null) return true;
        
        // Use provided current usage or try to infer from state
        const usage = currentUsage ?? (() => {
          switch (featureName) {
            case 'dailyAiGenerations':
              return state.usage.dailyAiGenerations;
            default:
              return 0;
          }
        })();
        
        return usage < limit;
      },

      getUsagePercentage: (featureName, currentUsage) => {
        const state = get();
        const limit = state.limits[featureName];
        
        // Unlimited features return 0%
        if (limit === null) return 0;
        
        return Math.min(100, (currentUsage / limit) * 100);
      },
    }),
    {
      name: 'spinverse-user-storage',
      version: 1,
      // Only persist essential data, not computed values
      partialize: (state) => ({
        clerkUserId: state.clerkUserId,
        email: state.email,
        name: state.name,
        avatarUrl: state.avatarUrl,
        subscription: state.subscription,
        usage: state.usage,
      }),
    }
  )
);