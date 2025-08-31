export interface WheelSettings {
  spinSpeed: 'slow' | 'normal' | 'fast' | 'turbo';
  resultPopupDuration: number; // in seconds
  autoAdvanceDelay: number; // in seconds
  enableHapticFeedback: boolean;
  enableSoundEffects: boolean;
}

export interface AppSettings {
  wheel: WheelSettings;
}

export interface SettingsActions {
  updateWheelSettings: (settings: Partial<WheelSettings>) => void;
  resetSettings: () => void;
}

// Speed presets for wheel physics - controlling duration, not power
// IMPORTANT: Lower friction = spins longer, Higher friction = stops faster
export const SPEED_PRESETS = {
  slow: {
    minPower: 4,
    maxPower: 10,
    friction: 0.97,      // LOW friction = spins much longer
    minVelocity: 0.00075, // Very low threshold = maximum suspense
    description: 'Long, suspenseful spins',
  },
  normal: {
    minPower: 5,
    maxPower: 10,
    friction: 0.95,     // Medium friction 
    minVelocity: 0.001,  // Standard threshold
    description: 'Balanced spinning experience',
  },
  fast: {
    minPower: 5,
    maxPower: 10,
    friction: 0.9,     // Higher friction = stops faster
    minVelocity: 0.003,  // Higher threshold = quicker results
    description: 'Quick spins with brief suspense',
  },
  turbo: {
    minPower: 10,
    maxPower: 20,
    friction: 0.8,     
    minVelocity: 0.01,   
    description: 'Nearly instant results',
  },
} as const;