'use client';

import React, { useState } from 'react';
import { useSequenceStore, useSequenceNarrative } from '@/stores/sequenceStore';
import { SequenceResult } from '@/types/sequence';

interface SequenceResultsScreenProps {
  onRestart: () => void;
  onBackToHome: () => void;
  className?: string;
}

export const SequenceResultsScreen: React.FC<SequenceResultsScreenProps> = ({
  onRestart,
  onBackToHome,
  className = ''
}) => {
  const { currentTheme, results } = useSequenceStore();
  const narrative = useSequenceNarrative();
  const [generatedStory, setGeneratedStory] = useState<{
    story: string;
    rarityScore: number;
    rarityPercentage: string;
    rarityTier: string;
    characterLookalike: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false); // Track if user already generated once

  if (!currentTheme) return null;

  // Generate story text from results
  const generateStoryText = (results: SequenceResult[]) => {
    if (currentTheme.id === 'harry-potter') {
      const resultMap = results.reduce((acc, result) => {
        acc[result.stepId] = result.spinResult.segment.text;
        return acc;
      }, {} as Record<string, string>);

      return `You are a ${resultMap.origin || 'magical'} wizard who was sorted into ${resultMap.house || 'a great house'}. Your ${resultMap.wand || 'powerful wand'} chose you, and your loyal ${resultMap.pet || 'companion'} is always by your side. Your signature spell is ${resultMap.spell || 'a mighty incantation'} - use it wisely in your magical adventures!`;
    }
    
    // Generic narrative for other themes
    return results.map(r => r.spinResult.segment.text).join(' → ');
  };

  const storyText = generateStoryText(results);

  const handleGenerateStory = async () => {
    // If already generated, just show the existing story
    if (hasGenerated && generatedStory) {
      setGeneratedStory(generatedStory); // This will switch the view to show AI story
      return;
    }
    
    // If trying to generate for the first time after already generating, block it
    if (hasGenerated && !generatedStory) {
      setError('You can only generate one AI story per sequence. Create a new story to generate again!');
      return;
    }
    
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
          themeName: currentTheme.name,
          themeId: currentTheme.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate story');
      }
      
      const data = await response.json();
      setGeneratedStory(data);
      setHasGenerated(true); // Mark as generated
    } catch (err) {
      setError('Failed to generate your magical story. Please try again!');
      console.error('Story generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto text-center space-y-8 ${className}`}>
      {/* Celebration Header */}
      <div className="space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h1 className="text-3xl md:text-4xl font-bold text-green-600">
          Your Story is Complete!
        </h1>
        <h2 className="text-xl font-semibold" style={{ color: currentTheme.color }}>
          {currentTheme.name}
        </h2>
      </div>

      {/* Story Narrative */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Basic Story - Always shown */}
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          {generatedStory ? 'Your Basic Journey' : 'Your Magical Journey'}
        </h3>
        <p className="text-gray-700 leading-relaxed text-lg mb-6">
          {storyText}
        </p>
        
        {/* AI Generated Story Section */}
        {generatedStory && (
          <>
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Your Epic AI Journey</h3>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {generatedStory.rarityTier} ({generatedStory.rarityPercentage})
                </div>
              </div>
              
              {/* Character Lookalike */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-6 border border-yellow-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🧙‍♂️</span>
                  <div>
                    <p className="font-semibold text-yellow-800">You're Most Like:</p>
                    <p className="text-yellow-700">{generatedStory.characterLookalike}</p>
                  </div>
                </div>
              </div>
              
              {/* AI Generated Story */}
              <div className="text-left mb-6">
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                  {generatedStory.story}
                </div>
              </div>
              
              {/* Rarity Details */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-center">
                  <div className="text-purple-800 font-bold text-lg mb-1">
                    {generatedStory.rarityTier}
                  </div>
                  <div className="text-purple-600 font-semibold mb-2">
                    🎯 {generatedStory.rarityScore}/100 Points • {generatedStory.rarityPercentage} of all combinations
                  </div>
                  <div className="text-purple-500 text-sm">
                    {generatedStory.rarityScore >= 40 
                      ? "Your combination is incredibly rare!" 
                      : generatedStory.rarityScore >= 25 
                      ? "A rare and interesting combination!" 
                      : "A solid magical journey with some unique elements!"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Generate Button - Only shown if no story generated yet */}
        {!hasGenerated && (
          <div className="border-t pt-6">
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Your Epic Journey...
                </>
              ) : (
                '✨ Generate Your Epic Journey'
              )}
            </button>
            
            {error && (
              <p className="text-red-600 text-sm mt-3">{error}</p>
            )}
            
            <p className="text-gray-500 text-xs mt-3">
              🤖 Powered by AI - Get your personalized story with rarity & character matches!
            </p>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Choices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result, index) => {
            const step = currentTheme.steps.find(s => s.id === result.stepId);
            return (
              <div
                key={result.stepId}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="text-left">
                  <div className="font-medium text-gray-800">
                    {step?.title || `Step ${index + 1}`}
                  </div>
                  <div 
                    className="font-bold"
                    style={{ color: result.spinResult.segment.color }}
                  >
                    {result.spinResult.segment.text}
                  </div>
                </div>
                <div className="text-2xl">
                  {index === 0 && '🔮'}
                  {index === 1 && '🏰'}
                  {index === 2 && '🪄'}
                  {index === 3 && '🦉'}
                  {index === 4 && '⚡'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105"
        >
          🔄 Create Another Story
        </button>
        
        <button
          onClick={onBackToHome}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700 transition-all duration-200 hover:scale-105"
        >
          🏠 Back to Themes
        </button>
      </div>

      {/* Future: Export Options */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-dashed border-purple-300">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Coming Soon!</h3>
        <p className="text-purple-700 text-sm mb-4">
          Export your story as a video to share on social media
        </p>
        <div className="flex gap-2 justify-center">
          <button className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg cursor-not-allowed opacity-50" disabled>
            📹 Export Video
          </button>
          <button className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg cursor-not-allowed opacity-50" disabled>
            📸 Save Image
          </button>
        </div>
      </div>
    </div>
  );
};