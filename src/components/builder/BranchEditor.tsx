'use client';

import { useState } from 'react';
import { SequenceBranch, SequenceCondition, WeightOverride } from '@/types/sequence';
import { useBuilderStore } from '@/stores/builderStore';
import { WeightOverrideEditor } from './WeightOverrideEditor';

interface BranchEditorProps {
  stepIndex: number;
  branches?: SequenceBranch[];
  onUpdate: (branches: SequenceBranch[]) => void;
}

export const BranchEditor: React.FC<BranchEditorProps> = ({
  stepIndex,
  branches = [],
  onUpdate
}) => {
  const { currentSequence } = useBuilderStore();
  
  if (!currentSequence) return null;

  const currentStep = currentSequence.steps[stepIndex];
  const availableSteps = currentSequence.steps.filter(s => {
    // Exclude current step
    if (s.id === currentStep.id) return false;
    
    // Exclude steps with dynamic multi-spin (they should only be reached via their determiner step)
    if (s.multiSpin?.enabled && s.multiSpin?.mode === 'dynamic') return false;
    
    return true;
  });
  
  const addBranch = () => {
    const firstSegmentId = currentStep.wheelConfig.segments[0]?.id || '';
    const newBranch: SequenceBranch = {
      conditions: [{
        stepId: currentStep.id,
        segmentId: firstSegmentId,
        operator: 'equals',
        value: firstSegmentId
      }],
      nextStepId: availableSteps[0]?.id || '',
      operator: 'and'
    };
    onUpdate([...branches, newBranch]);
  };

  const removeBranch = (branchIndex: number) => {
    const updatedBranches = branches.filter((_, index) => index !== branchIndex);
    onUpdate(updatedBranches);
  };

  const updateBranch = (branchIndex: number, field: keyof SequenceBranch, value: any) => {
    const updatedBranches = branches.map((branch, index) => 
      index === branchIndex ? { ...branch, [field]: value } : branch
    );
    onUpdate(updatedBranches);
  };

  const updateBranchWeightOverrides = (branchIndex: number, weightOverrides: WeightOverride[]) => {
    const updatedBranches = branches.map((branch, index) => 
      index === branchIndex ? { ...branch, weightOverrides } : branch
    );
    onUpdate(updatedBranches);
  };

  const updateCondition = (branchIndex: number, conditionIndex: number, field: keyof SequenceCondition, value: any) => {
    const updatedBranches = branches.map((branch, bIndex) => 
      bIndex === branchIndex ? {
        ...branch,
        conditions: branch.conditions.map((condition, cIndex) =>
          cIndex === conditionIndex ? { ...condition, [field]: value } : condition
        )
      } : branch
    );
    onUpdate(updatedBranches);
  };

  const updateConditionMultiple = (branchIndex: number, conditionIndex: number, updates: Partial<SequenceCondition>) => {
    const updatedBranches = branches.map((branch, bIndex) => 
      bIndex === branchIndex ? {
        ...branch,
        conditions: branch.conditions.map((condition, cIndex) =>
          cIndex === conditionIndex ? { 
            ...condition, 
            ...updates 
          } : condition
        )
      } : branch
    );
    onUpdate(updatedBranches);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">Step Connections</h4>
        <button
          onClick={addBranch}
          className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Branch</span>
        </button>
      </div>

      {branches.length === 0 && (
        <div className="bg-white/5 rounded-xl p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No branches configured</p>
          </div>
          <p className="text-xs text-gray-500">
            Add branches to create conditional paths based on wheel results.
            Without branches, this step will use linear progression.
          </p>
        </div>
      )}

      {branches.map((branch, branchIndex) => (
        <div key={branchIndex} className="bg-white/5 rounded-xl border border-white/10">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-medium text-white">Branch {branchIndex + 1}</h5>
              <button
                onClick={() => removeBranch(branchIndex)}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                title="Remove Branch"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Next Step
                </label>
                <select
                  value={branch.nextStepId}
                  onChange={(e) => updateBranch(branchIndex, 'nextStepId', e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Select next step...</option>
                  {availableSteps.map(step => (
                    <option key={step.id} value={step.id}>
                      {step.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Condition Logic
                </label>
                <select
                  value={branch.operator || 'and'}
                  onChange={(e) => updateBranch(branchIndex, 'operator', e.target.value as 'and' | 'or')}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="and">All conditions (AND)</option>
                  <option value="or">Any condition (OR)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h6 className="text-sm font-medium text-gray-300">Conditions</h6>
              <button
                onClick={() => {
                  const firstSegmentId = currentStep.wheelConfig.segments[0]?.id || '';
                  const newCondition: SequenceCondition = {
                    stepId: currentStep.id,
                    segmentId: firstSegmentId,
                    operator: 'equals',
                    value: firstSegmentId
                  };
                  const updatedBranches = branches.map((b, bIndex) => 
                    bIndex === branchIndex ? {
                      ...b,
                      conditions: [...b.conditions, newCondition]
                    } : b
                  );
                  onUpdate(updatedBranches);
                }}
                className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-all duration-300 flex items-center space-x-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Condition</span>
              </button>
            </div>
            
            {branch.conditions.map((condition, conditionIndex) => (
              <div key={conditionIndex} className="bg-white/5 rounded-lg p-3 mb-3 border border-white/10">
                <div className="grid md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Step Result</label>
                    <select
                      value={condition.stepId}
                      onChange={(e) => {
                        const newStepId = e.target.value;
                        const newStep = currentSequence.steps.find(s => s.id === newStepId);
                        const firstSegmentId = newStep?.wheelConfig.segments[0]?.id || '';
                        
                        
                        // Update stepId and reset segmentId/value to first available option
                        updateConditionMultiple(branchIndex, conditionIndex, {
                          stepId: newStepId,
                          segmentId: firstSegmentId,
                          value: firstSegmentId
                        });
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    >
                      <option value={currentStep.id}>This step</option>
                      {currentSequence.steps
                        .filter(s => s.id !== currentStep.id)
                        .slice(0, currentSequence.steps.findIndex(s => s.id === currentStep.id))
                        .map(step => (
                          <option key={step.id} value={step.id}>
                            {step.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Option</label>
                    <select
                      value={condition.segmentId || ''}
                      onChange={(e) => {
                        updateConditionMultiple(branchIndex, conditionIndex, {
                          segmentId: e.target.value,
                          value: e.target.value
                        });
                      }}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    >
                      <option value="">Select option...</option>
                      {(() => {
                        const targetStep = currentSequence.steps.find(s => s.id === condition.stepId);
                        const segments = targetStep?.wheelConfig.segments || [];
                        return segments.map(segment => (
                          <option key={segment.id} value={segment.id}>
                            {segment.text}
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Operator</label>
                    <select
                      value={condition.operator || 'equals'}
                      onChange={(e) => updateCondition(branchIndex, conditionIndex, 'operator', e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    {branch.conditions.length > 1 && (
                      <button
                        onClick={() => {
                          const updatedBranches = branches.map((b, bIndex) => 
                            bIndex === branchIndex ? {
                              ...b,
                              conditions: b.conditions.filter((_, cIndex) => cIndex !== conditionIndex)
                            } : b
                          );
                          onUpdate(updatedBranches);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                        title="Remove Condition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                
                {conditionIndex < branch.conditions.length - 1 && (
                  <div className="mt-2 text-center">
                    <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                      {branch.operator === 'and' ? 'AND' : 'OR'}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Weight Override Editor */}
            <WeightOverrideEditor
              branchIndex={branchIndex}
              nextStepId={branch.nextStepId}
              weightOverrides={branch.weightOverrides}
              onUpdate={(weightOverrides) => updateBranchWeightOverrides(branchIndex, weightOverrides)}
            />
          </div>
        </div>
      ))}

      {branches.length > 0 && (
        <>
          {/* Conflict Detection */}
          {(() => {
            const conflicts = [];
            for (let i = 0; i < branches.length; i++) {
              for (let j = i + 1; j < branches.length; j++) {
                const branch1 = branches[i];
                const branch2 = branches[j];
                
                // Check if branches have identical simple conditions
                const hasIdenticalConditions = branch1.conditions.length === 1 && 
                  branch2.conditions.length === 1 &&
                  branch1.conditions[0].stepId === branch2.conditions[0].stepId &&
                  branch1.conditions[0].segmentId === branch2.conditions[0].segmentId &&
                  branch1.conditions[0].operator === branch2.conditions[0].operator;
                
                if (hasIdenticalConditions) {
                  conflicts.push({
                    branch1Index: i,
                    branch2Index: j,
                    condition: branch1.conditions[0]
                  });
                }
              }
            }
            
            if (conflicts.length > 0) {
              return (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.168 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="text-sm text-yellow-300 font-medium mb-1">Branch Conflicts Detected</p>
                      {conflicts.map((conflict, index) => {
                        const targetStep = currentSequence.steps.find(s => s.id === conflict.condition.stepId);
                        const targetSegment = targetStep?.wheelConfig.segments.find(s => s.id === conflict.condition.segmentId);
                        return (
                          <p key={index} className="text-xs text-yellow-200 mb-1">
                            Branches {conflict.branch1Index + 1} and {conflict.branch2Index + 1} both trigger on "{targetSegment?.text}" from {targetStep?.title}. Only Branch {conflict.branch1Index + 1} will execute.
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">Branching Logic</p>
                <p className="text-xs text-blue-200">
                  Branches are evaluated in order. The first matching branch will be taken. 
                  You can create complex conditions by combining multiple criteria with AND/OR logic.
                  If no branches match, the step will use linear progression.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};