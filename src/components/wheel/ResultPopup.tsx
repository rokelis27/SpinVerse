'use client';

import React, { useEffect, useState } from 'react';
import { SpinResult } from '@/types/wheel';

interface ResultPopupProps {
  result: SpinResult | null;
  isVisible: boolean;
  onClose: () => void;
}

export const ResultPopup: React.FC<ResultPopupProps> = ({
  result,
  isVisible,
  onClose
}) => {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'entering' | 'celebration' | 'visible'>('hidden');

  useEffect(() => {
    if (isVisible && result) {
      // Animation sequence: entrance -> celebration -> visible
      setAnimationPhase('entering');
      
      setTimeout(() => {
        setAnimationPhase('celebration');
      }, 200);
      
      setTimeout(() => {
        setAnimationPhase('visible');
      }, 800);
    } else {
      setAnimationPhase('hidden');
    }
  }, [isVisible, result]);

  if (!isVisible || !result) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div 
        className={`bg-white rounded-2xl shadow-xl max-w-xs w-full mx-4 pointer-events-auto transform transition-all duration-500 ${
          animationPhase === 'hidden' 
            ? 'scale-0 opacity-0' 
            : animationPhase === 'entering'
            ? 'scale-105 opacity-100'
            : animationPhase === 'celebration'
            ? 'scale-110 opacity-100 animate-bounce'
            : 'scale-100 opacity-100'
        }`}
        style={{
          background: `linear-gradient(135deg, ${result.segment.color}10, #ffffff)`,
          border: `2px solid ${result.segment.color}`,
        }}
      >
        {/* Subtle Confetti Effect */}
        {animationPhase === 'celebration' && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full animate-ping"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4'][i % 3],
                  left: `${30 + (i * 10)}%`,
                  top: `${20 + (i % 2) * 40}%`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '0.8s'
                }}
              />
            ))}
          </div>
        )}
        
        {/* Compact Header */}
        <div className="text-center pt-4 pb-3">
          <div className={`text-3xl mb-2 transform transition-all duration-700 ${
            animationPhase === 'celebration' ? 'animate-bounce' : ''
          }`}>
          </div>
        </div>
        
        {/* Result */}
        <div className="px-4 pb-4">
          <div 
            className="text-center py-3 px-4 rounded-xl text-white font-bold text-lg shadow-lg"
            style={{ backgroundColor: result.segment.color }}
          >
            {result.segment.text}
          </div>
          
        </div>
      </div>
    </div>
  );
};