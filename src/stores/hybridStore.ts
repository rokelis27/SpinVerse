import { create } from 'zustand';
import { useAnonymousStore } from './anonymousStore';
import { useUserStore } from './userStore';

// Account state for PRO users
export interface AccountData {
  id: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  subscription: {
    status: 'active' | 'cancelled' | 'past_due' | 'unpaid';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
  preferences: {
    theme: 'dark' | 'light' | 'system';
    soundEnabled: boolean;
    animationsEnabled: boolean;
    notifications: boolean;
    emailNotifications: boolean;
  };
  usage: {
    totalSpins: number;
    sequencesCreated: number;
    sequencesPlayed: number;
    aiStoriesGenerated: number;
    lastActiveDate: string;
  };
  metadata: {
    createdAt: string;
    lastSyncAt: string;
    migrationId?: string; // Track if user was migrated from anonymous
  };
}

export interface AccountState {
  account: AccountData | null;
  isLoading: boolean;
  lastError: string | null;
  syncInProgress: boolean;
  
  // Actions
  setAccount: (account: AccountData) => void;
  clearAccount: () => void;
  updateAccountData: (updates: Partial<AccountData>) => void;
  updatePreferences: (preferences: Partial<AccountData['preferences']>) => void;
  updateUsage: (usage: Partial<AccountData['usage']>) => void;
  
  // Sync operations
  syncWithServer: () => Promise<boolean>;
  saveToServer: (data: any) => Promise<boolean>;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Create account store
export const useAccountStore = create<AccountState>()((set, get) => ({
  account: null,
  isLoading: false,
  lastError: null,
  syncInProgress: false,

  setAccount: (account) => {
    set({ account, lastError: null });
  },

  clearAccount: () => {
    set({ account: null, lastError: null });
  },

  updateAccountData: (updates) => {
    const current = get().account;
    if (current) {
      set({
        account: { ...current, ...updates },
        lastError: null,
      });
    }
  },

  updatePreferences: (preferences) => {
    const current = get().account;
    if (current) {
      set({
        account: {
          ...current,
          preferences: { ...current.preferences, ...preferences },
        },
        lastError: null,
      });
    }
  },

  updateUsage: (usage) => {
    const current = get().account;
    if (current) {
      set({
        account: {
          ...current,
          usage: { ...current.usage, ...usage },
          metadata: {
            ...current.metadata,
            lastSyncAt: new Date().toISOString(),
          },
        },
        lastError: null,
      });
    }
  },

  syncWithServer: async () => {
    const { account, syncInProgress } = get();
    
    if (!account || syncInProgress) {
      return false;
    }

    set({ syncInProgress: true, lastError: null });

    try {
      // Placeholder for server sync
      console.log('Syncing account data with server...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update last sync time
      get().updateAccountData({
        metadata: {
          ...account.metadata,
          lastSyncAt: new Date().toISOString(),
        },
      });

      set({ syncInProgress: false });
      return true;
    } catch (error: any) {
      console.error('Account sync failed:', error);
      set({ syncInProgress: false, lastError: error.message });
      return false;
    }
  },

  saveToServer: async (data) => {
    const { account, syncInProgress } = get();
    
    if (!account || syncInProgress) {
      return false;
    }

    set({ syncInProgress: true, lastError: null });

    try {
      console.log('Saving data to server...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      set({ syncInProgress: false });
      return true;
    } catch (error: any) {
      console.error('Save to server failed:', error);
      set({ syncInProgress: false, lastError: error.message });
      return false;
    }
  },

  setError: (error) => {
    set({ lastError: error });
  },

  clearError: () => {
    set({ lastError: null });
  },
}));

// User mode type
export type UserMode = 'anonymous' | 'account';

// Unified interface for both anonymous and account modes
export interface HybridUserState {
  // Mode detection
  userMode: UserMode;
  isAnonymous: boolean;
  hasAccount: boolean;
  
  // Data access (unified interface)
  sequences: Array<{
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
  }>;
  
  settings: {
    theme: 'dark' | 'light' | 'system';
    soundEnabled: boolean;
    animationsEnabled: boolean;
    notifications: boolean;
  };
  
  usage: {
    totalSpins: number;
    sequencesCreated: number;
    sequencesPlayed: number;
    dailyAiGenerations?: number; // Only for anonymous
    aiStoriesGenerated?: number; // Only for accounts
  };
  
  // Feature limits
  limits: {
    maxSequenceSteps: number;
    maxSavedSequences: number; // Maximum number of saved sequences
    maxWheelOptions: number;
    dailyAiGenerations: number; // Daily limit for AI story generations
  };
  
  // Actions (unified interface)
  addSequence: (sequence: any) => Promise<boolean>;
  updateSequence: (id: string, updates: any) => Promise<boolean>;
  deleteSequence: (id: string) => Promise<boolean>;
  
  incrementUsage: (type: string, amount?: number) => void;
  updateSettings: (settings: any) => Promise<boolean>;
  
  // Mode switching
  upgradeToAccount: (accountData: AccountData) => Promise<boolean>;
  
  // Error handling
  lastError: string | null;
  isLoading: boolean;
}

// Main hybrid store that orchestrates between anonymous and account modes
export const useHybridUserStore = create<HybridUserState>()((set, get) => {
  // Helper to determine current mode
  const getCurrentMode = (): UserMode => {
    const accountStore = useAccountStore.getState();
    return accountStore.account ? 'account' : 'anonymous';
  };

  // Helper to get current limits based on mode
  const getCurrentLimits = () => {
    const mode = getCurrentMode();
    
    if (mode === 'account') {
      // PRO limits
      return {
        maxSequenceSteps: 50,
        maxSavedSequences: 100, // 100 saved sequences for PRO
        maxWheelOptions: 100,
        dailyAiGenerations: 50, // 50 per day
      };
    } else {
      // Anonymous/FREE limits
      return {
        maxSequenceSteps: 10,
        maxSavedSequences: 5,
        maxWheelOptions: 20,
        dailyAiGenerations: 3,
      };
    }
  };

  // Helper to get sequences from appropriate store
  const getCurrentSequences = () => {
    const mode = getCurrentMode();
    
    if (mode === 'account') {
      // TODO: Get sequences from account store/API
      return [];
    } else {
      const anonymousStore = useAnonymousStore.getState();
      return anonymousStore.sequences.map(seq => ({
        id: seq.id,
        name: seq.name,
        description: seq.description,
        createdAt: seq.createdAt,
        updatedAt: seq.updatedAt,
      }));
    }
  };

  // Helper to get settings from appropriate store
  const getCurrentSettings = () => {
    const mode = getCurrentMode();
    
    if (mode === 'account') {
      const accountStore = useAccountStore.getState();
      return accountStore.account?.preferences || {
        theme: 'system' as const,
        soundEnabled: true,
        animationsEnabled: true,
        notifications: true,
      };
    } else {
      const anonymousStore = useAnonymousStore.getState();
      return anonymousStore.settings;
    }
  };

  // Helper to get usage from appropriate store
  const getCurrentUsage = () => {
    const mode = getCurrentMode();
    
    if (mode === 'account') {
      const accountStore = useAccountStore.getState();
      const usage = accountStore.account?.usage;
      return {
        totalSpins: usage?.totalSpins || 0,
        sequencesCreated: usage?.sequencesCreated || 0,
        sequencesPlayed: usage?.sequencesPlayed || 0,
        aiStoriesGenerated: usage?.aiStoriesGenerated || 0,
      };
    } else {
      const anonymousStore = useAnonymousStore.getState();
      return {
        totalSpins: anonymousStore.usage.totalSpins,
        sequencesCreated: anonymousStore.usage.sequencesCreated,
        sequencesPlayed: anonymousStore.usage.sequencesPlayed,
        dailyAiGenerations: anonymousStore.usage.dailyAiGenerations,
      };
    }
  };

  return {
    // Computed properties
    get userMode() {
      return getCurrentMode();
    },
    
    get isAnonymous() {
      return getCurrentMode() === 'anonymous';
    },
    
    get hasAccount() {
      return getCurrentMode() === 'account';
    },
    
    get sequences() {
      return getCurrentSequences();
    },
    
    get settings() {
      return getCurrentSettings();
    },
    
    get usage() {
      return getCurrentUsage();
    },
    
    get limits() {
      return getCurrentLimits();
    },

    // State
    lastError: null,
    isLoading: false,

    // Actions
    addSequence: async (sequence) => {
      const mode = getCurrentMode();
      set({ isLoading: true, lastError: null });

      try {
        if (mode === 'account') {
          const accountStore = useAccountStore.getState();
          const success = await accountStore.saveToServer(sequence);
          if (success) {
            // Update account usage
            accountStore.updateUsage({
              sequencesCreated: (accountStore.account?.usage.sequencesCreated || 0) + 1,
            });
          }
          set({ isLoading: false });
          return success;
        } else {
          const anonymousStore = useAnonymousStore.getState();
          const success = anonymousStore.addSequence(sequence);
          set({ isLoading: false });
          return success;
        }
      } catch (error: any) {
        set({ isLoading: false, lastError: error.message });
        return false;
      }
    },

    updateSequence: async (id, updates) => {
      const mode = getCurrentMode();
      set({ isLoading: true, lastError: null });

      try {
        if (mode === 'account') {
          const accountStore = useAccountStore.getState();
          const success = await accountStore.saveToServer({ id, ...updates });
          set({ isLoading: false });
          return success;
        } else {
          const anonymousStore = useAnonymousStore.getState();
          const success = anonymousStore.updateSequence(id, updates);
          set({ isLoading: false });
          return success;
        }
      } catch (error: any) {
        set({ isLoading: false, lastError: error.message });
        return false;
      }
    },

    deleteSequence: async (id) => {
      const mode = getCurrentMode();
      set({ isLoading: true, lastError: null });

      try {
        if (mode === 'account') {
          const accountStore = useAccountStore.getState();
          const success = await accountStore.saveToServer({ deleteSequenceId: id });
          set({ isLoading: false });
          return success;
        } else {
          const anonymousStore = useAnonymousStore.getState();
          const success = anonymousStore.deleteSequence(id);
          set({ isLoading: false });
          return success;
        }
      } catch (error: any) {
        set({ isLoading: false, lastError: error.message });
        return false;
      }
    },

    incrementUsage: (type, amount = 1) => {
      const mode = getCurrentMode();

      if (mode === 'account') {
        const accountStore = useAccountStore.getState();
        const currentUsage = accountStore.account?.usage;
        if (currentUsage) {
          accountStore.updateUsage({
            [type]: (currentUsage[type as keyof typeof currentUsage] as number || 0) + amount,
          });
        }
      } else {
        const anonymousStore = useAnonymousStore.getState();
        if (type === 'totalSpins') {
          anonymousStore.incrementSpins(amount);
        } else if (type === 'sequencesPlayed') {
          anonymousStore.incrementSequencePlayed();
        }
      }
    },

    updateSettings: async (settings) => {
      const mode = getCurrentMode();
      set({ isLoading: true, lastError: null });

      try {
        if (mode === 'account') {
          const accountStore = useAccountStore.getState();
          accountStore.updatePreferences(settings);
          const success = await accountStore.syncWithServer();
          set({ isLoading: false });
          return success;
        } else {
          const anonymousStore = useAnonymousStore.getState();
          anonymousStore.updateSettings(settings);
          set({ isLoading: false });
          return true;
        }
      } catch (error: any) {
        set({ isLoading: false, lastError: error.message });
        return false;
      }
    },

    upgradeToAccount: async (accountData) => {
      set({ isLoading: true, lastError: null });

      try {
        // Set account data
        const accountStore = useAccountStore.getState();
        accountStore.setAccount(accountData);

        // Migration would happen here in a real implementation
        // For now, we'll just clear the anonymous data after successful account setup
        
        set({ isLoading: false });
        return true;
      } catch (error: any) {
        set({ isLoading: false, lastError: error.message });
        return false;
      }
    },
  };
});

// Hook for easy component usage
export function useHybridUser() {
  const hybridStore = useHybridUserStore();
  const accountStore = useAccountStore();
  const anonymousStore = useAnonymousStore();

  // Subscribe to changes in underlying stores
  const userMode = hybridStore.userMode;
  
  return {
    ...hybridStore,
    
    // Additional utilities
    canUseFeature: (featureName: string, currentUsage?: number) => {
      if (userMode === 'account') {
        return true; // PRO users have unlimited access
      } else {
        // Use anonymous feature gating
        return anonymousStore.canUseFeature(featureName as any, currentUsage);
      }
    },
    
    getUpgradeMessage: (featureName: string) => {
      const messages = {
        sequences: 'Upgrade to PRO to save up to 100 sequences with cloud sync!',
        steps: 'Upgrade to PRO for 50 steps per sequence!',
        options: 'Upgrade to PRO for up to 100 wheel options!',
        ai: 'Upgrade to PRO for 50 daily AI stories!',
      };
      return messages[featureName as keyof typeof messages] || 'Upgrade to PRO for unlimited access!';
    },
    
    // Debug information
    debugInfo: {
      mode: userMode,
      hasAccount: !!accountStore.account,
      anonymousSequences: anonymousStore.sequences.length,
      accountSyncInProgress: accountStore.syncInProgress,
      lastError: hybridStore.lastError || accountStore.lastError,
    },
  };
}

export default useHybridUserStore;