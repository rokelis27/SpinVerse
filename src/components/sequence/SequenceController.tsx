'use client';

import React, { useEffect, useState } from 'react';
import { SpinWheel } from '@/components/wheel/SpinWheel';
import { ResultPopup } from '@/components/wheel/ResultPopup';
import { useSequenceStore, useCurrentStep, useIsSequenceComplete } from '@/stores/sequenceStore';
import { useWheelSettings } from '@/stores/settingsStore';
import { SpinResult } from '@/types/wheel';

interface SequenceControllerProps {
  className?: string;
}

export const SequenceController: React.FC<SequenceControllerProps> = ({ className }) => {
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const wheelSettings = useWheelSettings();

  const {
    currentTheme,
    isActive,
    isTransitioning,
    completeStep,
    nextStep,
    resetSequence,
  } = useSequenceStore();

  const currentStep = useCurrentStep();
  const isComplete = useIsSequenceComplete();

  // Handle wheel spin completion
  const handleSpinComplete = (result: SpinResult) => {
    if (!isActive || isTransitioning || showResultPopup) return;
    
    // Show result popup immediately
    setLastResult(result);
    setShowResultPopup(true);
    
    // Complete step immediately (saves result but doesn't advance)
    completeStep(result);
    
    // Add haptic feedback for mobile (if enabled)
    if (wheelSettings.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 100]); // Success vibration pattern
    }

    // Use settings for popup duration, then advance to next step
    const popupDuration = wheelSettings.resultPopupDuration * 1000; // Convert to ms
    setTimeout(() => {
      setShowResultPopup(false);
      nextStep(); // This will trigger transition
    }, popupDuration);
  };

  const handleClosePopup = () => {
    setShowResultPopup(false);
  };

  // Reset sequence when it completes
  useEffect(() => {
    if (isComplete && currentTheme) {
      // Sequence complete - could trigger video export here
      console.log('Sequence completed!', useSequenceStore.getState().results);
      
      // Auto-reset after showing results
      setTimeout(() => {
        resetSequence();
      }, 5000);
    }
  }, [isComplete, currentTheme, resetSequence]);

  if (!isActive || !currentTheme || !currentStep) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-gray-600">No active sequence. Start a themed sequence to begin!</p>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className={`text-center space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-green-600">Sequence Complete! 🎉</h2>
        <p className="text-gray-700">Your {currentTheme.name} story is ready!</p>
        <div className="text-sm text-gray-600">
          Resetting in 5 seconds...
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`} key={`step-${currentStep.id}`}>
      {/* Current Step Info */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold" style={{ color: currentTheme.color }}>
          {currentStep.title}
        </h2>
        {currentStep.description && (
          <p className="text-gray-600 max-w-md mx-auto">
            {currentStep.description}
          </p>
        )}
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-400">
          Step: {currentStep.id} | Index: {useSequenceStore.getState().currentStepIndex} | 
          Results: {useSequenceStore.getState().results.length} | 
          Total: {currentTheme.steps.length} |
          Complete: {isComplete ? 'YES' : 'NO'}
        </div>
      </div>

      {/* Wheel with transition effects */}
      <div 
        className={`transition-all duration-500 relative ${
          isTransitioning 
            ? 'opacity-0 scale-95 transform translate-y-4' 
            : 'opacity-100 scale-100 transform translate-y-0'
        }`}
      >
        <SpinWheel
          config={currentStep.wheelConfig}
          onSpinComplete={handleSpinComplete}
          disabled={isTransitioning || showResultPopup}
        />

        {/* Result Popup */}
        <ResultPopup
          result={lastResult}
          isVisible={showResultPopup}
          onClose={handleClosePopup}
        />
      </div>

      {/* Transition indicator */}
      {isTransitioning && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Preparing next wheel...</span>
          </div>
        </div>
      )}
    </div>
  );
};