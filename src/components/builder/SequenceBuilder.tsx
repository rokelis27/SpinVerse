'use client';

import { useState, useEffect, useRef } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { StepEditor } from './StepEditor';
import { SequencePreview } from './SequencePreview';
import { NarrativeTemplateEditor } from './NarrativeTemplateEditor';
import { UserSequence, SequenceStepBuilder } from '@/types/builder';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';

interface SequenceBuilderProps {
  onClose: () => void;
}

export const SequenceBuilder: React.FC<SequenceBuilderProps> = ({ onClose }) => {
  const {
    currentSequence,
    selectedStepIndex,
    isDirty,
    isPreviewMode,
    createNewSequence,
    updateSequenceName,
    updateSequenceDescription,
    addStep,
    removeStep,
    setSelectedStep,
    togglePreviewMode,
    validateSequence,
    saveSequence,
    loadSequence,
    reset
  } = useBuilderStore();

  const { checkSequenceSteps, checkSavedSequences } = useFeatureGate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileTab, setMobileTab] = useState<'steps' | 'editor' | 'narrative'>('steps');

  // Initialize with new sequence only if none exists on mount
  useEffect(() => {
    if (!currentSequence) {
      createNewSequence();
    }
  }, []); // Empty dependency array - only run on mount

  const handleSave = () => {
    const validation = validateSequence();
    if (!validation.isValid) {
      alert(`Please fix ${validation.errors.length} error(s) before saving.`);
      return;
    }

    // Check if this is a new sequence (not an update) 
    // Use the same localStorage key that builderStore uses
    const saved = JSON.parse(localStorage.getItem('spinverse-custom-sequences') || '[]');
    const isNewSequence = !saved.find((s: UserSequence) => s.id === currentSequence?.id);
    
    if (isNewSequence) {
      const sequenceCheck = checkSavedSequences();
      if (!sequenceCheck.canUse) {
        if (sequenceCheck.isPro) {
          alert(sequenceCheck.upgradeMessage);
        } else {
          setShowUpgradeModal(true);
        }
        return;
      }
    }

    const result = saveSequence();
    if (result?.success) {
      alert('Sequence saved successfully!');
    } else if (result?.isLimitError) {
      setShowUpgradeModal(true);
    } else {
      alert('Failed to save sequence. Please try again.');
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const shouldSave = confirm('You have unsaved changes. Save before closing?');
      if (shouldSave) {
        const validation = validateSequence();
        if (validation.isValid) {
          // Check if this is a new sequence (not an update)
          const saved = JSON.parse(localStorage.getItem('spinverse-custom-sequences') || '[]');
          const isNewSequence = !saved.find((s: UserSequence) => s.id === currentSequence?.id);
          
          if (isNewSequence) {
            const sequenceCheck = checkSavedSequences();
            if (!sequenceCheck.canUse) {
              if (sequenceCheck.isPro) {
                alert(sequenceCheck.upgradeMessage);
              } else {
                setShowUpgradeModal(true);
              }
              return; // Don't close yet, let user decide
            }
          }

          const result = saveSequence();
          if (result?.isLimitError) {
            setShowUpgradeModal(true);
            return; // Don't close yet, let user decide
          }
        }
      }
    }
    reset(); // Reset the store when actually closing
    onClose();
  };

  const handleAddStep = () => {
    if (!currentSequence) return;

    // Check step limits using the feature gate (works for both FREE and PRO users)
    const currentStepCount = currentSequence.steps.length;
    const stepCheck = checkSequenceSteps(currentStepCount);
    
    if (!stepCheck.canUse) {
      if (stepCheck.isPro) {
        // PRO user at limit - do nothing, button should be disabled
        return;
      } else {
        setShowUpgradeModal(true);
        return;
      }
    }

    addStep();
  };

  const handleImportSequence = () => {
    if (isDirty) {
      const shouldProceed = confirm('You have unsaved changes. They will be lost if you import. Continue?');
      if (!shouldProceed) return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate that it's a UserSequence
        if (validateImportedSequence(jsonData)) {
          // Generate new ID to avoid conflicts
          const importedSequence: UserSequence = {
            ...jsonData,
            id: `custom-${Date.now()}`,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            isCustom: true
          };
          
          loadSequence(importedSequence);
          alert('Sequence imported successfully!');
        } else {
          alert('Invalid sequence file. Please check the JSON format.');
        }
      } catch (error) {
        alert('Failed to parse JSON file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateImportedSequence = (data: any): data is UserSequence => {
    return (
      data &&
      typeof data.name === 'string' &&
      typeof data.description === 'string' &&
      Array.isArray(data.steps) &&
      data.steps.length > 0 &&
      data.steps.every((step: any) => 
        step.id && step.title && step.wheelConfig && Array.isArray(step.wheelConfig.segments)
      )
    );
  };

  const handleExportSequence = () => {
    if (!currentSequence) return;
    
    const dataStr = JSON.stringify(currentSequence, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentSequence.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!currentSequence) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden pb-32">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {/* Header */}
      <div className="glass-panel border-b border-white/20">
        {/* Mobile Header */}
        <div className="sm:hidden mobile-padding-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleClose}
              className="p-2 glass-panel rounded-lg hover:bg-white/20 transition-colors btn-touch"
              title="Close Builder"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h2 className="text-lg font-bold text-white">Builder Mode</h2>
              {isDirty && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 mt-1">
                  Unsaved
                </span>
              )}
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl btn-touch text-sm"
            >
              Save
            </button>
          </div>

          {/* Mobile sequence name/description */}
          <div className="space-y-3 mb-4">
            <input
              type="text"
              value={currentSequence.name}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  updateSequenceName(e.target.value);
                }
              }}
              maxLength={50}
              className="w-full text-lg font-bold bg-transparent text-white border border-white/20 rounded-lg px-3 py-2 focus:border-cyan-500 focus:bg-white/10"
              placeholder="Sequence Name"
              title={`${currentSequence.name.length}/50 characters`}
            />
            <input
              type="text"
              value={currentSequence.description}
              onChange={(e) => {
                if (e.target.value.length <= 100) {
                  updateSequenceDescription(e.target.value);
                }
              }}
              maxLength={100}
              className="w-full text-sm text-gray-300 bg-transparent border border-white/20 rounded-lg px-3 py-2 focus:border-cyan-500 focus:bg-white/10"
              placeholder="Description"
              title={`${currentSequence.description.length}/100 characters`}
            />
          </div>

          {/* Mobile action buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleImportSequence}
              className="flex-1 min-w-0 px-3 py-2 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 btn-touch"
              title="Import Sequence"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <span className="text-xs">Import</span>
            </button>

            <button
              onClick={handleExportSequence}
              className="flex-1 min-w-0 px-3 py-2 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center justify-center space-x-1 btn-touch"
              title="Export Sequence"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="text-xs">Export</span>
            </button>

            <button
              onClick={togglePreviewMode}
              className={`flex-1 min-w-0 px-3 py-2 rounded-lg transition-all duration-300 btn-touch text-sm ${
                isPreviewMode
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'glass-panel text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
          </div>

          {/* Usage indicator for mobile */}
          {(() => {
            const sequenceCheck = checkSavedSequences();
            return sequenceCheck.usagePercentage >= 80 && (
              <div className="mt-3 p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-purple-300 font-medium">
                    {sequenceCheck.currentUsage}/{sequenceCheck.limit} saves used
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="p-2 glass-panel rounded-lg hover:bg-white/20 transition-colors"
                title="Close Builder"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex flex-col">
                <input
                  type="text"
                  value={currentSequence.name}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      updateSequenceName(e.target.value);
                    }
                  }}
                  maxLength={50}
                  className="text-2xl font-bold bg-transparent text-white border-none outline-none focus:bg-white/10 rounded px-2 py-1"
                  placeholder="Sequence Name"
                  title={`${currentSequence.name.length}/50 characters`}
                />
                <input
                  type="text"
                  value={currentSequence.description}
                  onChange={(e) => {
                    if (e.target.value.length <= 100) {
                      updateSequenceDescription(e.target.value);
                    }
                  }}
                  maxLength={100}
                  className="text-sm text-gray-300 bg-transparent border-none outline-none focus:bg-white/10 rounded px-2 py-1 mt-1"
                  placeholder="Description"
                  title={`${currentSequence.description.length}/100 characters`}
                />
              </div>

              {isDirty && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  Unsaved
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleImportSequence}
                className="px-4 py-2 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center space-x-2"
                title="Import Sequence"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <span>Import</span>
              </button>

              <button
                onClick={handleExportSequence}
                className="px-4 py-2 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 flex items-center space-x-2"
                title="Export Sequence"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span>Export</span>
              </button>

              <button
                onClick={togglePreviewMode}
                className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                  isPreviewMode
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'glass-panel text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                {isPreviewMode ? 'Exit Preview' : 'Preview'}
              </button>
              
              <div className="flex items-center space-x-3">
                {(() => {
                  const sequenceCheck = checkSavedSequences();
                  return sequenceCheck.usagePercentage >= 80 && (
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs text-purple-300 font-medium">
                        {sequenceCheck.currentUsage}/{sequenceCheck.limit} saves used
                      </span>
                    </div>
                  );
                })()}
                
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Save Sequence
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isPreviewMode ? (
        <SequencePreview sequence={currentSequence} />
      ) : (
        <>
          {/* Desktop Layout */}
          <div className="hidden lg:block max-w-7xl mx-auto p-6">
            {/* Story Settings */}
            <div className="mb-6">
              <NarrativeTemplateEditor />
            </div>
            
            <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
              {/* Step List */}
              <div className="lg:col-span-3">
                <div className="glass-panel h-full rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Steps</h3>
                      {(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        return stepCheck.usagePercentage > 70 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {stepCheck.currentUsage}/{stepCheck.limit} steps used
                          </p>
                        );
                      })()}
                    </div>
                    <button
                      onClick={handleAddStep}
                      disabled={(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        return currentSequence.steps[selectedStepIndex]?.isDeterminer || !stepCheck.canUse;
                      })()}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        (() => {
                          const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                          const isDisabled = currentSequence.steps[selectedStepIndex]?.isDeterminer || !stepCheck.canUse;
                          return isDisabled
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600';
                        })()
                      }`}
                      title={(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        if (currentSequence.steps[selectedStepIndex]?.isDeterminer) {
                          return 'Cannot add steps after determiner steps - they must flow directly to their target step';
                        }
                        if (!stepCheck.canUse) {
                          return stepCheck.isPro 
                            ? `PRO limit reached: ${stepCheck.currentUsage}/${stepCheck.limit} steps used`
                            : 'Upgrade to PRO to add more steps';
                        }
                        return `Add Step After "${currentSequence.steps[selectedStepIndex]?.title || 'Current Step'}"`;
                      })()}
                    >
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Step limit warning */}
                  {(() => {
                    const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                    return stepCheck.usagePercentage >= 80 && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm font-medium text-purple-300">
                            {stepCheck.currentUsage}/{stepCheck.limit} Steps Used
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{stepCheck.upgradeMessage}</p>
                        {!stepCheck.isPro && (
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs rounded font-medium transition-all duration-200"
                          >
                            Upgrade to PRO
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-400px)]">
                    {currentSequence.steps.map((step, index) => (
                      <div key={step.id}>
                        <div
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                            step.isDeterminer
                              ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30'
                              : index === selectedStepIndex
                                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                                : 'bg-white/5 hover:bg-white/10'
                          }`}
                          onClick={() => setSelectedStep(index)}
                        >
                          <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                              {step.isDeterminer && (
                                <span className="text-orange-400 text-xs">🔒</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-gray-400">
                                {step.wheelConfig.segments.length} options
                              </p>
                              {step.isDeterminer && (
                                <span className="text-xs text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded border border-orange-500/30">
                                  SYSTEM
                                </span>
                              )}
                              {step.branches && step.branches.length > 0 && (
                                <span className="ml-2 text-emerald-400">• {step.branches.length} branch{step.branches.length !== 1 ? 'es' : ''}</span>
                              )}
                            </div>
                            
                            {/* Connection indicators */}
                            {step.branches && step.branches.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {step.branches.map((branch, branchIndex) => {
                                  const targetStep = currentSequence.steps.find(s => s.id === branch.nextStepId);
                                  return (
                                    <span
                                      key={branchIndex}
                                      className="inline-flex items-center px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                      title={`Goes to: ${targetStep?.title || 'Unknown'}`}
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                                      </svg>
                                      {targetStep?.title?.substring(0, 8) || 'Unknown'}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            
                            {step.defaultNextStep && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5" />
                                  </svg>
                                  Default: {currentSequence.steps.find(s => s.id === step.defaultNextStep)?.title?.substring(0, 8) || 'Unknown'}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {currentSequence.steps.length > 1 && !step.isDeterminer && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeStep(index);
                              }}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded ml-2"
                              title="Remove Step"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                          
                          {/* Show protected step indicator instead of delete button */}
                          {step.isDeterminer && (
                            <div 
                              className="p-1 text-orange-400 rounded ml-2" 
                              title="Protected system step - disable dynamic mode on target step to remove"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          )}
                          </div>
                        </div>
                        
                        {/* Visual indicator showing where new step would be inserted */}
                        {index === selectedStepIndex && !step.isDeterminer && (
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              <span>New step will be added here</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Show protection message for determiner steps */}
                        {index === selectedStepIndex && step.isDeterminer && (
                          <div className="flex items-center justify-center py-2">
                            <div className="flex items-center text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Protected step - flows directly to target multi-spin step</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step Editor */}
              <div className="lg:col-span-9">
                <div className="glass-panel h-full rounded-2xl p-6">
                  <StepEditor
                    step={currentSequence.steps[selectedStepIndex] as SequenceStepBuilder}
                    stepIndex={selectedStepIndex}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="lg:hidden h-screen flex flex-col">
            {/* Mobile Tab Navigation */}
            <div className="glass-panel border-b border-white/20">
              <div className="flex">
                <button
                  onClick={() => setMobileTab('steps')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    mobileTab === 'steps'
                      ? 'bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-500'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Steps</span>
                    <span className="bg-cyan-500/30 text-cyan-300 text-xs px-2 py-0.5 rounded-full">
                      {currentSequence.steps.length}
                    </span>
                  </div>
                </button>
                
                <button
                  onClick={() => setMobileTab('editor')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    mobileTab === 'editor'
                      ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Editor</span>
                  </div>
                </button>
                
                <button
                  onClick={() => setMobileTab('narrative')}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    mobileTab === 'narrative'
                      ? 'bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-500'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>Story</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Tab Content */}
            <div className="flex-1 overflow-hidden">
              {mobileTab === 'steps' && (
                <div className="h-full mobile-padding">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Sequence Steps</h3>
                      {(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        return stepCheck.usagePercentage > 70 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {stepCheck.currentUsage}/{stepCheck.limit} steps used
                          </p>
                        );
                      })()}
                    </div>
                    
                    <button
                      onClick={handleAddStep}
                      disabled={(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        return currentSequence.steps[selectedStepIndex]?.isDeterminer || !stepCheck.canUse;
                      })()}
                      className={`p-2 rounded-lg transition-all duration-300 btn-touch ${
                        (() => {
                          const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                          const isDisabled = currentSequence.steps[selectedStepIndex]?.isDeterminer || !stepCheck.canUse;
                          return isDisabled
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600';
                        })()
                      }`}
                      title={(() => {
                        const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                        if (currentSequence.steps[selectedStepIndex]?.isDeterminer) {
                          return 'Cannot add steps after determiner steps';
                        }
                        if (!stepCheck.canUse) {
                          return stepCheck.isPro 
                            ? `PRO limit reached: ${stepCheck.currentUsage}/${stepCheck.limit} steps`
                            : 'Upgrade to PRO to add more steps';
                        }
                        return 'Add New Step';
                      })()}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  {/* Step limit warning for mobile */}
                  {(() => {
                    const stepCheck = checkSequenceSteps(currentSequence.steps.length);
                    return stepCheck.usagePercentage >= 80 && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="text-sm font-medium text-purple-300">
                            {stepCheck.currentUsage}/{stepCheck.limit} Steps Used
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{stepCheck.upgradeMessage}</p>
                        {!stepCheck.isPro && (
                          <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs rounded font-medium transition-all duration-200 btn-touch"
                          >
                            Upgrade to PRO
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                    {currentSequence.steps.map((step, index) => (
                      <div key={step.id}>
                        <div
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                            step.isDeterminer
                              ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30'
                              : index === selectedStepIndex
                                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                                : 'bg-white/5 active:bg-white/10'
                          }`}
                          onClick={() => {
                            setSelectedStep(index);
                            setMobileTab('editor'); // Auto-switch to editor on mobile
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-semibold text-white text-sm truncate">{step.title}</h4>
                                {step.isDeterminer && (
                                  <span className="text-orange-400 text-xs">🔒</span>
                                )}
                                {index === selectedStepIndex && (
                                  <span className="text-cyan-400 text-xs">✓</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-400">
                                  {step.wheelConfig.segments.length} options
                                </p>
                                {step.branches && step.branches.length > 0 && (
                                  <span className="text-xs text-emerald-400">• {step.branches.length} branch{step.branches.length !== 1 ? 'es' : ''}</span>
                                )}
                              </div>
                            </div>
                            
                            {currentSequence.steps.length > 1 && !step.isDeterminer && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeStep(index);
                                }}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded ml-2 btn-touch"
                                title="Remove Step"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {mobileTab === 'editor' && (
                <div className="h-full">
                  <div className="glass-panel-mobile h-full">
                    <StepEditor
                      step={currentSequence.steps[selectedStepIndex] as SequenceStepBuilder}
                      stepIndex={selectedStepIndex}
                    />
                  </div>
                </div>
              )}

              {mobileTab === 'narrative' && (
                <div className="h-full mobile-padding">
                  <NarrativeTemplateEditor />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Upgrade Modal */}
      <UpgradeFlow
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerFeature="sequences"
      />
    </div>
  );
};