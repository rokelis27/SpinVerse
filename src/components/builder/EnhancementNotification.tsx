'use client';

import { useBuilderStore } from '@/stores/builderStore';
import { useEffect, useState } from 'react';

export const EnhancementNotification: React.FC = () => {
  const { currentEnhancementId, enhancementHistory } = useBuilderStore();
  const [isVisible, setIsVisible] = useState(false);
  const [currentHistory, setCurrentHistory] = useState<any>(null);

  useEffect(() => {
    if (currentEnhancementId && enhancementHistory.length > 0) {
      const history = enhancementHistory.find(h => h.id === currentEnhancementId);
      if (history) {
        setCurrentHistory(history);
        setIsVisible(true);
        
        // Auto-hide after 8 seconds
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 8000);

        return () => clearTimeout(timer);
      }
    }
  }, [currentEnhancementId, enhancementHistory]);

  if (!isVisible || !currentHistory) return null;

  const { enhancementSummary } = currentHistory;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="glass-panel rounded-xl p-4 border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-green-300">Theme Enhanced!</h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-cyan-300 font-bold">{enhancementSummary.addedSteps}</div>
                  <div className="text-gray-400">Steps</div>
                </div>
                <div>
                  <div className="text-purple-300 font-bold">{enhancementSummary.addedOptions}</div>
                  <div className="text-gray-400">Options</div>
                </div>
                <div>
                  <div className="text-pink-300 font-bold">{enhancementSummary.addedBranches}</div>
                  <div className="text-gray-400">Branches</div>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="text-gray-300 text-xs">
                  Focus: {enhancementSummary.enhancementAreas.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};