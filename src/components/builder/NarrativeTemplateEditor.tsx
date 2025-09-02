'use client';

import { useState } from 'react';
import { useBuilderStore } from '@/stores/builderStore';

export const NarrativeTemplateEditor: React.FC = () => {
  const { currentSequence, updateSequenceName, updateSequenceDescription } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!currentSequence) return null;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Story Settings</h3>
            <p className="text-sm text-gray-400">Configure how AI will generate your stories</p>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sequence Name
              </label>
              <input
                type="text"
                value={currentSequence.name}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    updateSequenceName(e.target.value);
                  }
                }}
                maxLength={50}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                placeholder="Enter sequence name..."
              />
              <p className="text-xs text-gray-500 mt-1">{currentSequence.name.length}/50 characters • This will be the title of your generated stories</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Story Theme/Genre
              </label>
              <select
                value={currentSequence.narrativeTemplate || 'adventure'}
                onChange={(e) => {
                  // You'd need to add this to the store
                  // updateNarrativeTemplate(e.target.value)
                }}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              >
                <option value="adventure">Adventure</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="horror">Horror</option>
                <option value="comedy">Comedy</option>
                <option value="drama">Drama</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              World Description
            </label>
            <textarea
              value={currentSequence.description}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  updateSequenceDescription(e.target.value);
                }
              }}
              maxLength={500}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              rows={3}
              placeholder="Describe the world/setting for your sequence. This helps AI generate more contextual stories..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {currentSequence.description.length}/500 characters • Be specific about the setting, tone, and themes. E.g., &quot;A cyberpunk city where hackers battle corporate AI&quot;
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-purple-300 font-medium mb-1">SpinVerse Story Generation</p>
                <p className="text-xs text-purple-200">
                  SpinVerse will use your sequence name, description, and chosen options to create personalized narratives. 
                  More detailed descriptions lead to richer, more contextual stories.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};