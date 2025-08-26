'use client';

import { useState, useEffect } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { StepEditor } from './StepEditor';
import { SequencePreview } from './SequencePreview';
import { NarrativeTemplateEditor } from './NarrativeTemplateEditor';

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
    reset
  } = useBuilderStore();

  // Initialize with new sequence only if none exists on mount
  useEffect(() => {
    if (!currentSequence) {
      createNewSequence();
    }
  }, []); // Empty dependency array - only run on mount

  const handleSave = () => {
    const validation = validateSequence();
    if (validation.isValid) {
      saveSequence();
      alert('Sequence saved successfully!');
    } else {
      alert(`Please fix ${validation.errors.length} error(s) before saving.`);
    }
  };

  const handleClose = () => {
    if (isDirty) {
      const shouldSave = confirm('You have unsaved changes. Save before closing?');
      if (shouldSave) {
        const validation = validateSequence();
        if (validation.isValid) {
          saveSequence();
        }
      }
    }
    reset(); // Reset the store when actually closing
    onClose();
  };

  if (!currentSequence) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="glass-panel border-b border-white/20 p-4">
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
              onClick={togglePreviewMode}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                isPreviewMode
                  ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25'
                  : 'glass-panel text-gray-300 hover:text-white hover:bg-white/20'
              }`}
            >
              {isPreviewMode ? 'Exit Preview' : 'Preview'}
            </button>
            
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Save Sequence
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {isPreviewMode ? (
        <SequencePreview sequence={currentSequence} />
      ) : (
        <div className="max-w-7xl mx-auto p-6">
          {/* Story Settings */}
          <div className="mb-6">
            <NarrativeTemplateEditor />
          </div>
          
          <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Step List */}
            <div className="lg:col-span-3">
              <div className="glass-panel h-full rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Steps</h3>
                  <button
                    onClick={addStep}
                    className="p-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300"
                    title="Add Step"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                  {currentSequence.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        index === selectedStepIndex
                          ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30'
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => setSelectedStep(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white text-sm">{step.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {step.wheelConfig.segments.length} options
                            {step.branches && step.branches.length > 0 && (
                              <span className="ml-2 text-emerald-400">• {step.branches.length} branch{step.branches.length !== 1 ? 'es' : ''}</span>
                            )}
                          </p>
                          
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
                        
                        {currentSequence.steps.length > 1 && (
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step Editor */}
            <div className="lg:col-span-9">
              <div className="glass-panel h-full rounded-2xl p-6">
                <StepEditor
                  step={currentSequence.steps[selectedStepIndex]}
                  stepIndex={selectedStepIndex}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};