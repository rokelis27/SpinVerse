'use client';

import { useEffect, useState } from 'react';

interface StepEnhancementNotificationProps {
  isVisible: boolean;
  stepTitle: string;
  addedOptions: number;
  onClose: () => void;
}

export const StepEnhancementNotification: React.FC<StepEnhancementNotificationProps> = ({ 
  isVisible, 
  stepTitle, 
  addedOptions, 
  onClose 
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
      <div className="glass-panel rounded-lg p-4 border border-green-500/30 bg-gradient-to-r from-green-500/10 to-emerald-500/10 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-green-300">Step Enhanced! ✨</h4>
              <button
                onClick={() => {
                  setShow(false);
                  setTimeout(onClose, 300);
                }}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-xs text-green-200 mb-2">
              "{stepTitle}"
            </p>
            
            <div className="text-xs text-green-100">
              Added <span className="font-bold text-green-300">{addedOptions}</span> new options
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};