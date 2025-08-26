'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSequenceStore } from '@/stores/sequenceStore';
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
  const [isClient, setIsClient] = useState(false);

  // Generate stable particle positions
  const celebrationParticles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      left: (i * 23 + 15) % 100, // Deterministic positioning
      top: (i * 31 + 10) % 100,
      delay: (i * 0.2) % 2,
      duration: 3 + (i % 2)
    })), []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    <div className={`max-w-4xl mx-auto text-center space-y-10 ${className} relative`}>
      {/* Celebration particles - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {celebrationParticles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full opacity-60"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animation: `float ${particle.duration}s infinite ease-in-out`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>
      )}
      {/* Epic Celebration Header */}
      <div className="space-y-6 cinematic-enter relative z-10">
        <div className="text-8xl animate-bounce">
          🎉✨🎊
        </div>
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-lg blur opacity-30"></div>
          <h1 className="relative text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Epic Journey Complete!
          </h1>
        </div>
        <div className="flex items-center justify-center space-x-4">
          {/* Theme Logo */}
          {currentTheme.id === 'harry-potter' && (
            <img 
              src="/harry-potter-1.svg" 
              alt="Harry Potter" 
              className="w-10 h-10 filter brightness-0 invert opacity-80"
            />
          )}
          {currentTheme.id === 'hunger-games' && (
            <img 
              src="/the-hunger-games.svg" 
              alt="Hunger Games" 
              className="w-12 h-10 filter brightness-0 invert opacity-80"
            />
          )}
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text">
            🌟 {currentTheme.name} Universe 🌟
          </h2>
        </div>
      </div>

      {/* Immersive Story Narrative */}
      <div className="glass-panel hud-panel rounded-2xl p-10 relative overflow-hidden cinematic-enter" style={{animationDelay: '0.2s'}}>
        {/* Enhanced Story Header */}
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-6">
          📖 {generatedStory ? 'Your Origin Story' : 'Your Epic Journey'}
        </h3>
        <div className="glass-panel rounded-xl p-6 mb-8 border border-cyan-400/30">
          <p className="text-gray-200 leading-relaxed text-xl font-light">
            {storyText}
          </p>
        </div>
        
        {/* AI Generated Story Section */}
        {generatedStory && (
          <>
            <div className="border-t border-cyan-400/30 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  🤖 AI-Generated Epic
                </h3>
                <div className="glass-panel px-4 py-2 rounded-full border border-purple-400/50 neon-glow">
                  <span className="text-purple-300 font-bold text-sm">
                    ⭐ {generatedStory.rarityTier} ({generatedStory.rarityPercentage})
                  </span>
                </div>
              </div>
              
              {/* Enhanced Character Lookalike */}
              <div className="glass-panel hud-panel rounded-xl p-6 mb-6 border border-yellow-400/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 to-orange-600/10"></div>
                <div className="relative flex items-center space-x-4">
                  <div className="text-4xl animate-pulse">🧙‍♂️</div>
                  <div>
                    <p className="font-bold text-yellow-400 text-lg mb-1">Character Match:</p>
                    <p className="text-yellow-200 text-xl font-semibold">{generatedStory.characterLookalike}</p>
                  </div>
                </div>
              </div>
              
              {/* Enhanced AI Story Display */}
              <div className="text-left mb-8">
                <div className="glass-panel rounded-xl p-8 border border-purple-400/30">
                  <div className="prose prose-xl max-w-none text-gray-200 leading-relaxed whitespace-pre-line font-light">
                    {generatedStory.story}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Rarity Showcase */}
              <div className="glass-panel hud-panel rounded-xl p-8 border border-purple-400/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
                <div className="relative text-center space-y-4">
                  <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                    {generatedStory.rarityTier}
                  </div>
                  <div className="flex items-center justify-center space-x-4 text-purple-300 font-semibold">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🎯</span>
                      <span>{generatedStory.rarityScore}/100 Points</span>
                    </div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>{generatedStory.rarityPercentage} of combinations</span>
                  </div>
                  <div className="text-purple-200 text-lg font-light">
                    {generatedStory.rarityScore >= 40 
                      ? "🌟 Legendary combination achieved!" 
                      : generatedStory.rarityScore >= 25 
                      ? "⚡ Rare and powerful combination!" 
                      : "✨ Solid journey with unique elements!"}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Enhanced Generate Button */}
        {!hasGenerated && (
          <div className="border-t border-cyan-400/30 pt-8">
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="px-12 py-5 btn-cosmic text-white font-bold rounded-2xl shadow-cosmic hover:shadow-3xl transition-all duration-300 micro-bounce neon-glow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center space-x-3">
                {isGenerating ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>🤖 AI Crafting Your Legend...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">🚀</span>
                    <span>Generate Epic AI Story</span>
                    <span className="text-2xl">✨</span>
                  </>
                )}
              </span>
            </button>
            
            {error && (
              <p className="text-red-400 text-sm mt-4 glass-panel rounded-lg p-3 border border-red-400/30">{error}</p>
            )}
            
            <p className="text-gray-300 text-sm mt-4">
              🎭 Get AI-powered narrative with rarity analysis & character matches!
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Results Showcase */}
      <div className="glass-panel hud-panel rounded-2xl p-8 cinematic-enter" style={{animationDelay: '0.4s'}}>
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-8">
          🎯 Your Epic Choices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result, index) => {
            const step = currentTheme.steps.find(s => s.id === result.stepId);
            return (
              <div
                key={result.stepId}
                className="glass-panel hud-panel rounded-xl p-6 hover:scale-105 transition-all duration-300 micro-bounce relative overflow-hidden"
                style={{animationDelay: `${0.1 * index}s`}}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                <div className="relative flex items-center justify-between">
                  <div className="text-left space-y-2">
                    <div className="font-semibold text-gray-300 text-sm uppercase tracking-wider">
                      {step?.title || `Step ${index + 1}`}
                    </div>
                    <div 
                      className="font-bold text-xl"
                      style={{ color: result.spinResult.segment.color }}
                    >
                      {result.spinResult.segment.text}
                    </div>
                  </div>
                  <div className="text-4xl animate-pulse">
                    {index === 0 && '🔮'}
                    {index === 1 && '🏰'}
                    {index === 2 && '🪄'}
                    {index === 3 && '🦉'}
                    {index === 4 && '⚡'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Epic Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center cinematic-enter" style={{animationDelay: '0.6s'}}>
        <button
          onClick={onRestart}
          className="px-10 py-4 btn-cosmic text-white font-bold rounded-xl shadow-cosmic hover:shadow-3xl transition-all duration-300 micro-bounce neon-glow relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center space-x-2">
            <span className="text-xl">🔄</span>
            <span>Forge New Legend</span>
          </span>
        </button>
        
        <button
          onClick={onBackToHome}
          className="px-10 py-4 glass-panel hud-panel text-gray-300 hover:text-white font-bold rounded-xl shadow-lg hover:shadow-cosmic transition-all duration-300 micro-bounce neon-glow"
        >
          <span className="flex items-center space-x-2">
            <span className="text-xl">🌌</span>
            <span>Explore Universes</span>
          </span>
        </button>
      </div>

      {/* Future Export - Gaming Style */}
      <div className="glass-panel hud-panel rounded-2xl p-8 border-2 border-dashed border-cyan-400/50 cinematic-enter" style={{animationDelay: '0.8s'}}>
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text mb-4">
          Next-Gen Features Incoming!
        </h3>
        <p className="text-gray-300 text-lg mb-6">
          🎬 Share your epic story across all social platforms
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-6 py-3 glass-panel rounded-xl text-purple-400 cursor-not-allowed opacity-50 border border-purple-400/30" disabled>
            <span className="flex items-center space-x-2">
              <span>📹</span>
              <span>Export TikTok Video</span>
            </span>
          </button>
          <button className="px-6 py-3 glass-panel rounded-xl text-cyan-400 cursor-not-allowed opacity-50 border border-cyan-400/30" disabled>
            <span className="flex items-center space-x-2">
              <span>📸</span>
              <span>Generate Story Card</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};