'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSequenceStore } from '@/stores/sequenceStore';
import { SequenceResult } from '@/types/sequence';
import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';

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
    characterArchetype: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimitError, setIsRateLimitError] = useState(false); // Track if it's a rate limit error
  const [hasGenerated, setHasGenerated] = useState(false); // Track if user already generated once
  const [isClient, setIsClient] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

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
    
    // Generic narrative for other themes - include multi-spin results
    return results.map(r => {
      if (r.multiSpinResults && r.multiSpinResults.length > 1) {
        // Multi-spin step: show all results
        const allSpins = r.multiSpinResults.map(spin => spin.segment.text).join(' + ');
        return `[${allSpins}]`;
      } else {
        // Single spin step
        return r.spinResult.segment.text;
      }
    }).join(' → ');
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
    setIsRateLimitError(false); // Reset rate limit error flag
    
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
          isCustomSequence: !currentTheme.id || currentTheme.id.startsWith('custom-'),
          sequenceDescription: currentTheme.description,
          themeSteps: currentTheme.steps, // Include step titles for custom sequences
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 429) {
          // Rate limit exceeded - use graceful logging and show upgrade modal
          console.log('ℹ️ Daily AI generation limit reached - showing upgrade prompt');
          setIsRateLimitError(true); // Mark as rate limit error
          setShowUpgradeModal(true); // Show upgrade modal
          // Don't set error message - let the modal handle it
          return; // Exit early, don't throw generic error
        } else {
          // Log actual errors that need debugging
          console.error('AI Generation failed:', response.status, errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        }
      }
      
      const data = await response.json();
      setGeneratedStory(data);
      setHasGenerated(true); // Mark as generated
    } catch (err) {
      setError('Failed to generate your magical story. Please try again!');
      setIsRateLimitError(false); // Not a rate limit error
      console.error('Story generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 md:space-y-8 lg:space-y-10 px-3 sm:px-4 md:px-6 lg:px-8 ${className} relative overflow-x-hidden`}>
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
      <div className="space-y-4 sm:space-y-6 cinematic-enter relative z-10">
        <div className="text-4xl sm:text-6xl md:text-8xl animate-bounce">
          🎉✨🎊
        </div>
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-lg blur opacity-30"></div>
          <h1 className="relative text-mobile-3xl sm:text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Epic Journey Complete!
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Theme Logo */}
          {currentTheme.id === 'mystical-academy' && (
            <span className="text-2xl sm:text-3xl opacity-80">🧙‍♂️</span>
          )}
          {currentTheme.id === 'survival-tournament' && (
            <span className="text-2xl sm:text-3xl opacity-80">🏹</span>
          )}
          {currentTheme.id === 'detective-mystery' && (
            <span className="text-2xl sm:text-3xl opacity-80">🕵️‍♂️</span>
          )}
          {currentTheme.id === 'underground-racing' && (
            <span className="text-2xl sm:text-3xl opacity-80">🏁</span>
          )}
          <h2 className="text-lg sm:text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-center">
            🌟 {currentTheme.name} Universe 🌟
          </h2>
        </div>
      </div>

      {/* Immersive Story Narrative */}
      <div className="glass-panel-mobile hud-panel rounded-2xl relative overflow-hidden cinematic-enter" style={{animationDelay: '0.2s'}}>
        {/* Enhanced Story Header */}
        <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-4 sm:mb-6">
          📖 {generatedStory ? 'Your Origin Story' : 'Your Epic Journey'}
        </h3>
        <div className="glass-panel rounded-xl p-3 sm:p-4 md:p-6 mb-6 sm:mb-8 border border-cyan-400/30 w-full overflow-hidden">
          <p className="text-gray-200 leading-relaxed text-sm sm:text-base md:text-lg lg:text-xl font-light break-words hyphens-auto">
            {storyText}
          </p>
        </div>
        
        {/* AI Generated Story Section */}
        {generatedStory && (
          <>
            <div className="border-t border-cyan-400/30 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                  🤖 SpinVerse-Generated Epic
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
                  <div>
                    <p className="font-bold text-yellow-400 text-lg mb-1">Character Analysis:</p>
                    <p className="text-yellow-200 text-xl font-semibold">{generatedStory.characterArchetype}</p>
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
          <div className="border-t border-cyan-400/30 pt-6 sm:pt-8">
            <button
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 btn-cosmic text-white font-bold rounded-2xl shadow-cosmic hover:shadow-3xl transition-all duration-300 micro-bounce neon-glow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden btn-touch"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">SpinVerse Crafting Your Legend...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Generate Epic SpinVerse Story</span>
                    <span className="text-xl sm:text-2xl">✨</span>
                  </>
                )}
              </span>
            </button>
            
            {error && !isRateLimitError && (
              <div className="text-sm mt-4 glass-panel rounded-lg p-3 sm:p-4 border border-red-400/30 bg-red-500/10">
                <p className="text-red-400">
                  {error}
                </p>
              </div>
            )}
            
            <p className="text-gray-300 text-xs sm:text-sm mt-4 text-center sm:text-left">
              🎭 Get generated narrative with rarity analysis & character matches!
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Results Showcase - Slider Format */}
      <div className="glass-panel-mobile hud-panel rounded-2xl cinematic-enter" style={{animationDelay: '0.4s'}}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-center sm:text-left">
            🎯 The Wheel has decided...
          </h3>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <span>{currentResultIndex + 1}</span>
            <span>/</span>
            <span>{results.length}</span>
          </div>
        </div>
        
        {/* Slider Container with proper layout */}
        <div className="flex items-center justify-center space-x-2 sm:space-x-4">
          {/* Left Arrow */}
          {results.length > 1 && (
            <button
              onClick={() => setCurrentResultIndex(prev => prev > 0 ? prev - 1 : results.length - 1)}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 neon-glow shadow-lg btn-touch"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Result Card Container */}
          <div className="flex-1 max-w-2xl overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentResultIndex * 100}%)` }}
            >
              {results.map((result, index) => {
                const step = currentTheme.steps.find(s => s.id === result.stepId);
                return (
                  <div
                    key={`${result.stepId}-${result.timestamp}-${index}`}
                    className="w-full flex-shrink-0"
                  >
                    <div className="glass-panel hud-panel rounded-xl mobile-padding hover:scale-105 transition-all duration-300 micro-bounce relative overflow-hidden mx-auto max-w-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                      <div className="relative text-center space-y-3 sm:space-y-4">
                        <div className="font-semibold text-gray-300 text-xs sm:text-sm uppercase tracking-wider flex flex-col sm:flex-row items-center justify-center gap-2">
                          <span>{step?.title || `Step ${index + 1}`}</span>
                          {result.multiSpinResults && result.multiSpinResults.length > 1 && (
                            <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-1 rounded-full border border-purple-400/30">
                              🎰 {result.multiSpinResults.length} Spins
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {result.multiSpinResults && result.multiSpinResults.length > 1 ? (
                            // Show all multi-spin results
                            result.multiSpinResults.map((spinResult, spinIndex) => (
                              <div key={spinIndex} className="flex items-center justify-center gap-2">
                                <span className="text-xs text-gray-400 w-6">#{spinIndex + 1}</span>
                                <div 
                                  className="font-bold text-sm sm:text-lg break-words"
                                  style={{ color: spinResult.segment.color }}
                                >
                                  {spinResult.segment.text}
                                </div>
                              </div>
                            ))
                          ) : (
                            // Show single result
                            <div 
                              className="font-bold text-lg sm:text-2xl break-words"
                              style={{ color: result.spinResult.segment.color }}
                            >
                              {result.spinResult.segment.text}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right Arrow */}
          {results.length > 1 && (
            <button
              onClick={() => setCurrentResultIndex(prev => prev < results.length - 1 ? prev + 1 : 0)}
              className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 glass-panel rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 neon-glow shadow-lg btn-touch"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Dot indicators */}
        <div className="flex justify-center space-x-2 mt-4 sm:mt-6">
          {results.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentResultIndex(index)}
              className={`w-3 h-3 sm:w-2 sm:h-2 rounded-full transition-all duration-300 btn-touch ${
                index === currentResultIndex 
                  ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Epic Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center cinematic-enter" style={{animationDelay: '0.6s'}}>
        <button
          onClick={onRestart}
          className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 btn-cosmic text-white font-bold rounded-xl shadow-cosmic hover:shadow-3xl transition-all duration-300 micro-bounce neon-glow relative overflow-hidden btn-touch"
        >
          <span className="relative z-10 flex items-center justify-center space-x-2">
            <span className="text-lg sm:text-xl">🔄</span>
            <span className="text-sm sm:text-base">Forge New Legend</span>
          </span>
        </button>
        
        <button
          onClick={onBackToHome}
          className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-4 glass-panel hud-panel text-gray-300 hover:text-white font-bold rounded-xl shadow-lg hover:shadow-cosmic transition-all duration-300 micro-bounce neon-glow btn-touch"
        >
          <span className="flex items-center justify-center space-x-2">
            <span className="text-lg sm:text-xl">🌌</span>
            <span className="text-sm sm:text-base">Explore Universes</span>
          </span>
        </button>
      </div>

      {/* Future Export - Gaming Style */}
      <div className="glass-panel hud-panel rounded-2xl p-8 border-2 border-dashed border-cyan-400/50 cinematic-enter" style={{animationDelay: '0.8s'}}>
        <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text mb-4">
          New SpinVerse Features Incoming!
        </h3>
        <p className="text-gray-300 text-lg mb-6">
          🎬 Share your stories across all social platforms
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="px-6 py-3 glass-panel rounded-xl text-purple-400 cursor-not-allowed opacity-80 border border-purple-400/30" disabled>
            <span className="flex items-center space-x-2 font-bold">
              <span>📹</span>
              <span>Export TikTok Video</span>
            </span>
          </button>
          <button className="px-6 py-3 glass-panel rounded-xl text-cyan-400 cursor-not-allowed opacity-80 border border-cyan-400/30" disabled>
            <span className="flex items-center space-x-2 font-bold">
              <span>📸</span>
              <span>Generate Visuals</span>
            </span>
          </button>
          <button className="px-6 py-3 glass-panel rounded-xl text-emerald-400 cursor-not-allowed opacity-80 border border-emerald-400/30" disabled>
            <span className="flex items-center space-x-2 font-bold">
              <span>🛒</span>
              <span>Community Sequences Platform</span>
            </span>
          </button>
        </div>
      </div>

      {/* Upgrade Modal for Rate Limiting */}
      <UpgradeFlow
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        triggerFeature="ai"
      />
    </div>
  );
};