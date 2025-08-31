'use client';

import React from 'react';
import { useSequenceStore } from '@/stores/sequenceStore';

interface MultiSpinProgressProps {
  className?: string;
}

export const MultiSpinProgress: React.FC<MultiSpinProgressProps> = ({ className = '' }) => {
  const { multiSpinState } = useSequenceStore();

  if (!multiSpinState.isActive) {
    return null;
  }


  const progress = multiSpinState.totalCount > 0 
    ? (multiSpinState.currentCount / multiSpinState.totalCount) * 100 
    : 0;

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none ${className}`}>
      <div className="bg-black/80 backdrop-blur-md rounded-lg px-6 py-4 border border-purple-500/30 pointer-events-auto">
        <div className="text-center mb-3">
          <h3 className="text-purple-200 font-semibold text-sm">
            🎰 Multi-Spin Active
          </h3>
          <p className="text-purple-300/80 text-xs">
            {multiSpinState.currentCount < multiSpinState.totalCount 
              ? `Spin ${multiSpinState.currentCount + 1} of ${multiSpinState.totalCount}`
              : `Completed ${multiSpinState.currentCount} of ${multiSpinState.totalCount}`}
          </p>
          <p className="text-cyan-400 font-medium text-xs mt-1">
            {multiSpinState.currentCount < multiSpinState.totalCount 
              ? "👆 Keep spinning the wheel!" 
              : "🎯 All spins complete!"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 bg-gray-700 rounded-full h-2 mb-3">
          <div 
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Spin Results Preview */}
        <div className="flex gap-2 justify-center">
          {multiSpinState.results.map((result, index) => (
            <div 
              key={`${result.stepId || multiSpinState.currentStepId}-${result.spinIndex || index}`}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
              style={{ 
                backgroundColor: result.segment.color,
                borderColor: index === 0 ? '#10b981' : '#8b5cf6',
                color: result.segment.textColor || '#ffffff'
              }}
              title={result.segment.text}
            >
              {index + 1}
            </div>
          ))}
          
          {/* Remaining spins as empty circles */}
          {Array.from({ length: multiSpinState.totalCount - multiSpinState.currentCount }).map((_, index) => (
            <div 
              key={`empty-${index}`}
              className="w-8 h-8 rounded-full border-2 border-gray-600 border-dashed flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" />
            </div>
          ))}
        </div>

        {/* Aggregation Mode Indicator */}
        {multiSpinState.aggregateResults && (
          <div className="mt-2 text-center">
            <span className="text-xs text-green-400 font-medium">
              📊 Collecting All Results
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSpinProgress;