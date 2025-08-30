'use client';

import { useState, useCallback } from 'react';
import { useAnonymousStore } from '@/stores/anonymousStore';
import { useUserStore } from '@/stores/userStore';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { SequenceResult } from '@/types/sequence';

interface AIStoryGeneratorProps {
  results: SequenceResult[];
  themeName: string;
  themeId?: string;
  isCustomSequence?: boolean;
  sequenceDescription?: string;
  onStoryGenerated?: (story: any) => void;
  className?: string;
}

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  story: string | null;
  characterArchetype: string | null;
  rarityScore?: number;
  rarityTier?: string;
  usageInfo?: any;
}

export function AIStoryGenerator({
  results,
  themeName,
  themeId,
  isCustomSequence = false,
  sequenceDescription,
  onStoryGenerated,
  className = ''
}: AIStoryGeneratorProps) {
  const anonymousStore = useAnonymousStore();
  const userStore = useUserStore();
  const { checkAiGeneration, isPro } = useFeatureGate();
  
  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    story: null,
    characterArchetype: null,
  });
  
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check AI generation limits
  const aiGenerationCheck = checkAiGeneration();

  const generateStory = useCallback(async () => {
    // Check if user can generate AI story
    if (!aiGenerationCheck.canUse) {
      if (aiGenerationCheck.isPro) {
        // PRO user at limit - do nothing, button should be disabled
        return;
      } else {
        setShowUpgradeModal(true);
        return;
      }
    }

    setGenerationState(prev => ({
      ...prev,
      isGenerating: true,
      error: null
    }));

    try {
      // Try to increment AI generation count in the appropriate store
      let canGenerate = false;
      if (isPro) {
        // PRO users: increment userStore
        canGenerate = userStore.incrementAiGeneration();
      } else {
        // FREE users: increment anonymousStore
        canGenerate = anonymousStore.tryIncrementAiGeneration();
      }
      
      if (!canGenerate) {
        throw new Error('Daily AI generation limit reached');
      }

      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results,
          themeName,
          themeId,
          isCustomSequence,
          sequenceDescription,
          userMode: isPro ? 'pro' : 'anonymous'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 429) {
          // Rate limit exceeded
          throw new Error(errorData.message || 'Daily AI story generation limit reached');
        }
        
        throw new Error(errorData.message || 'Failed to generate story');
      }

      const storyData = await response.json();

      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        story: storyData.story,
        characterArchetype: storyData.characterArchetype,
        rarityScore: storyData.rarityScore,
        rarityTier: storyData.rarityTier,
        usageInfo: storyData.usageInfo
      }));

      // Call callback with generated story
      if (onStoryGenerated) {
        onStoryGenerated(storyData);
      }

    } catch (error: any) {
      console.error('Story generation error:', error);
      
      setGenerationState(prev => ({
        ...prev,
        isGenerating: false,
        error: error.message || 'Failed to generate story'
      }));

      // If it's a limit error, show upgrade modal only for non-PRO users
      if (error.message.includes('limit') || error.message.includes('Upgrade')) {
        if (!aiGenerationCheck.isPro) {
          setShowUpgradeModal(true);
        }
      }
    }
  }, [results, themeName, themeId, isCustomSequence, sequenceDescription, aiGenerationCheck.canUse, anonymousStore, onStoryGenerated]);

  const handleRetry = useCallback(() => {
    setGenerationState(prev => ({
      ...prev,
      error: null
    }));
    generateStory();
  }, [generateStory]);

  return (
    <FeatureErrorBoundary feature="AI Story Generator">
      <div className={`space-y-4 ${className}`}>
        {/* Usage Status */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <div>
              <p className="text-sm font-medium text-white">AI Story Generation</p>
              <p className="text-xs text-gray-400">
                {aiGenerationCheck.currentUsage}/{aiGenerationCheck.limit || '∞'} used today
                {aiGenerationCheck.limit && ` • ${aiGenerationCheck.remainingUses} remaining`}
              </p>
            </div>
          </div>

          {/* Usage Bar */}
          {aiGenerationCheck.limit && (
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, aiGenerationCheck.usagePercentage)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">
                {Math.round(aiGenerationCheck.usagePercentage)}%
              </span>
            </div>
          )}
        </div>

        {/* Generation Button or Story Display */}
        {!generationState.story ? (
          <div className="space-y-3">
            <button
              onClick={generateStory}
              disabled={generationState.isGenerating || !aiGenerationCheck.canUse}
              className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                !aiGenerationCheck.canUse
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-600'
                  : generationState.isGenerating
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {generationState.isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Your Story...</span>
                </>
              ) : !aiGenerationCheck.canUse ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Daily Limit Reached</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Generate AI Story</span>
                </>
              )}
            </button>

            {!aiGenerationCheck.canUse && (
              <div className="p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">{aiGenerationCheck.upgradeMessage}</p>
                {!aiGenerationCheck.isPro && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm rounded-lg font-medium transition-all duration-200"
                  >
                    Upgrade to PRO
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Story Content */}
            <div className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Your AI-Generated Story</h3>
                
                {generationState.rarityTier && (
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      generationState.rarityTier === 'Ultra Legendary' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                      generationState.rarityTier === 'Legendary' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      generationState.rarityTier === 'Very Rare' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                      generationState.rarityTier === 'Rare' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                      generationState.rarityTier === 'Uncommon' ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {generationState.rarityTier}
                    </div>
                    
                    {generationState.rarityScore && (
                      <div className="text-sm text-gray-400">
                        {generationState.rarityScore}/100
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {generationState.story}
                </div>
                
                {generationState.characterArchetype && (
                  <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border-l-4 border-purple-500">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">Character Analysis</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {generationState.characterArchetype}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Info */}
            {generationState.usageInfo && (
              <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400">
                  {generationState.usageInfo.upgradeMessage || 
                   `You have ${generationState.usageInfo.remaining} AI generations remaining today.`}
                </p>
              </div>
            )}

            {/* Generate Another Button */}
            <button
              onClick={() => {
                setGenerationState(prev => ({ ...prev, story: null, characterArchetype: null }));
              }}
              className="w-full px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg font-medium transition-colors"
            >
              Generate Another Story
            </button>
          </div>
        )}

        {/* Error Display */}
        {generationState.error && (
          <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-medium text-sm">Story Generation Failed</span>
            </div>
            <p className="text-red-300 text-sm mb-3">{generationState.error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-red-100 text-sm rounded font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Upgrade Modal */}
        <UpgradeFlow
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          triggerFeature="ai"
        />
      </div>
    </FeatureErrorBoundary>
  );
}