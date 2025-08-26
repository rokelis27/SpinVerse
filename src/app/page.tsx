'use client';

import { SequenceController } from '@/components/sequence/SequenceController';
import { SequenceProgress } from '@/components/sequence/SequenceProgress';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { SequenceBuilder } from '@/components/builder/SequenceBuilder';
import { useSequenceStore } from '@/stores/sequenceStore';
import { useBuilderStore } from '@/stores/builderStore';
import { themes } from '@/data/themes';
import { useState, useEffect, useMemo } from 'react';
import { useSavedSequences } from '@/hooks/useSavedSequences';
import { UserSequence } from '@/types/builder';

export default function Home() {
  const [showSequence, setShowSequence] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { startSequence, resetSequence, isActive } = useSequenceStore();
  const { loadSequence } = useBuilderStore();
  const { savedSequences, isLoading: loadingSaved, deleteSequence, refreshSequences } = useSavedSequences();

  // Generate stable particle positions
  const particlePositions = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      left: (i * 17 + 23) % 100, // Deterministic positioning
      delay: (i * 0.3) % 3,
      duration: 3 + (i % 2)
    })), []
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleStartSequence = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      startSequence(theme);
      setShowSequence(true);
    }
  };

  const handleResetSequence = () => {
    resetSequence();
    setShowSequence(false);
  };

  const handleOpenBuilder = () => {
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    // Refresh saved sequences when builder closes
    refreshSequences();
  };

  const handleStartCustomSequence = (sequence: UserSequence) => {
    // Convert UserSequence to SequenceTheme format
    const themeForPlay = {
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

    startSequence(themeForPlay);
    setShowSequence(true);
  };

  const handleEditSequence = (sequence: UserSequence) => {
    loadSequence(sequence);
    setShowBuilder(true);
  };

  const handleExportSequence = (sequence: UserSequence) => {
    const dataStr = JSON.stringify(sequence, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${sequence.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportAll = () => {
    if (savedSequences.length === 0) return;
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      sequences: savedSequences
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `spinverse_sequences_backup_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  // Show builder in full screen
  if (showBuilder) {
    return <SequenceBuilder onClose={handleCloseBuilder} />;
  }

  return (
    <main className="min-h-screen cosmic-bg p-4 md:p-8 relative overflow-hidden">
      {/* Particle Effects - Only render on client */}
      {isClient && (
        <div className="particle-container">
          {particlePositions.map((particle, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1 cinematic-enter">
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 tracking-tight">
                SpinVerse
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-75 transition duration-1000"></div>
            </div>
            <p className="text-2xl text-gray-100 font-medium tracking-wide">
              Transform spins into epic stories
            </p>
          </div>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 glass-panel rounded-full shadow-cosmic hover:shadow-xl transition-all duration-300 hover:scale-110 group neon-glow micro-bounce"
            title="Settings"
          >
            <svg 
              className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
              />
            </svg>
          </button>
        </div>

        {!showSequence ? (
          // Theme Selection Screen
          <div className="flex flex-col items-center gap-8">
            <div className="text-center mb-4 cinematic-enter" style={{animationDelay: '0.2s'}}>
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text mb-4">
                🌟 Choose Your Epic Journey
              </h2>
            </div>
            
            <div className="grid md:grid-cols-1 gap-8 w-full max-w-lg">
              {themes.map((theme, index) => (
                <button
                  key={theme.id}
                  onClick={() => handleStartSequence(theme.id)}
                  className="glass-panel hud-panel rounded-2xl p-8 text-left hover:shadow-cosmic transition-all duration-500 hover:scale-105 micro-bounce neon-glow group cinematic-enter"
                  style={{ 
                    borderLeft: `4px solid ${theme.color}`,
                    animationDelay: `${0.3 + index * 0.1}s`
                  }}
                >
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                    {theme.name}
                  </h3>
                  <p className="text-gray-100 text-base mb-6 group-hover:text-white transition-colors font-medium">
                    {theme.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30" style={{ 
                        color: theme.color,
                        textShadow: '0 0 10px rgba(255,255,255,0.5)'
                      }}>
                        {theme.steps.length} Epic Steps
                      </span>
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
                    </div>
                    <div className="flex items-center justify-center w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                      {theme.id === 'mystical-academy' && (
                        <span className="text-3xl">🧙‍♂️</span>
                      )}
                      {theme.id === 'survival-tournament' && (
                        <span className="text-3xl">🏹</span>
                      )}
                      {!['mystical-academy', 'survival-tournament'].includes(theme.id) && (
                        <span className="text-3xl">🎯</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Create Your Own Journey Button */}
            <div className="w-full max-w-lg mt-8">
              <button
                onClick={handleOpenBuilder}
                className="w-full glass-panel hud-panel rounded-2xl p-8 text-center hover:shadow-cosmic transition-all duration-500 hover:scale-105 micro-bounce neon-glow group cinematic-enter border-2 border-emerald-500/30 hover:border-emerald-400/50"
                style={{ 
                  borderLeft: '4px solid #10B981',
                  animationDelay: '0.7s'
                }}
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-3 group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all duration-300">
                  Create Your Own Journey
                </h3>
                
                <p className="text-gray-100 text-base mb-4 group-hover:text-white transition-colors font-medium">
                  Build custom wheel sequences with your own choices and stories
                </p>
                
                <div className="flex justify-center">
                  <span className="text-base font-bold px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/30 group-hover:border-emerald-400/50 transition-all duration-300">
                    ✨ Builder Mode
                  </span>
                </div>
              </button>
            </div>

            {/* Your Custom Stories Section */}
            {isClient && savedSequences.length > 0 && (
              <div className="w-full max-w-lg mt-8">
                <div className="glass-panel hud-panel rounded-2xl p-6 cinematic-enter" style={{animationDelay: '0.8s'}}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                      Your Custom Stories
                    </h3>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleExportAll}
                        className="text-xs px-2 py-1 glass-panel rounded text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-1"
                        title="Export All Sequences"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export All</span>
                      </button>
                      <div className="text-sm text-gray-400">
                        {savedSequences.length} saved
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {savedSequences.slice(0, 5).map((sequence) => (
                      <div
                        key={sequence.id}
                        className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm truncate group-hover:text-purple-300 transition-colors">
                              {sequence.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {sequence.steps.length} steps • Created {new Date(sequence.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-3">
                            <button
                              onClick={() => handleStartCustomSequence(sequence)}
                              className="p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group"
                              title="Play Story"
                            >
                              <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-7-7h12a2 2 0 012 2v12a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleEditSequence(sequence)}
                              className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 group"
                              title="Edit Story"
                            >
                              <svg className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => handleExportSequence(sequence)}
                              className="p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 group"
                              title="Export as JSON"
                            >
                              <svg className="w-4 h-4 text-blue-400 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this sequence?')) {
                                  deleteSequence(sequence.id);
                                }
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-300 opacity-0 group-hover:opacity-100"
                              title="Delete Story"
                            >
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {savedSequences.length > 5 && (
                    <div className="mt-3 text-center">
                      <span className="text-xs text-gray-500">
                        +{savedSequences.length - 5} more sequences
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="glass-panel hud-panel rounded-2xl p-8 max-w-3xl w-full mt-12 cinematic-enter" style={{animationDelay: '0.6s'}}>
              <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text mb-6 text-center">
                🚀 Next-Gen Storytelling Features
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-emerald-400 mb-3 text-lg">🌀 Auto-Flow Magic</h3>
                  <div className="space-y-2">
                    {['Auto-advance between wheels', 'Cinematic transitions', 'Progress tracking', 'Result persistence'].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
                        <span className="text-gray-100 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-cyan-400 mb-3 text-lg">✨ Visual Excellence</h3>
                  <div className="space-y-2">
                    {['Gaming-inspired UI', 'Immersive animations', 'Mobile-first design', 'AI-powered narratives'].map((feature, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: `${i * 0.2 + 1}s`}}></div>
                        <span className="text-gray-100 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Sequence Screen
          <div className="flex flex-col items-center gap-8">
            {/* Progress Indicator */}
            <SequenceProgress className="mb-4" />

            {/* Reset Button */}
            <button
              onClick={handleResetSequence}
              className="px-6 py-3 glass-panel rounded-xl text-gray-300 hover:text-white transition-all duration-300 mb-6 micro-bounce neon-glow group"
            >
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Universes</span>
              </span>
            </button>

            {/* Sequence Controller */}
            <SequenceController onBackToHome={handleResetSequence} />
          </div>
        )}

        {/* Settings Panel */}
        <SettingsPanel 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </div>
    </main>
  );
}
