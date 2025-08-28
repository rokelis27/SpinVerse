'use client';

import React from 'react';
import { SpinResult } from '@/types/wheel';

interface MultiSpinResultsProps {
  results: SpinResult[];
  isAggregated: boolean;
  onClose?: () => void;
  className?: string;
}

export const MultiSpinResults: React.FC<MultiSpinResultsProps> = ({ 
  results, 
  isAggregated, 
  onClose,
  className = '' 
}) => {
  if (results.length === 0) return null;

  const initialResult = results.find(r => r.spinIndex === 0);
  const multiSpinResults = results.filter(r => (r.spinIndex ?? 0) > 0);

  return (
    <div className={`fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 ${className}`}>
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-8 max-w-2xl w-full mx-4 border border-purple-500/30">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            🎰 Multi-Spin Complete!
          </h2>
          <p className="text-purple-300">
            {isAggregated ? 'All results collected' : 'Final result determined'}
          </p>
        </div>

        {/* Initial Trigger Result */}
        {initialResult && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
              🎯 Trigger Result
            </h3>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                  style={{ 
                    backgroundColor: initialResult.segment.color,
                    color: initialResult.segment.textColor || '#ffffff'
                  }}
                >
                  🌟
                </div>
                <div>
                  <p className="text-white font-semibold">{initialResult.segment.text}</p>
                  <p className="text-gray-400 text-sm">
                    Triggered {multiSpinResults.length} additional spin{multiSpinResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Multi-Spin Results Grid */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
            🎲 Multi-Spin Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {multiSpinResults.map((result, index) => (
              <div 
                key={`multi-${result.stepId}-${result.spinIndex}`}
                className="bg-gray-800/50 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ 
                      backgroundColor: result.segment.color,
                      color: result.segment.textColor || '#ffffff'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {result.segment.text}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Spin #{result.spinIndex}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Result Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border border-purple-500/30">
          <h4 className="font-semibold text-white mb-2">
            {isAggregated ? '📊 All Results Matter' : '🏆 Final Result'}
          </h4>
          {isAggregated ? (
            <p className="text-purple-200 text-sm">
              Your story will include all {results.length} spin results, creating a richer narrative with multiple elements.
            </p>
          ) : (
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{ 
                  backgroundColor: results[results.length - 1]?.segment.color,
                  color: results[results.length - 1]?.segment.textColor || '#ffffff'
                }}
              >
                ✨
              </div>
              <div>
                <p className="text-white font-medium">
                  {results[results.length - 1]?.segment.text}
                </p>
                <p className="text-purple-200 text-sm">
                  This final result will determine your story path.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiSpinResults;