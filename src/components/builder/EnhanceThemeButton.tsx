'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';

export const EnhanceThemeButton: React.FC = () => {
  const { 
    currentSequence, 
    isEnhancing, 
    currentEnhancementId, 
    startEnhancement, 
    rollbackEnhancement 
  } = useBuilderStore();
  
  const [showOptions, setShowOptions] = useState(false);
  const [enhancementLevel, setEnhancementLevel] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [focusAreas, setFocusAreas] = useState<string[]>(['branching', 'options']);
  
  if (!currentSequence) return null;

  const handleEnhance = async () => {
    setShowOptions(false);
    const success = await startEnhancement(enhancementLevel, focusAreas);
    if (!success) {
      alert('Failed to enhance theme. Please try again.');
    }
  };

  const handleRollback = () => {
    const confirmed = confirm('Are you sure you want to undo the AI enhancement? This will restore your original sequence.');
    if (confirmed) {
      rollbackEnhancement();
    }
  };

  // If currently enhanced, show rollback button
  if (currentEnhancementId) {
    return (
      <button
        onClick={handleRollback}
        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
        title="Undo AI Enhancement"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span>Undo Enhancement</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(true)}
        disabled={isEnhancing}
        className={`px-4 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 ${
          isEnhancing
            ? 'bg-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        } text-white`}
        title="AI-Enhanced Theme Creator"
      >
        {isEnhancing ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enhancing...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Enhance Theme</span>
          </>
        )}
      </button>

      {/* Enhancement Options Modal */}
      {showOptions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-panel rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">AI Theme Enhancement</h3>
              <button
                onClick={() => setShowOptions(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Enhancement Level */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Enhancement Level
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'light', label: 'Light', desc: '1-2 new steps, 2-3 new options' },
                    { value: 'moderate', label: 'Moderate', desc: '3-4 new steps, 4-5 new options' },
                    { value: 'heavy', label: 'Heavy', desc: '5-8 new steps, 6-8 new options' }
                  ].map((level) => (
                    <label key={level.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="enhancementLevel"
                        value={level.value}
                        checked={enhancementLevel === level.value}
                        onChange={(e) => setEnhancementLevel(e.target.value as any)}
                        className="text-purple-500 focus:ring-purple-500"
                      />
                      <div>
                        <div className="text-white font-medium">{level.label}</div>
                        <div className="text-xs text-gray-400">{level.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Focus Areas
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'branching', label: 'Complex Branching', desc: 'Add multiple story paths' },
                    { value: 'options', label: 'More Options', desc: 'Diverse wheel choices' },
                    { value: 'narrative', label: 'Rich Narrative', desc: 'Character & plot development' },
                    { value: 'outcomes', label: 'Multiple Endings', desc: 'Different story conclusions' }
                  ].map((area) => (
                    <label key={area.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        value={area.value}
                        checked={focusAreas.includes(area.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFocusAreas([...focusAreas, area.value]);
                          } else {
                            setFocusAreas(focusAreas.filter(f => f !== area.value));
                          }
                        }}
                        className="text-purple-500 focus:ring-purple-500 rounded"
                      />
                      <div>
                        <div className="text-white font-medium">{area.label}</div>
                        <div className="text-xs text-gray-400">{area.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm text-yellow-300 font-medium">Processing Time</p>
                    <p className="text-xs text-yellow-200">
                      AI enhancement may take 10-30 seconds. You can undo changes anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowOptions(false)}
                  className="flex-1 px-4 py-3 glass-panel text-gray-300 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEnhance}
                  disabled={focusAreas.length === 0}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Enhance Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};