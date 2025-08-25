'use client';

import React, { useEffect, useState } from 'react';
import { SpinWheel } from '@/components/wheel/SpinWheel';
import { ResultPopup } from '@/components/wheel/ResultPopup';
import { SequenceResultsScreen } from './SequenceResultsScreen';
import { useSequenceStore, useCurrentStep, useIsSequenceComplete } from '@/stores/sequenceStore';
import { useWheelSettings } from '@/stores/settingsStore';
import { SpinResult, WheelConfig } from '@/types/wheel';
import { applyConditionalWeights } from '@/utils/probabilityUtils';

interface SequenceControllerProps {
  onBackToHome?: () => void;
  className?: string;
}

export const SequenceController: React.FC<SequenceControllerProps> = ({ onBackToHome, className }) => {
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
    startSequence,
  } = useSequenceStore();

  const currentStep = useCurrentStep();
  const isComplete = useIsSequenceComplete();
  
  // Apply conditional weights to current step's wheel config
  const getAdjustedWheelConfig = (): WheelConfig | null => {
    if (!currentStep || !currentTheme) return null;
    
    // Get all previous results as a map
    const { results } = useSequenceStore.getState();
    const previousResults = results.reduce((acc, result) => {
      acc[result.stepId] = result.spinResult.segment.id;
      return acc;
    }, {} as Record<string, string>);
    
    // Apply conditional weights to segments
    const adjustedSegments = applyConditionalWeights(
      [...currentStep.wheelConfig.segments], // Create a copy
      previousResults
    );
    
    // Return updated wheel config with adjusted segments
    return {
      ...currentStep.wheelConfig,
      segments: adjustedSegments
    };
  };
  
  const adjustedWheelConfig = getAdjustedWheelConfig();

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

    // Check if sequence will be complete after this step
    const storeState = useSequenceStore.getState();
    const willBeComplete = storeState.currentTheme ? 
      require('@/utils/branchingUtils').isSequenceComplete(storeState.currentTheme, storeState.results) : false;
    
    // Use settings for popup duration, then advance to next step
    const popupDuration = wheelSettings.resultPopupDuration * 1000; // Convert to ms
    setTimeout(() => {
      setShowResultPopup(false);
      
      if (!willBeComplete) {
        nextStep(); // Only advance if sequence isn't complete
      }
      // If sequence is complete, component will re-render to show results screen
    }, popupDuration);
  };

  const handleClosePopup = () => {
    setShowResultPopup(false);
  };

  // Log completion for debugging
  useEffect(() => {
    if (isComplete && currentTheme) {
      console.log('Sequence completed!', useSequenceStore.getState().results);
    }
  }, [isComplete, currentTheme]);

  if (!isActive || !currentTheme) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-gray-600">No active sequence. Start a themed sequence to begin!</p>
      </div>
    );
  }

  // Handle restart sequence
  const handleRestart = () => {
    if (currentTheme) {
      resetSequence();
      startSequence(currentTheme);
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    resetSequence();
    if (onBackToHome) {
      onBackToHome();
    }
  };

  if (isComplete) {
    return (
      <SequenceResultsScreen
        onRestart={handleRestart}
        onBackToHome={handleBackToHome}
        className={className}
      />
    );
  }

  // Handle case where sequence is active but no current step (completed)
  if (!currentStep) {
    return (
      <SequenceResultsScreen
        onRestart={handleRestart}
        onBackToHome={handleBackToHome}
        className={className}
      />
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
          config={adjustedWheelConfig || currentStep.wheelConfig}
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