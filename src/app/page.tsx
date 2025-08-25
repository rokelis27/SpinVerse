'use client';

import { SequenceController } from '@/components/sequence/SequenceController';
import { SequenceProgress } from '@/components/sequence/SequenceProgress';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useSequenceStore } from '@/stores/sequenceStore';
import { themes } from '@/data/themes';
import { useState } from 'react';

export default function Home() {
  const [showSequence, setShowSequence] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { startSequence, resetSequence, isActive } = useSequenceStore();

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

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              SpinVerse - Sequence Testing 🎯
            </h1>
            <p className="text-lg text-gray-600">
              Testing our auto-advancing themed wheel sequences
            </p>
          </div>
          
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 group"
            title="Settings"
          >
            <svg 
              className="w-6 h-6 text-gray-600 group-hover:text-gray-800 transition-colors" 
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
            <div className="text-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Choose Your Adventure
              </h2>
              <p className="text-gray-600">
                Select a theme to begin your sequence journey
              </p>
            </div>

            <div className="grid md:grid-cols-1 gap-6 w-full max-w-md">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => handleStartSequence(theme.id)}
                  className="bg-white rounded-xl shadow-lg p-6 text-left hover:shadow-xl transition-all duration-200 hover:scale-105"
                  style={{ borderLeft: `6px solid ${theme.color}` }}
                >
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {theme.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {theme.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium" style={{ color: theme.color }}>
                      {theme.steps.length} Steps
                    </span>
                    <div className="text-2xl">
                      {theme.id === 'harry-potter' && '🧙‍♂️'}
                      {theme.id === 'hunger-games' && '🏹'}
                      {!['harry-potter', 'hunger-games'].includes(theme.id) && '🎯'}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                🌟 Sequence System Features
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-semibold text-purple-600 mb-2">Auto-Flow</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Auto-advance between wheels</li>
                    <li>• Smooth transitions</li>
                    <li>• Progress tracking</li>
                    <li>• Result preservation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-600 mb-2">Visual Design</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Step-by-step progress bar</li>
                    <li>• Themed wheel configurations</li>
                    <li>• Transition animations</li>
                    <li>• Mobile-optimized layout</li>
                  </ul>
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
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mb-4"
            >
              ← Back to Themes
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
