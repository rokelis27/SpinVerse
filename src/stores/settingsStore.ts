import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppSettings, SettingsActions, WheelSettings } from '@/types/settings';

interface SettingsStore extends AppSettings, SettingsActions {}

const defaultWheelSettings: WheelSettings = {
  spinSpeed: 'normal',
  resultPopupDuration: 2,
  autoAdvanceDelay: 0.5,
  enableHapticFeedback: true,
  enableSoundEffects: false,
};

const defaultSettings: AppSettings = {
  wheel: defaultWheelSettings,
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...defaultSettings,

        // Actions
        updateWheelSettings: (newSettings: Partial<WheelSettings>) => {
          set(
            (state) => ({
              wheel: {
                ...state.wheel,
                ...newSettings,
              },
            }),
            false,
            'settings/updateWheelSettings'
          );
        },

        resetSettings: () => {
          set(defaultSettings, false, 'settings/reset');
        },
      }),
      {
        name: 'spinverse-settings', // localStorage key
        version: 1,
      }
    ),
    {
      name: 'settings-store',
    }
  )
);

// Selectors for easy access
export const useWheelSettings = () => {
  return useSettingsStore((state) => state.wheel);
};

export const useSpeedPreset = () => {
  const { spinSpeed } = useWheelSettings();
  return spinSpeed;
};