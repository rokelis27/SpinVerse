'use client';

import React from 'react';
import { useSequenceStore } from '@/stores/sequenceStore';

interface SequenceProgressProps {
  showStepNames?: boolean;
  className?: string;
}

export const SequenceProgress: React.FC<SequenceProgressProps> = ({ 
  showStepNames = true, 
  className = '' 
}) => {
  const {
    currentTheme,
    currentStepIndex,
    progress,
    results,
    isActive,
  } = useSequenceStore();

  if (!isActive || !currentTheme) {
    return null;
  }

  const steps = currentTheme.steps;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentTheme.name}</span>
          <span>{progress.completed} of {progress.total} complete</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const stepResult = results.find(r => r.stepId === step.id);
          const isCompleted = !!stepResult;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;
          
          return (
            <div 
              key={step.id}
              className="flex flex-col items-center space-y-2 flex-1"
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              {/* Step Name */}
              {showStepNames && (
                <div className="text-center max-w-16">
                  <div 
                    className={`text-xs font-medium transition-colors duration-200 ${
                      isCompleted
                        ? 'text-green-600'
                        : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  
                  {/* Show result if completed */}
                  {isCompleted && stepResult && (
                    <div className="text-xs text-gray-500 mt-1 truncate">
                      {stepResult.spinResult.segment.text}
                    </div>
                  )}
                </div>
              )}
              
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute top-4 h-0.5 transition-colors duration-300 ${
                    isCompleted
                      ? 'bg-green-500'
                      : index === currentStepIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                  style={{
                    left: `${((index + 1) * 100) / steps.length}%`,
                    width: `${100 / steps.length}%`,
                    transform: 'translateX(-50%)'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current Step Description */}
      {steps[currentStepIndex]?.description && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {steps[currentStepIndex].description}
          </p>
        </div>
      )}
    </div>
  );
};