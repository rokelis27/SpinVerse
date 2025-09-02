'use client';

import { useState } from 'react';
import { WeightOverride } from '@/types/sequence';
import { useBuilderStore } from '@/stores/builderStore';

interface WeightOverrideEditorProps {
  branchIndex: number;
  nextStepId: string;
  weightOverrides?: WeightOverride[];
  onUpdate: (weightOverrides: WeightOverride[]) => void;
}

export const WeightOverrideEditor: React.FC<WeightOverrideEditorProps> = ({
  branchIndex,
  nextStepId,
  weightOverrides = [],
  onUpdate
}) => {
  const { currentSequence } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!currentSequence) return null;

  const targetStep = currentSequence.steps.find(step => step.id === nextStepId);
  if (!targetStep) return null;

  const addWeightOverride = () => {
    const firstSegment = targetStep.wheelConfig.segments[0];
    if (!firstSegment) return;

    const newOverride: WeightOverride = {
      segmentId: firstSegment.id,
      newWeight: firstSegment.weight || 1
    };
    onUpdate([...weightOverrides, newOverride]);
  };

  const removeWeightOverride = (index: number) => {
    const updatedOverrides = weightOverrides.filter((_, i) => i !== index);
    onUpdate(updatedOverrides);
  };

  const updateWeightOverride = (index: number, field: keyof WeightOverride, value: any) => {
    const updatedOverrides = weightOverrides.map((override, i) =>
      i === index ? { ...override, [field]: value } : override
    );
    onUpdate(updatedOverrides);
  };

  const calculateRemainingWeight = () => {
    const overriddenSegmentIds = new Set(weightOverrides.map(w => w.segmentId));
    const overriddenWeight = weightOverrides.reduce((sum, w) => sum + w.newWeight, 0);
    const nonOverriddenSegments = targetStep.wheelConfig.segments.filter(s => !overriddenSegmentIds.has(s.id));
    const remainingWeight = 100 - overriddenWeight;
    const averageWeightPerRemaining = nonOverriddenSegments.length > 0 ? remainingWeight / nonOverriddenSegments.length : 0;
    
    return {
      remainingWeight,
      averageWeightPerRemaining: Math.max(0, averageWeightPerRemaining),
      nonOverriddenSegments
    };
  };

  const { remainingWeight, averageWeightPerRemaining, nonOverriddenSegments } = calculateRemainingWeight();
  const isValidWeightDistribution = remainingWeight >= 0 && remainingWeight <= 100;

  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm text-purple-300 hover:text-purple-200 transition-colors"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>Weight Overrides</span>
            {weightOverrides.length > 0 && (
              <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                {weightOverrides.length} override{weightOverrides.length !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
        
        {isExpanded && (
          <button
            onClick={addWeightOverride}
            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded hover:bg-purple-500/30 transition-all duration-300 flex items-center space-x-1"
            disabled={weightOverrides.length >= targetStep.wheelConfig.segments.length}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Override</span>
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs">
                <p className="text-blue-300 font-medium mb-1">Weight Override System</p>
                <p className="text-blue-200">
                  When this branch is taken, these weight overrides will be applied to the target step &quot;{targetStep.title}&quot;. 
                  Segments not overridden will share the remaining weight equally.
                </p>
              </div>
            </div>
          </div>

          {weightOverrides.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm">
              No weight overrides configured. The target step will use default weights.
            </div>
          )}

          {weightOverrides.map((override, index) => {
            const segment = targetStep.wheelConfig.segments.find(s => s.id === override.segmentId);
            return (
              <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="grid md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Option</label>
                    <select
                      value={override.segmentId}
                      onChange={(e) => updateWeightOverride(index, 'segmentId', e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                    >
                      {targetStep.wheelConfig.segments.map(segment => (
                        <option key={segment.id} value={segment.id}>
                          {segment.text}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      New Weight: {override.newWeight}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={override.newWeight}
                      onChange={(e) => updateWeightOverride(index, 'newWeight', parseInt(e.target.value))}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      Default: {segment?.weight}%
                    </span>
                    <button
                      onClick={() => removeWeightOverride(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                      title="Remove Override"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {weightOverrides.length > 0 && (
            <div className={`rounded-lg p-3 border ${isValidWeightDistribution ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
              <div className="flex items-start space-x-2">
                <svg className={`w-4 h-4 mt-0.5 ${isValidWeightDistribution ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isValidWeightDistribution ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 15.5c-.77.833.192 2.5 1.732 2.5z"} />
                </svg>
                <div className="text-xs">
                  <p className={`font-medium mb-1 ${isValidWeightDistribution ? 'text-green-300' : 'text-red-300'}`}>
                    Weight Distribution {isValidWeightDistribution ? 'Valid' : 'Invalid'}
                  </p>
                  <div className="space-y-1">
                    <p className={`${isValidWeightDistribution ? 'text-green-200' : 'text-red-200'}`}>
                      Overridden weights: {weightOverrides.reduce((sum, w) => sum + w.newWeight, 0)}%
                    </p>
                    <p className={`${isValidWeightDistribution ? 'text-green-200' : 'text-red-200'}`}>
                      Remaining weight: {remainingWeight}%
                    </p>
                    <p className={`${isValidWeightDistribution ? 'text-green-200' : 'text-red-200'}`}>
                      {nonOverriddenSegments.length} non-overridden options will get ~{Math.round(averageWeightPerRemaining)}% each
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};