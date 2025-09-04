'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';
import { SequenceStepBuilder } from '@/types/builder';
import { StepEnhancementNotification } from './StepEnhancementNotification';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';

interface EnhanceStepButtonProps {
  step: SequenceStepBuilder;
  stepIndex: number;
}

export const EnhanceStepButton: React.FC<EnhanceStepButtonProps> = ({ step, stepIndex }) => {
  const { currentSequence, updateStep } = useBuilderStore();
  const { checkStepsAiEnhancer, checkWheelOptions, isPro } = useFeatureGate();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [enhancementType, setEnhancementType] = useState<'options' | 'narrative' | 'mixed'>('mixed');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({ stepTitle: '', addedOptions: 0 });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  if (!currentSequence) return null;

  // Check if enhancement is possible
  const wheelOptionsCheck = checkWheelOptions(step?.wheelConfig?.segments?.length || 0);
  const canEnhance = step && 
    step.wheelConfig && 
    step.wheelConfig.segments && 
    step.wheelConfig.segments.length > 0 && 
    step.wheelConfig.segments.length <= wheelOptionsCheck.limit && 
    step.title && 
    step.title.trim().length > 0;

  const handleEnhance = async () => {
    setShowOptions(false);
    
    // Check if user can use Steps AI Enhancer (PRO-only feature)
    const enhancerCheck = checkStepsAiEnhancer();
    if (!enhancerCheck.canUse) {
      setShowUpgradeModal(true);
      return;
    }
    
    // Input validation before starting
    if (!step || !step.wheelConfig || !step.wheelConfig.segments || step.wheelConfig.segments.length === 0) {
      alert('Cannot enhance: Step has no options to improve.');
      return;
    }
    
    const optionsCheck = checkWheelOptions(step.wheelConfig.segments.length);
    if (step.wheelConfig.segments.length > optionsCheck.limit) {
      alert(`Cannot enhance: Step has too many options (maximum ${optionsCheck.limit} supported).`);
      return;
    }
    
    if (!step.title || step.title.trim().length === 0) {
      alert('Cannot enhance: Step must have a title.');
      return;
    }
    
    setIsEnhancing(true);

    try {
      // Build context from sequence and previous steps
      const previousSteps = currentSequence.steps.slice(0, stepIndex).map(s => ({
        title: s.title,
        options: s.wheelConfig.segments.map(seg => seg.text)
      }));

      const sequenceContext = {
        name: currentSequence.name,
        description: currentSequence.description,
        theme: `${currentSequence.name} - ${currentSequence.description}`,
        previousSteps
      };

      console.log('🚀 Enhancing step:', { 
        stepTitle: step.title, 
        context: sequenceContext, 
        enhancementType 
      });

      const response = await fetch('/api/enhance-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step,
          sequenceContext,
          enhancementType,
          preserveExisting: true,
          userMode: isPro ? 'account' : 'anonymous'
        }),
      });

      console.log('📥 Response received:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Step enhancement successful:', data);
      
      const { enhancedStep, enhancementSummary } = data;

      // Update the step in the store
      updateStep(stepIndex, enhancedStep);

      // Show success notification
      setNotificationData({
        stepTitle: enhancedStep.title,
        addedOptions: enhancementSummary.addedOptions
      });
      setShowNotification(true);

    } catch (error: any) {
      console.error('❌ Step enhancement failed:', error);
      
      // Better error handling with user-friendly messages
      let errorMessage = 'Step enhancement failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('taking too long')) {
          errorMessage = 'Enhancement is taking too long. The AI service might be busy - please try again.';
        } else if (error.message.includes('overloaded') || error.message.includes('busy')) {
          errorMessage = 'AI service is currently busy. Please wait a moment and try again.';
        } else if (error.message.includes('temporarily unavailable')) {
          errorMessage = 'AI service is temporarily unavailable. Please try again in a few minutes.';
        } else if (error.message.includes('validation')) {
          errorMessage = 'AI generated an invalid enhancement. Please try again with different options.';
        } else if (error.message.includes('invalid response')) {
          errorMessage = 'AI response was unclear. Please try again.';
        } else {
          // Use the server's user-friendly message if available
          errorMessage = error.message;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <>
      <StepEnhancementNotification
        isVisible={showNotification}
        stepTitle={notificationData.stepTitle}
        addedOptions={notificationData.addedOptions}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="relative">
      <button
        onClick={() => setShowOptions(true)}
        disabled={isEnhancing || !canEnhance}
        className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-300 flex items-center space-x-1.5 ${
          isEnhancing || !canEnhance
            ? 'bg-gray-500 cursor-not-allowed text-gray-300'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg'
        }`}
        title={
          !canEnhance 
            ? 'Enhancement not available (step needs title and 1-20 options)'
            : isEnhancing 
              ? 'Enhancing step...'
              : 'AI-Enhance this step'
        }
      >
        {isEnhancing ? (
          <>
            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>✨ Enhance</span>
          </>
        )}
      </button>

      {/* Enhancement Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-xl p-5 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Enhance Step</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-sm text-gray-300 mb-4">
                <strong>&quot;{step.title}&quot;</strong>
                <br />
                <span className="text-xs text-gray-400">
                  Current: {step.wheelConfig.segments.length} options
                </span>
              </div>

              {/* Enhancement Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enhancement Focus
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'options', label: 'More Options', desc: 'Add 2-4 new choices' },
                    { value: 'narrative', label: 'Better Descriptions', desc: 'Improve titles & text' },
                    { value: 'mixed', label: 'Mixed Enhancement', desc: 'Options + descriptions' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-center space-x-2 p-2 rounded hover:bg-white/5 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="enhancementType"
                        value={type.value}
                        checked={enhancementType === type.value}
                        onChange={(e) => setEnhancementType(e.target.value as any)}
                        className="text-purple-500 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white text-sm font-medium">{type.label}</div>
                        <div className="text-xs text-gray-400">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Context Info */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-blue-300 font-medium">Smart Context</p>
                    <p className="text-xs text-blue-200">
                      SpinVerse will consider &quot;{currentSequence.name}&quot; theme and previous {stepIndex} steps for contextual improvements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowOptions(false)}
                  className="flex-1 px-3 py-2 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnhance}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm"
                >
                  Enhance Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      <UpgradeFlow
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerFeature="steps"
      />
      </div>
    </>
  );
};