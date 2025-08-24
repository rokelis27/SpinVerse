'use client';

import { SpinWheel } from '@/components/wheel/SpinWheel';
import { ResultPopup } from '@/components/wheel/ResultPopup';
import { WheelConfig, SpinResult } from '@/types/wheel';
import { getThemedWheel, createThemedWheel } from '@/utils/wheelThemes';
import { useState } from 'react';

export default function Home() {
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [currentWheel, setCurrentWheel] = useState<'house' | 'powers' | 'custom'>('house');

  // Predefined wheel configurations showcasing our theming system
  const wheels = {
    house: getThemedWheel('harry-potter-house'),
    powers: getThemedWheel('marvel-powers'),
    custom: createThemedWheel([
      'Build MVP', 'Raise Funding', 'Hire Team', 'Launch Product', 
      'Scale Business', 'Get Acquired', 'Go Public', 'Pivot Strategy'
    ], 'startup', 400)
  };

  const handleSpinComplete = (result: SpinResult) => {
    setLastResult(result);
    setShowResultPopup(true);
    console.log('Spin result:', result);
  };

  const handleClosePopup = () => {
    setShowResultPopup(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            SpinVerse MVP - The Best Wheel Ever! 🎯
          </h1>
          <p className="text-lg text-gray-600">
            Testing our superior Canvas-based spinning wheel with realistic physics
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          {/* Wheel Selection */}
          <div className="flex gap-4 flex-wrap justify-center">
            <button
              onClick={() => setCurrentWheel('house')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentWheel === 'house' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              🧙 Hogwarts Houses
            </button>
            <button
              onClick={() => setCurrentWheel('powers')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentWheel === 'powers' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              🦸 Marvel Powers
            </button>
            <button
              onClick={() => setCurrentWheel('custom')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentWheel === 'custom' 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow'
              }`}
            >
              🚀 Startup Journey
            </button>
          </div>

          <div className="relative">
            <SpinWheel 
              config={wheels[currentWheel]}
              onSpinComplete={handleSpinComplete}
            />
            
            {/* Subtle Result Overlay */}
            <ResultPopup
              result={lastResult}
              isVisible={showResultPopup}
              onClose={handleClosePopup}
            />
          </div>

          {/* Show last result as a small card below wheel */}
          {lastResult && !showResultPopup && (
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm w-full text-center">
              <p className="text-sm text-gray-600 mb-1">Last Result</p>
              <p className="font-bold text-lg" style={{ color: lastResult.segment.color }}>
                {lastResult.segment.text}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              🚀 What Makes Our Wheel Superior
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Performance</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• 60fps Canvas rendering</li>
                  <li>• Realistic physics engine</li>
                  <li>• Smooth mobile interactions</li>
                  <li>• GPU-accelerated animations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Design</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Beautiful gradients & shadows</li>
                  <li>• Automatic color contrast</li>
                  <li>• Modern typography</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">User Experience</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Touch-friendly interactions</li>
                  <li>• Satisfying spin feedback</li>
                  <li>• Clear result indication</li>
                  <li>• Accessible controls</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Technical</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• TypeScript typed</li>
                  <li>• Modular architecture</li>
                  <li>• Customizable themes</li>
                  <li>• Weighted segments ready</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
