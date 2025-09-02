import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Production-ready anonymous data structure
export interface AnonymousSequence {
  id: string;
  name: string;
  description?: string;
  sequenceData: any; // Keep flexible for sequence evolution
  createdAt: string;
  updatedAt: string;
  version: string; // For data migration compatibility
}

export interface AnonymousUsage {
  dailyAiGenerations: number;
  totalSpins: number;
  sequencesCreated: number;
  sequencesPlayed: number;
  lastAiResetDate: string; // ISO date string
  lastActivityDate: string; // Track user engagement
}

export interface AnonymousSettings {
  theme: 'dark' | 'light' | 'system';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoSave: boolean;
  notifications: boolean;
}

export interface AnonymousData {
  version: number; // Schema version for migrations
  sequences: AnonymousSequence[];
  usage: AnonymousUsage;
  settings: AnonymousSettings;
  metadata: {
    firstVisit: string;
    lastBackup?: string;
    deviceId: string; // For analytics without tracking
  };
}

export interface AnonymousState extends AnonymousData {
  // Computed properties
  isAtSequenceLimit: boolean;
  isAtAiLimit: boolean;
  
  // Actions
  addSequence: (sequence: Omit<AnonymousSequence, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => boolean;
  updateSequence: (id: string, updates: Partial<Pick<AnonymousSequence, 'name' | 'description' | 'sequenceData'>>) => boolean;
  deleteSequence: (id: string) => boolean;
  
  // Usage tracking
  incrementSpins: (count?: number) => void;
  incrementSequencePlayed: () => void;
  tryIncrementAiGeneration: () => boolean; // Returns false if limit exceeded
  resetDailyAiUsage: () => void;
  
  // Settings
  updateSettings: (settings: Partial<AnonymousSettings>) => void;
  
  // Data management
  getStorageSize: () => number;
  exportData: () => string; // JSON export for backup
  importData: (data: string) => boolean; // Returns success status
  clearAllData: () => void;
  
  // Migration support
  migrateToAccount: () => AnonymousData; // Returns data for account migration
  
  // Error recovery
  validateAndRepairData: () => boolean;
}

// Constants
const ANONYMOUS_STORAGE_KEY = 'spinverse-anonymous';
const BACKUP_STORAGE_KEY = 'spinverse-anonymous-backup';
const MAX_SEQUENCES = 3;
const MAX_DAILY_AI_GENERATIONS = 3; // 3/day for anonymous, 50/day for PRO
const CURRENT_DATA_VERSION = 1;
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Utility functions for production safety
const generateId = (): string => {
  return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateDeviceId = (): string => {
  // SSR-safe localStorage check
  if (typeof window === 'undefined') {
    return `temp_device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  const stored = localStorage.getItem('spinverse-device-id');
  if (stored) return stored;
  
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  try {
    localStorage.setItem('spinverse-device-id', deviceId);
  } catch (e) {
    console.warn('Could not store device ID:', e);
  }
  return deviceId;
};

const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const isToday = (dateString: string): boolean => {
  return dateString === getCurrentDate();
};

const createDefaultData = (): AnonymousData => {
  const now = new Date().toISOString();
  return {
    version: CURRENT_DATA_VERSION,
    sequences: [],
    usage: {
      dailyAiGenerations: 0,
      totalSpins: 0,
      sequencesCreated: 0,
      sequencesPlayed: 0,
      lastAiResetDate: getCurrentDate(),
      lastActivityDate: now,
    },
    settings: {
      theme: 'system',
      soundEnabled: true,
      animationsEnabled: true,
      autoSave: true,
      notifications: true,
    },
    metadata: {
      firstVisit: now,
      deviceId: typeof window !== 'undefined' ? generateDeviceId() : `temp_device_${Date.now()}`,
    },
  };
};

// Data validation functions
const isValidSequence = (seq: any): seq is AnonymousSequence => {
  return (
    seq &&
    typeof seq.id === 'string' &&
    typeof seq.name === 'string' &&
    seq.sequenceData &&
    typeof seq.createdAt === 'string' &&
    typeof seq.updatedAt === 'string' &&
    typeof seq.version === 'string'
  );
};

const isValidAnonymousData = (data: any): data is AnonymousData => {
  if (!data || typeof data !== 'object') return false;
  
  return (
    typeof data.version === 'number' &&
    Array.isArray(data.sequences) &&
    data.sequences.every(isValidSequence) &&
    data.usage &&
    typeof data.usage.dailyAiGenerations === 'number' &&
    typeof data.usage.totalSpins === 'number' &&
    data.settings &&
    typeof data.settings.theme === 'string' &&
    data.metadata &&
    typeof data.metadata.firstVisit === 'string'
  );
};

// Safe localStorage operations with error handling
const safeLocalStorageOperation = <T>(
  operation: () => T,
  fallback: T,
  errorMessage: string
): T => {
  try {
    // SSR-safe check
    if (typeof window === 'undefined') {
      return fallback;
    }
    return operation();
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return fallback;
  }
};

const getStorageSize = (): number => {
  return safeLocalStorageOperation(
    () => {
      const data = localStorage.getItem(ANONYMOUS_STORAGE_KEY);
      return data ? new Blob([data]).size : 0;
    },
    0,
    'Failed to calculate storage size'
  );
};

// Custom storage with error recovery
const createSafeStorage = () => {
  return createJSONStorage(() => ({
    getItem: (name: string): string | null => {
      return safeLocalStorageOperation(
        () => localStorage.getItem(name),
        null,
        `Failed to read from localStorage: ${name}`
      );
    },
    setItem: (name: string, value: string): void => {
      safeLocalStorageOperation(
        () => {
          // Check storage size limit before saving
          const size = new Blob([value]).size;
          if (size > MAX_STORAGE_SIZE) {
            throw new Error(`Data size (${size} bytes) exceeds limit (${MAX_STORAGE_SIZE} bytes)`);
          }
          
          // Create backup before overwriting
          const existing = localStorage.getItem(name);
          if (existing) {
            localStorage.setItem(BACKUP_STORAGE_KEY, existing);
          }
          
          localStorage.setItem(name, value);
          return undefined;
        },
        undefined,
        `Failed to write to localStorage: ${name}`
      );
    },
    removeItem: (name: string): void => {
      safeLocalStorageOperation(
        () => {
          localStorage.removeItem(name);
          return undefined;
        },
        undefined,
        `Failed to remove from localStorage: ${name}`
      );
    },
  }));
};

export const useAnonymousStore = create<AnonymousState>()(
  persist(
    (set, get) => ({
      ...createDefaultData(),
      
      // Computed properties
      get isAtSequenceLimit() {
        const state = get();
        return (state?.sequences?.length || 0) >= MAX_SEQUENCES;
      },
      
      get isAtAiLimit() {
        const state = get();
        
        // Only check limit, don't auto-reset in getter (causes SSR issues)
        // Auto-reset is handled in tryIncrementAiGeneration method
        if (!isToday(state?.usage?.lastAiResetDate || '')) {
          return false; // If it's a new day, consider limit reset
        }
        
        return (state?.usage?.dailyAiGenerations || 0) >= MAX_DAILY_AI_GENERATIONS;
      },
      
      // Sequence management
      addSequence: (sequenceData) => {
        const state = get();
        
        if ((state?.sequences?.length || 0) >= MAX_SEQUENCES) {
          console.warn('Cannot add sequence: limit reached');
          return false;
        }
        
        try {
          const now = new Date().toISOString();
          const newSequence: AnonymousSequence = {
            ...sequenceData,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
            version: '1.0',
          };
          
          set((state) => ({
            sequences: [...(state?.sequences || []), newSequence],
            usage: {
              ...(state?.usage || {}),
              sequencesCreated: (state?.usage?.sequencesCreated || 0) + 1,
              lastActivityDate: now,
            },
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to add sequence:', error);
          return false;
        }
      },
      
      updateSequence: (id, updates) => {
        try {
          const now = new Date().toISOString();
          
          set((state) => ({
            sequences: state.sequences.map((seq) =>
              seq.id === id
                ? { ...seq, ...updates, updatedAt: now }
                : seq
            ),
            usage: {
              ...state.usage,
              lastActivityDate: now,
            },
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to update sequence:', error);
          return false;
        }
      },
      
      deleteSequence: (id) => {
        try {
          set((state) => ({
            sequences: (state?.sequences || []).filter((seq) => seq.id !== id),
            usage: {
              ...(state?.usage || {}),
              lastActivityDate: new Date().toISOString(),
            },
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to delete sequence:', error);
          return false;
        }
      },
      
      // Usage tracking
      incrementSpins: (count = 1) => {
        const now = new Date().toISOString();
        
        set((state) => ({
          usage: {
            ...(state?.usage || {}),
            totalSpins: (state?.usage?.totalSpins || 0) + count,
            lastActivityDate: now,
          },
        }));
      },
      
      incrementSequencePlayed: () => {
        const now = new Date().toISOString();
        
        set((state) => ({
          usage: {
            ...(state?.usage || {}),
            sequencesPlayed: (state?.usage?.sequencesPlayed || 0) + 1,
            lastActivityDate: now,
          },
        }));
      },
      
      tryIncrementAiGeneration: () => {
        const state = get();
        const today = getCurrentDate();
        
        // Auto-reset if new day
        if (!isToday(state?.usage?.lastAiResetDate || '')) {
          get().resetDailyAiUsage();
        }
        
        // Check limit after potential reset
        const currentState = get();
        if ((currentState?.usage?.dailyAiGenerations || 0) >= MAX_DAILY_AI_GENERATIONS) {
          return false;
        }
        
        const now = new Date().toISOString();
        set((state) => ({
          usage: {
            ...(state?.usage || {}),
            dailyAiGenerations: (state?.usage?.dailyAiGenerations || 0) + 1,
            lastActivityDate: now,
          },
        }));
        
        return true;
      },
      
      resetDailyAiUsage: () => {
        const today = getCurrentDate();
        
        set((state) => ({
          usage: {
            ...(state?.usage || {}),
            dailyAiGenerations: 0,
            lastAiResetDate: today,
          },
        }));
      },
      
      // Settings
      updateSettings: (settingsUpdate) => {
        try {
          set((state) => ({
            settings: { ...(state?.settings || {}), ...settingsUpdate },
          }));
        } catch (error) {
          console.error('Failed to update settings:', error);
        }
      },
      
      // Data management
      getStorageSize,
      
      exportData: () => {
        try {
          const state = get();
          const exportData = {
            version: state.version,
            sequences: state.sequences,
            usage: state.usage,
            settings: state.settings,
            metadata: {
              ...state.metadata,
              exportedAt: new Date().toISOString(),
            },
          };
          
          return JSON.stringify(exportData, null, 2);
        } catch (error) {
          console.error('Failed to export data:', error);
          return '{}';
        }
      },
      
      importData: (dataString) => {
        try {
          const importedData = JSON.parse(dataString);
          
          if (!isValidAnonymousData(importedData)) {
            console.error('Invalid data format for import');
            return false;
          }
          
          // Create backup before importing
          const currentData = get().exportData();
          safeLocalStorageOperation(
            () => localStorage.setItem('spinverse-import-backup', currentData),
            undefined,
            'Failed to create import backup'
          );
          
          set(() => ({
            ...importedData,
            metadata: {
              ...importedData.metadata,
              importedAt: new Date().toISOString(),
            },
          }));
          
          return true;
        } catch (error) {
          console.error('Failed to import data:', error);
          return false;
        }
      },
      
      clearAllData: () => {
        try {
          // Create final backup
          const currentData = get().exportData();
          safeLocalStorageOperation(
            () => localStorage.setItem('spinverse-clear-backup', currentData),
            undefined,
            'Failed to create clear backup'
          );
          
          set(() => createDefaultData());
        } catch (error) {
          console.error('Failed to clear data:', error);
        }
      },
      
      // Migration support
      migrateToAccount: () => {
        const state = get();
        return {
          version: state.version,
          sequences: state.sequences,
          usage: state.usage,
          settings: state.settings,
          metadata: {
            ...state.metadata,
            migratedAt: new Date().toISOString(),
          },
        };
      },
      
      // Error recovery
      validateAndRepairData: () => {
        try {
          const state = get();
          let needsRepair = false;
          const repairs: string[] = [];
          
          // Validate and repair sequences
          const validSequences = state.sequences.filter((seq) => {
            if (!isValidSequence(seq)) {
              needsRepair = true;
              repairs.push(`Removed invalid sequence: ${(seq as any)?.name || 'unknown'}`);
              return false;
            }
            return true;
          });
          
          // Validate usage data
          const usage = state.usage;
          if (typeof usage.dailyAiGenerations !== 'number' || usage.dailyAiGenerations < 0) {
            usage.dailyAiGenerations = 0;
            needsRepair = true;
            repairs.push('Reset daily AI generations');
          }
          
          if (typeof usage.totalSpins !== 'number' || usage.totalSpins < 0) {
            usage.totalSpins = 0;
            needsRepair = true;
            repairs.push('Reset total spins');
          }
          
          // Apply repairs if needed
          if (needsRepair) {
            console.warn('Data validation issues found, applying repairs:', repairs);
            set((state) => ({
              ...state,
              sequences: validSequences,
              usage,
            }));
          }
          
          return !needsRepair;
        } catch (error) {
          console.error('Failed to validate and repair data:', error);
          return false;
        }
      },
    }),
    {
      name: ANONYMOUS_STORAGE_KEY,
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          // Server-side: return a no-op storage
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      version: CURRENT_DATA_VERSION,
      
      // Handle data migrations
      migrate: (persistedState: any, version: number) => {
        console.log(`Migrating anonymous data from version ${version} to ${CURRENT_DATA_VERSION}`);
        
        // Add migration logic here as the schema evolves
        if (version === 0 && CURRENT_DATA_VERSION === 1) {
          // Example migration
          return {
            ...persistedState,
            version: CURRENT_DATA_VERSION,
            metadata: {
              ...persistedState.metadata,
              migratedFrom: version,
              migratedAt: new Date().toISOString(),
            },
          };
        }
        
        return persistedState;
      },
      
      // Only persist essential data
      partialize: (state) => ({
        version: state.version,
        sequences: state.sequences,
        usage: state.usage,
        settings: state.settings,
        metadata: state.metadata,
      }),
      
      // Handle storage errors gracefully
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate anonymous store:', error);
          
          // Try to restore from backup
          const backup = safeLocalStorageOperation(
            () => localStorage.getItem(BACKUP_STORAGE_KEY),
            null,
            'Failed to read backup data'
          );
          
          if (backup) {
            try {
              const backupData = JSON.parse(backup);
              if (isValidAnonymousData(backupData)) {
                console.log('Restored from backup data');
                return backupData;
              }
            } catch (e) {
              console.error('Backup data is corrupted:', e);
            }
          }
          
          // Fallback to default data
          console.log('Using default data due to storage errors');
          return createDefaultData();
        }
        
        // Validate data after rehydration
        if (state) {
          state.validateAndRepairData();
        }
      },
    }
  )
);

// Export constants for use by other components
export const ANONYMOUS_LIMITS = {
  MAX_SEQUENCES,
  MAX_DAILY_AI_GENERATIONS,
  MAX_SEQUENCE_STEPS: 10,
  MAX_WHEEL_OPTIONS: 20,
} as const;

// PRO limits for comparison
export const PRO_LIMITS = {
  MAX_SEQUENCES: 100,
  MAX_DAILY_AI_GENERATIONS: 50,
  MAX_SEQUENCE_STEPS: 50,
  MAX_WHEEL_OPTIONS: 100,
  STEPS_AI_ENHANCER: true, // PRO-only feature
} as const;