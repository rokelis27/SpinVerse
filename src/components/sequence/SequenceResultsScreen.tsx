'use client';

import React from 'react';
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
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Magical Journey</h3>
        <p className="text-gray-700 leading-relaxed text-lg">
          {storyText}
        </p>
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