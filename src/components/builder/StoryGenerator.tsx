'use client';

import { useState } from 'react';
import { UserSequence } from '@/types/builder';
import { useSequenceStore } from '@/stores/sequenceStore';

interface StoryGeneratorProps {
  sequence: UserSequence;
}

interface GeneratedStory {
  story: string;
  rarityScore: number;
  rarityPercentage: string;
  rarityTier: string;
  characterLookalike: string;
}

export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ sequence }) => {
  const { results } = useSequenceStore();
  const [generatedStory, setGeneratedStory] = useState<GeneratedStory | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isSequenceComplete = results.length > 0 && results.length >= Math.min(sequence.steps.length, 3);

  const generateStory = async () => {
    if (!isSequenceComplete) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          results,
          themeName: sequence.name,
          themeId: sequence.id,
          isCustomSequence: true,
          sequenceDescription: sequence.description
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story');
      }

      const data = await response.json();
      setGeneratedStory(data);
    } catch (err) {
      setError('Failed to generate story. Please try again.');
      console.error('Story generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isSequenceComplete) {
    return (
      <div className="mt-8 glass-panel rounded-2xl p-6 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-sm">Complete at least 3 steps to generate your story</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Story Generation Button */}
      {!generatedStory && (
        <div className="glass-panel rounded-2xl p-6 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Generate Your Story</h3>
            <p className="text-gray-300 mb-4">
              Transform your choices into an AI-generated personalized narrative
            </p>
            <div className="text-sm text-gray-400 mb-6">
              {results.length} choice{results.length !== 1 ? 's' : ''} • {sequence.name}
            </div>
          </div>

          <button
            onClick={generateStory}
            disabled={isGenerating}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Generate AI Story</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Generated Story Display */}
      {generatedStory && (
        <div className="space-y-6">
          {/* Story Header */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{sequence.name} Story</h3>
                <p className="text-purple-300 font-medium">{generatedStory.characterLookalike}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  {generatedStory.rarityPercentage}
                </div>
                <div className="text-sm text-gray-400">{generatedStory.rarityTier}</div>
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-100 leading-relaxed whitespace-pre-wrap text-base">
                {generatedStory.story}
              </div>
            </div>
          </div>

          {/* Story Stats */}
          <div className="glass-panel rounded-2xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Story Analysis</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {generatedStory.rarityScore}/100
                </div>
                <div className="text-sm text-gray-400">Rarity Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400 mb-1">
                  {results.length}
                </div>
                <div className="text-sm text-gray-400">Choices Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">
                  {generatedStory.rarityTier}
                </div>
                <div className="text-sm text-gray-400">Tier</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={generateStory}
              disabled={isGenerating}
              className="px-6 py-3 glass-panel rounded-xl text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Generate New Story</span>
            </button>
            
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedStory.story);
                // Could add a toast notification here
              }}
              className="px-6 py-3 glass-panel rounded-xl text-gray-300 hover:text-white transition-all duration-300 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Story</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};