'use client';

import React from 'react';
import { useSettingsStore, useWheelSettings } from '@/stores/settingsStore';
import { SPEED_PRESETS } from '@/types/settings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const { updateWheelSettings, resetSettings } = useSettingsStore();
  const wheelSettings = useWheelSettings();

  if (!isOpen) return null;

  const speedOptions = [
    { value: 'slow', label: 'Slow', description: 'Long, suspenseful spins' },
    { value: 'normal', label: 'Normal', description: 'Balanced spinning experience' },
    { value: 'fast', label: 'Fast', description: 'Quick spins with brief suspense' },
    { value: 'turbo', label: 'Turbo', description: 'Nearly instant results' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Wheel Speed Setting */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Wheel Speed
            </label>
            <div className="space-y-2">
              {speedOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    wheelSettings.spinSpeed === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="spinSpeed"
                    value={option.value}
                    checked={wheelSettings.spinSpeed === option.value}
                    onChange={(e) => updateWheelSettings({ spinSpeed: e.target.value as any })}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {wheelSettings.spinSpeed === option.value && (
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Result Popup Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Result Display Duration
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={wheelSettings.resultPopupDuration}
                onChange={(e) => updateWheelSettings({ resultPopupDuration: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {wheelSettings.resultPopupDuration}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">How long to show each result before advancing</p>
          </div>

          {/* Auto-advance Delay */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Transition Speed
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={wheelSettings.autoAdvanceDelay}
                onChange={(e) => updateWheelSettings({ autoAdvanceDelay: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {wheelSettings.autoAdvanceDelay}s
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Delay between wheels (0 = instant)</p>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-700">Haptic Feedback</label>
                <p className="text-xs text-gray-500">Vibration on mobile devices</p>
              </div>
              <button
                onClick={() => updateWheelSettings({ enableHapticFeedback: !wheelSettings.enableHapticFeedback })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  wheelSettings.enableHapticFeedback ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    wheelSettings.enableHapticFeedback ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-semibold text-gray-700">Sound Effects</label>
                <p className="text-xs text-gray-500">Audio feedback during spins</p>
              </div>
              <button
                onClick={() => updateWheelSettings({ enableSoundEffects: !wheelSettings.enableSoundEffects })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  wheelSettings.enableSoundEffects ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    wheelSettings.enableSoundEffects ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                resetSettings();
                // Show brief feedback
                const btn = document.activeElement as HTMLButtonElement;
                const originalText = btn.textContent;
                btn.textContent = 'Reset!';
                setTimeout(() => {
                  btn.textContent = originalText;
                }, 1000);
              }}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};