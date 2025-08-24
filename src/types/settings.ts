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

// Speed presets for wheel physics
export const SPEED_PRESETS = {
  slow: {
    minPower: 1,
    maxPower: 2.5,
    friction: 0.98,
    minVelocity: 0.002,
  },
  normal: {
    minPower: 2,
    maxPower: 5,
    friction: 0.985,
    minVelocity: 0.001,
  },
  fast: {
    minPower: 4,
    maxPower: 8,
    friction: 0.988,
    minVelocity: 0.0005,
  },
  turbo: {
    minPower: 6,
    maxPower: 12,
    friction: 0.992,
    minVelocity: 0.0003,
  },
} as const;