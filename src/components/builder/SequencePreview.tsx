'use client';

import { useState, useEffect } from 'react';
import { UserSequence } from '@/types/builder';
import { SequenceController } from '@/components/sequence/SequenceController';
import { useSequenceStore } from '@/stores/sequenceStore';
import { StoryGenerator } from './StoryGenerator';

interface SequencePreviewProps {
  sequence: UserSequence;
}

export const SequencePreview: React.FC<SequencePreviewProps> = ({ sequence }) => {
  const { startSequence, resetSequence } = useSequenceStore();
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    return () => {
      resetSequence();
    };
  }, [resetSequence]);

  const handleStart = () => {
    // Convert UserSequence to SequenceTheme format for the existing system
    const themeForPreview = {
      id: sequence.id,
      name: sequence.name,
      description: sequence.description,
      color: sequence.color,
      startStepId: sequence.startStepId,
      steps: sequence.steps.map(step => ({
        id: step.id,
        title: step.title,
        description: step.description,
        branches: step.branches,
        defaultNextStep: step.defaultNextStep,
        multiSpin: step.multiSpin, // Transfer multi-spin configuration
        wheelConfig: {
          ...step.wheelConfig,
          segments: step.wheelConfig.segments.map(segment => ({
            id: segment.id,
            text: segment.text,
            color: segment.color,
            rarity: segment.rarity || 'common',
            weight: segment.weight
          }))
        }
      })),
      narrativeTemplate: sequence.narrativeTemplate || "You completed your custom journey!",
      narrativeTemplates: sequence.narrativeTemplates || {}
    };

    startSequence(themeForPreview);
    setIsStarted(true);
  };

  const handleReset = () => {
    resetSequence();
    setIsStarted(false);
  };

  if (!isStarted) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="glass-panel rounded-2xl p-8 max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Preview Your Journey
            </h2>
            <p className="text-gray-300 mb-6">
              Test your custom sequence to see how it flows
            </p>
            
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-300">Name:</span>
                <span className="text-white font-medium">{sequence.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-gray-300">Steps:</span>
                <span className="text-white font-medium">{sequence.steps.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-300">Total Options:</span>
                <span className="text-white font-medium">
                  {sequence.steps.reduce((total, step) => total + step.wheelConfig.segments.length, 0)}
                </span>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Preview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 text-center">
        <button
          onClick={handleReset}
          className="px-4 py-2 glass-panel rounded-lg text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 inline-flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Reset Preview</span>
        </button>
      </div>

      <SequenceController onBackToHome={handleReset} />
      
      {/* Story Generation */}
      <StoryGenerator sequence={sequence} />
    </div>
  );
};