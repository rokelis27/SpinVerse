'use client';

import React, { useState, useMemo } from 'react';
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
  const [slideIndex, setSlideIndex] = useState(0);
  
  // Determine how many steps to show at once based on screen size and total steps
  const stepsPerView = useMemo(() => {
    if (steps.length <= 5) return steps.length; // Show all if 5 or fewer
    return Math.min(4, steps.length); // Show max 4 at a time for longer sequences
  }, [steps.length]);
  
  // Calculate the visible steps window
  const maxSlideIndex = Math.max(0, steps.length - stepsPerView);
  const currentSlideIndex = Math.min(slideIndex, maxSlideIndex);
  
  // Auto-center on current step
  const autoSlideIndex = useMemo(() => {
    if (steps.length <= stepsPerView) return 0;
    
    // Try to center current step in the view
    const idealStart = Math.max(0, currentStepIndex - Math.floor(stepsPerView / 2));
    const maxStart = Math.max(0, steps.length - stepsPerView);
    return Math.min(idealStart, maxStart);
  }, [currentStepIndex, steps.length, stepsPerView]);
  
  // Use auto-slide if not manually overridden
  const activeSlideIndex = slideIndex === 0 ? autoSlideIndex : currentSlideIndex;
  const visibleSteps = steps.slice(activeSlideIndex, activeSlideIndex + stepsPerView);

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Modern Progress Header */}
      <div className="glass-panel hud-panel rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            {/* Theme Logo */}
            {currentTheme.id === 'harry-potter' && (
              <img 
                src="/harry-potter-1.svg" 
                alt="Harry Potter" 
                className="w-8 h-8 filter brightness-0 invert opacity-80"
              />
            )}
            {currentTheme.id === 'hunger-games' && (
              <img 
                src="/the-hunger-games.svg" 
                alt="Hunger Games" 
                className="w-10 h-8 filter brightness-0 invert opacity-80"
              />
            )}
            <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
              {currentTheme.name}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-emerald-400 font-bold text-lg">{progress.completed}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-200 font-semibold">{progress.total}</span>
            <span className="text-gray-300 text-sm ml-2">Steps Complete</span>
          </div>
        </div>
        
        {/* Enhanced Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
            <div 
              className="h-3 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-lg"
              style={{ 
                width: `${progress.percentage}%`,
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)'
              }}
            />
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse shadow-lg"
               style={{ left: `${progress.percentage}%`, transform: 'translateX(-50%)' }} />
        </div>
        
        <div className="text-right mt-2">
          <span className="text-cyan-400 font-bold text-sm">{Math.round(progress.percentage)}% Complete</span>
        </div>
      </div>

      {/* Modern Step Indicators with Carousel */}
      <div className="relative">
        {/* Navigation arrows for longer sequences */}
        {steps.length > stepsPerView && (
          <>
            <button
              onClick={() => setSlideIndex(Math.max(0, activeSlideIndex - 1))}
              disabled={activeSlideIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full glass-panel hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={() => setSlideIndex(Math.min(maxSlideIndex, activeSlideIndex + 1))}
              disabled={activeSlideIndex >= maxSlideIndex}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full glass-panel hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        
        {/* Step indicators */}
        <div className="mx-8 overflow-hidden">
          <div className="flex justify-between items-start space-x-4 transition-transform duration-300">
            {visibleSteps.map((step, visibleIndex) => {
              const actualIndex = activeSlideIndex + visibleIndex;
              const stepResult = results.find(r => r.stepId === step.id);
              const isCompleted = !!stepResult;
              const isCurrent = actualIndex === currentStepIndex;
              const isSkipped = actualIndex < currentStepIndex && !isCompleted;
              
              return (
                <div 
                  key={step.id}
                  className="flex flex-col items-center min-w-0 flex-1 relative"
                >
                  {/* Connecting Line */}
                  {visibleIndex < visibleSteps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          isCompleted 
                            ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' 
                            : isSkipped
                            ? 'bg-gradient-to-r from-orange-400 to-yellow-400'
                            : 'bg-gray-600'
                        }`}
                        style={{ width: (isCompleted || isSkipped) ? '100%' : '0%' }}
                      />
                    </div>
                  )}
                  
                  {/* Step Circle */}
                  <div className="relative mb-3">
                    <div
                      className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-300 relative z-10 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/50'
                          : isCurrent
                          ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg shadow-cyan-500/50 animate-pulse'
                          : isSkipped
                          ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/50'
                          : 'bg-gray-600 border-gray-500 text-gray-300'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : isSkipped ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <span>{actualIndex + 1}</span>
                      )}
                    </div>
                    
                    {/* Glow effect for current step */}
                    {isCurrent && (
                      <div className="absolute inset-0 rounded-full bg-cyan-400/30 animate-ping" />
                    )}
                  </div>
                  
                  {/* Step Info */}
                  <div className="text-center min-w-0 w-full">
                    <div 
                      className={`text-base font-semibold mb-2 transition-colors duration-200 ${
                        isCompleted
                          ? 'text-emerald-400'
                          : isCurrent
                          ? 'text-cyan-400'
                          : isSkipped
                          ? 'text-orange-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                    
                    {/* Status indicator - Fixed height container */}
                    <div className="h-6 flex items-center justify-center mb-1">
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : isSkipped
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                      }`}>
                        {isCompleted ? 'Completed' : isCurrent ? 'Current' : isSkipped ? 'Skipped' : 'Pending'}
                      </div>
                    </div>
                    
                    {/* Show result if completed - Fixed height container */}
                    <div className="h-6 flex items-center justify-center">
                      {isCompleted && stepResult && (
                        <div className="text-xs text-gray-300 px-2 py-1 bg-gray-700/50 rounded-full">
                          {stepResult.spinResult.segment.text.length > 15 
                            ? `${stepResult.spinResult.segment.text.substring(0, 15)}...`
                            : stepResult.spinResult.segment.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Slide indicators */}
        {steps.length > stepsPerView && (
          <div className="flex justify-center mt-4 space-x-1">
            {Array.from({ length: Math.ceil(steps.length / stepsPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setSlideIndex(index * Math.floor(stepsPerView / 2))}
                className={`w-2 h-2 rounded-full transition-colors ${
                  Math.floor(activeSlideIndex / Math.max(1, Math.floor(stepsPerView / 2))) === index
                    ? 'bg-cyan-400'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};