'use client';

import React, { useEffect, useState } from 'react';
import { SpinWheel } from '@/components/wheel/SpinWheel';
import { ResultPopup } from '@/components/wheel/ResultPopup';
import { SequenceResultsScreen } from './SequenceResultsScreen';
import { MultiSpinResults } from './MultiSpinResults';
import { MultiSpinProgress } from './MultiSpinProgress';
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
  const [showMultiSpinResults, setShowMultiSpinResults] = useState(false);
  const wheelSettings = useWheelSettings();

  const {
    currentTheme,
    currentStepId,
    isActive,
    isTransitioning,
    multiSpinState,
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
    
    // Show result popup immediately for ALL spins (including multi-spin)
    setLastResult(result);
    setShowResultPopup(true);
    
    // Add haptic feedback for mobile (if enabled)
    if (wheelSettings.enableHapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate([50, 50, 100]); // Success vibration pattern
    }
    
    // Complete step (let the store handle multi-spin logic)
    completeStep(result);
    
    // If we're in the middle of a multi-spin, show popup and return
    if (multiSpinState.isActive) {
      // Use settings for popup duration, then hide
      const popupDuration = wheelSettings.resultPopupDuration * 1000; // Convert to ms
      setTimeout(() => {
        setShowResultPopup(false);
      }, popupDuration);
      return;
    }
    
    // Check if this will trigger multi-spin (check step-level config, not segment-level)
    const currentStep = currentTheme?.steps.find(step => step.id === currentStepId);
    const hasMultiSpin = currentStep?.multiSpin?.enabled && !multiSpinState.isActive;

    // If multi-spin was triggered, hide popup faster and show multi-spin UI
    if (hasMultiSpin) {
      setTimeout(() => {
        setShowResultPopup(false);
      }, 1000); // Shorter popup for multi-spin trigger
      return;
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

  // Handle multi-spin completion display (DO NOT call nextStep - it's handled in the store)
  useEffect(() => {
    if (!multiSpinState.isActive && multiSpinState.results.length > 1) {
      // Multi-spin just completed, show results
      setShowMultiSpinResults(true);
      
      // Auto-close results display after timeout
      setTimeout(() => {
        setShowMultiSpinResults(false);
        // Note: nextStep is already called by completeMultiSpin in the store
      }, 4000); // Show multi-spin results for 4 seconds
    }
  }, [multiSpinState.isActive, multiSpinState.results.length]);

  const handleCloseMultiSpinResults = () => {
    setShowMultiSpinResults(false);
    // Note: nextStep is already called by completeMultiSpin in the store, no need to call again
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
      {/* Multi-Spin Progress Overlay */}
      <MultiSpinProgress />
      {/* Enhanced Step Info */}
      <div className="text-center space-y-4 cinematic-enter">
        <div className="relative inline-block">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-lg blur opacity-30"></div>
          <div className="relative flex items-center justify-center space-x-4 px-4">
            {/* Theme Logo */}
            {currentTheme.id === 'mystical-academy' && (
              <span className="text-3xl opacity-60">🧙‍♂️</span>
            )}
            {currentTheme.id === 'survival-tournament' && (
              <span className="text-3xl opacity-60">🏹</span>
            )}
            {currentTheme.id === 'detective-mystery' && (
              <span className="text-3xl opacity-60">🕵️‍♂️</span>
            )}
            {currentTheme.id === 'underground-racing' && (
              <span className="text-3xl opacity-60">🏁</span>
            )}
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text">
              {currentStep.title}
            </h2>
          </div>
        </div>
        {currentStep.description && (
          <div className="glass-panel rounded-xl p-4 max-w-lg mx-auto">
            <p className="text-gray-200 text-lg font-light">
              {currentStep.description}
            </p>
          </div>
        )}
        
        {/* Enhanced debug info for development */}
        <div className="text-xs text-gray-500 font-mono bg-black/20 rounded-lg px-3 py-1 inline-block">
          🎯 {currentStep.id} | {useSequenceStore.getState().currentStepIndex + 1}/{currentTheme.steps.length} | 
          Results: {useSequenceStore.getState().results.length} | 
          {isComplete ? '✅ Complete' : '⚡ In Progress'}
        </div>
      </div>


      {/* Enhanced Wheel Container with Gaming Effects */}
      <div 
        className={`transition-all duration-700 relative ${
          isTransitioning 
            ? 'opacity-0 scale-90 transform translate-y-8 blur-sm' 
            : 'opacity-100 scale-100 transform translate-y-0'
        }`}
      >
        {/* Ambient glow effect */}
        <div className="absolute -inset-8 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-full blur-xl opacity-50 animate-pulse"></div>
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

      {/* Enhanced Transition Indicator */}
      {isTransitioning && (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-4 glass-panel rounded-full px-6 py-3">
            <div className="cosmic-spinner rounded-full h-6 w-6 border-2 border-cyan-400 border-t-transparent"></div>
            <span className="text-cyan-300 font-semibold text-lg">🌀 Loading next dimension...</span>
          </div>
          
          {/* Progress particles */}
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Multi-Spin Progress Indicator - now inline, not popup */}

      {/* Multi-Spin Results Modal */}
      {showMultiSpinResults && (
        <MultiSpinResults
          results={multiSpinState.results}
          isAggregated={multiSpinState.aggregateResults}
          onClose={handleCloseMultiSpinResults}
        />
      )}
    </div>
  );
};