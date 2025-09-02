'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { SequenceStepBuilder, WheelSegmentBuilder } from '@/types/builder';
import { BranchEditor } from './BranchEditor';
import { EnhanceStepButton } from './EnhanceStepButton';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';
import { useFeatureGate } from '@/hooks/useFeatureGate';

interface StepEditorProps {
  step: SequenceStepBuilder;
  stepIndex: number;
}

export const StepEditor: React.FC<StepEditorProps> = ({ step, stepIndex }) => {
  const {
    updateStep,
    addSegment,
    removeSegment,
    updateSegment,
    insertDeterminerStep,
    removeDeterminerStep,
    findDeterminerStep
  } = useBuilderStore();
  
  const { checkWheelOptions } = useFeatureGate();
  const [activeTab, setActiveTab] = useState<'basic' | 'segments' | 'connections'>('basic');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleStepUpdate = (field: string, value: any) => {
    updateStep(stepIndex, { [field]: value });
  };

  const handleSegmentUpdate = (segmentId: string, field: string, value: any) => {
    updateSegment(stepIndex, segmentId, { [field]: value });
  };

  const handleBranchesUpdate = (branches: any[]) => {
    updateStep(stepIndex, { branches });
  };

  const handleAddSegment = () => {
    // Check wheel options limit using feature gate (works for both FREE and PRO)
    const currentOptions = step.wheelConfig.segments.length;
    const optionsCheck = checkWheelOptions(currentOptions);
    
    if (!optionsCheck.canUse) {
      if (optionsCheck.isPro) {
        // PRO user at limit - do nothing, button should be disabled
        return;
      } else {
        setShowUpgradeModal(true);
        return;
      }
    }

    const result = addSegment(stepIndex);
    if (!result.success && result.isLimitError) {
      setShowUpgradeModal(true);
    }
  };

  // Enhanced mode change handler that manages determiner steps
  const handleModeChange = (mode: 'fixed' | 'dynamic') => {
    if (mode === 'dynamic') {
      // Insert determiner step (this will also update the target step's multiSpin config)
      insertDeterminerStep(stepIndex);
    } else {
      // Remove determiner step (this will also reset the mode to fixed)
      removeDeterminerStep(stepIndex);
    }
  };

  // Check if this is a protected determiner step
  const isProtectedStep = step.isDeterminer;

  const getRandomColor = () => {
    const colors = [
      '#4682B4', '#32CD32', '#FF6347', '#9370DB', '#FFD700',
      '#FF69B4', '#00CED1', '#FFA500', '#DC143C', '#20B2AA'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  return (
    <div className="h-full flex flex-col">
      {/* Protected Step Warning */}
      {isProtectedStep && (
        <div className="mb-4 p-3 bg-orange-950/20 rounded-lg border border-orange-500/30">
          <div className="flex items-center space-x-2">
            <span className="text-orange-400">🔒</span>
            <div>
              <h4 className="text-sm font-medium text-orange-200">System-Generated Determiner Step</h4>
              <p className="text-xs text-orange-400/80 mt-1">
                This step determines spin count for the next multi-spin step. 
                You can edit the title and description, but wheel options and connections are protected.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header with Step Info and Enhance Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-3">
            <span>{step.title}</span>
          </h2>
          <p className="text-sm text-gray-400">Step {stepIndex + 1} • {step.wheelConfig.segments.length} options</p>
        </div>
        <EnhanceStepButton step={step} stepIndex={stepIndex} />
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab('basic')}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'basic'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Step Settings
        </button>
        <button
          onClick={() => setActiveTab('segments')}
          disabled={isProtectedStep}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'segments'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : isProtectedStep 
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Wheel Options ({step.wheelConfig.segments.length})
          {isProtectedStep && <span className="ml-1 text-orange-400">🔒</span>}
        </button>
        <button
          onClick={() => setActiveTab('connections')}
          disabled={isProtectedStep}
          className={`px-4 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'connections'
              ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
              : isProtectedStep 
                ? 'text-gray-600 cursor-not-allowed'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
          }`}
        >
          Connections ({(step.branches || []).length})
          {isProtectedStep && <span className="ml-1 text-orange-400">🔒</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'basic' && (
          <div className="h-full overflow-y-auto pr-2 space-y-6" style={{maxHeight: 'calc(100vh - 300px)'}}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Step Title
              </label>
              <input
                type="text"
                value={step.title}
                onChange={(e) => {
                  if (e.target.value.length <= 30) {
                    handleStepUpdate('title', e.target.value);
                  }
                }}
                maxLength={30}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter step title..."
              />
              <p className="text-xs text-gray-500 mt-1">{step.title.length}/30 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Step Description
              </label>
              <textarea
                value={step.description}
                onChange={(e) => {
                  if (e.target.value.length <= 200) {
                    handleStepUpdate('description', e.target.value);
                  }
                }}
                maxLength={200}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                rows={3}
                placeholder="Describe what this step represents..."
              />
              <p className="text-xs text-gray-500 mt-1">{(step.description || '').length}/200 characters</p>
            </div>

            {/* Step-Level Multi-Spin Configuration */}
            {!isProtectedStep && (
              <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                    <span>🎰</span>
                    <span>Multi-Spin Feature</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Make this step spin multiple times for richer results</p>
                </div>
                <input
                  type="checkbox"
                  checked={step.multiSpin?.enabled || false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Enabling multi-spin
                      const multiSpin = { enabled: true, mode: 'fixed', fixedCount: 3, aggregateResults: true };
                      handleStepUpdate('multiSpin', multiSpin);
                    } else {
                      // Disabling multi-spin - check if we need to remove determiner step
                      if (step.multiSpin?.mode === 'dynamic') {
                        removeDeterminerStep(stepIndex);
                      }
                      const multiSpin = { enabled: false, mode: 'fixed', fixedCount: 1, aggregateResults: true };
                      handleStepUpdate('multiSpin', multiSpin);
                    }
                  }}
                  className="w-5 h-5 text-cyan-600 bg-white/10 border-white/20 rounded focus:ring-cyan-500 focus:ring-2"
                />
              </div>

              {step.multiSpin?.enabled && (
                <div className="space-y-6 bg-cyan-950/20 rounded-lg p-4 border border-cyan-500/20">
                  {/* Mode Selection */}
                  <div>
                    <label className="block text-sm font-medium text-cyan-300 mb-2">Spin Count Mode</label>
                    <p className="text-xs text-cyan-400/80 mb-3">Choose how the number of spins is determined</p>
                    
                    <div className="space-y-3">
                      {/* Fixed Mode */}
                      <div 
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          step.multiSpin?.mode === 'fixed' 
                            ? 'border-cyan-500 bg-cyan-950/30' 
                            : 'border-cyan-800/50 bg-cyan-900/10 hover:border-cyan-600/50'
                        }`}
                        onClick={() => handleModeChange('fixed')}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`mode-${step.id}`}
                            checked={step.multiSpin?.mode === 'fixed'}
                            onChange={() => {}} // Handled by parent click
                            className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-cyan-200">🎯 Fixed Count</div>
                            <div className="text-xs text-cyan-400/70">Set a specific number of spins (2-5)</div>
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Mode */}
                      <div 
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          step.multiSpin?.mode === 'dynamic' 
                            ? 'border-cyan-500 bg-cyan-950/30' 
                            : 'border-cyan-800/50 bg-cyan-900/10 hover:border-cyan-600/50'
                        }`}
                        onClick={() => handleModeChange('dynamic')}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`mode-${step.id}`}
                            checked={step.multiSpin?.mode === 'dynamic'}
                            onChange={() => {}} // Handled by parent click
                            className="w-4 h-4 text-cyan-500 focus:ring-cyan-500"
                          />
                          <div>
                            <div className="text-sm font-medium text-cyan-200">🎲 Dynamic Count</div>
                            <div className="text-xs text-cyan-400/70">Previous step determines spin count (1-5)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fixed Count Configuration */}
                  {step.multiSpin?.mode === 'fixed' && (
                    <div>
                      <label className="block text-sm font-medium text-cyan-300 mb-2">
                        Spin Count: {step.multiSpin?.fixedCount || 3}
                      </label>
                      <input
                        type="range"
                        min="2"
                        max="5"
                        value={step.multiSpin?.fixedCount || 3}
                        onChange={(e) => handleStepUpdate('multiSpin', {
                          ...step.multiSpin,
                          mode: 'fixed',
                          fixedCount: parseInt(e.target.value),
                          aggregateResults: true // Always true
                        })}
                        className="w-full h-2 bg-cyan-900/50 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-cyan-400 mt-1">
                        <span>2 spins</span>
                        <span>5 spins</span>
                      </div>
                    </div>
                  )}

                  {/* Dynamic Count Configuration */}
                  {step.multiSpin?.mode === 'dynamic' && (
                    <div className="space-y-3">
                    
                      
                      <div className="flex items-center justify-between p-3 bg-purple-950/20 rounded-lg border border-purple-500/20">
                        <div className="flex items-center space-x-2">
                          <span>🎲</span>
                          <span className="text-sm text-purple-200">Dynamic spin count: 1-5 spins</span>
                        </div>
                        <div className="text-xs text-purple-400/70">
                          Determined by previous step result
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="text-xs text-cyan-400/70 bg-cyan-950/30 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <span>💡</span>
                      <span className="font-medium">Preview</span>
                    </div>
                    <div>
                      {step.multiSpin?.mode === 'fixed' ? (
                        <>
                          When players reach this step, the wheel will automatically spin{' '}
                          <span className="text-cyan-300 font-medium">
                            {step.multiSpin?.fixedCount || 3} times
                          </span>
                          {' '}and all results will be woven into the story for complex, detailed narratives.
                        </>
                      ) : (
                        <>
                          When players reach the determiner step, they&apos;ll spin once to get a number (1-5). 
                          Then this step will automatically spin{' '}
                          <span className="text-purple-300 font-medium">that many times</span>
                          {' '}for dynamic, unpredictable storytelling experiences.
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              </div>
            )}

          </div>
        )}

        {activeTab === 'segments' && (
          <div className="h-full flex flex-col">
            {isProtectedStep ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <span className="text-6xl mb-4 block text-orange-400">🔒</span>
                  <h3 className="text-xl font-medium text-orange-200 mb-3">Protected System Segments</h3>
                  <p className="text-orange-400/80 leading-relaxed">
                    This determiner step contains fixed segments (1-5 spins) that cannot be modified.
                    These are required for proper dynamic multi-spin functionality.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white">Wheel Options</h4>
                    {(() => {
                      const currentCount = step.wheelConfig.segments.length;
                      const optionsCheck = checkWheelOptions(currentCount);
                      const percentage = optionsCheck.usagePercentage;
                      return percentage >= 80 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {currentCount}/{optionsCheck.limit} options used
                        </p>
                      );
                    })()}
                  </div>
                  <button
                    onClick={handleAddSegment}
                    disabled={(() => {
                      const optionsCheck = checkWheelOptions(step.wheelConfig.segments.length);
                      return !optionsCheck.canUse;
                    })()}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                      (() => {
                        const optionsCheck = checkWheelOptions(step.wheelConfig.segments.length);
                        return !optionsCheck.canUse
                          ? 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-400'
                          : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600';
                      })()
                    }`}
                    title={(() => {
                      const optionsCheck = checkWheelOptions(step.wheelConfig.segments.length);
                      if (!optionsCheck.canUse) {
                        return optionsCheck.isPro 
                          ? `PRO limit reached: ${optionsCheck.currentUsage}/${optionsCheck.limit} wheel options used`
                          : 'Upgrade to PRO to add more options';
                      }
                      return 'Add a new wheel option';
                    })()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Option</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{maxHeight: 'calc(100vh - 350px)'}}>
                  {step.wheelConfig.segments.map((segment) => (
                    <SegmentEditor
                      key={segment.id}
                      segment={segment}
                      onUpdate={(field, value) => handleSegmentUpdate(segment.id, field, value)}
                      onRemove={() => removeSegment(stepIndex, segment.id)}
                      canRemove={step.wheelConfig.segments.length > 2}
                      isProtected={isProtectedStep}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="h-full overflow-y-auto pr-2" style={{maxHeight: 'calc(100vh - 350px)'}}>
            {isProtectedStep ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <span className="text-6xl mb-4 block text-orange-400">🔒</span>
                  <h3 className="text-xl font-medium text-orange-200 mb-3">Protected System Connections</h3>
                  <p className="text-orange-400/80 leading-relaxed">
                    This determiner step has automatic connections to its target multi-spin step.
                    These connections are managed by the system and cannot be modified.
                  </p>
                </div>
              </div>
            ) : (
              <BranchEditor
                stepIndex={stepIndex}
                branches={step.branches}
                onUpdate={handleBranchesUpdate}
              />
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeFlow
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerFeature="options"
      />
    </div>
  );
};

interface SegmentEditorProps {
  segment: WheelSegmentBuilder;
  onUpdate: (field: string, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
  isProtected?: boolean;
}

const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segment,
  onUpdate,
  onRemove,
  canRemove,
  isProtected = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10">
      {/* Segment Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20"
              style={{ backgroundColor: segment.color }}
            />
            <div>
              <h5 className="font-medium text-white flex items-center space-x-2">
                <span>{segment.text}</span>
              </h5>
              <p className="text-xs text-gray-400">Weight: {segment.weight}%</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded"
                title="Remove Option"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Option Text
              </label>
              <input
                type="text"
                value={segment.text}
                onChange={(e) => {
                  if (e.target.value.length <= 40) {
                    onUpdate('text', e.target.value);
                  }
                }}
                maxLength={40}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter option text..."
              />
              <p className="text-xs text-gray-500 mt-1">{segment.text.length}/40 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={segment.color}
                  onChange={(e) => onUpdate('color', e.target.value)}
                  className="w-12 h-12 bg-white/10 border border-white/20 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={segment.color}
                  onChange={(e) => onUpdate('color', e.target.value)}
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="#4682B4"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Probability Weight: {segment.weight}%
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={segment.weight}
              onChange={(e) => onUpdate('weight', parseInt(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {segment.description !== undefined && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={segment.description || ''}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                rows={2}
                placeholder="Describe this choice..."
              />
            </div>
          )}


        </div>
      )}
    </div>
  );
};
