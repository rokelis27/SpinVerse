'use client';

import { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ 
  content, 
  position = 'top',
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current && tooltipRef.current) {
      const button = buttonRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let top = 0;
      let left = 0;

      // Calculate position based on preferred position and available space
      // Using fixed positioning, so use button's screen coordinates directly
      switch (position) {
        case 'top':
          top = button.top - tooltip.height - 12;
          left = button.left + (button.width - tooltip.width) / 2;
          break;
        case 'bottom':
          top = button.bottom + 12;
          left = button.left + (button.width - tooltip.width) / 2;
          break;
        case 'left':
          top = button.top + (button.height - tooltip.height) / 2;
          left = button.left - tooltip.width - 12;
          break;
        case 'right':
          top = button.top + (button.height - tooltip.height) / 2;
          left = button.right + 12;
          break;
      }

      const padding = 16;

      // Keep tooltip within viewport bounds
      if (left < padding) {
        left = padding;
      } else if (left + tooltip.width > viewport.width - padding) {
        left = viewport.width - tooltip.width - padding;
      }

      if (top < padding) {
        // If tooltip would go above screen, position it below the button instead
        top = button.bottom + 12;
      } else if (top + tooltip.height > viewport.height - padding) {
        // If tooltip would go below screen, position it above the button instead
        top = button.top - tooltip.height - 12;
      }

      setTooltipStyle({
        top: `${top}px`,
        left: `${left}px`
      });
    }
  }, [isVisible, position]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={buttonRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-6 h-6 ml-2 text-gray-400 hover:text-cyan-400 transition-all duration-300 rounded-full hover:bg-cyan-400/10 backdrop-blur-sm border border-gray-600/30 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-400/20 hover:scale-110"
        type="button"
        aria-label="Help"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
        </svg>
      </button>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-4 py-4 text-sm text-white bg-gray-900/95 backdrop-blur-md border border-gray-600/50 rounded-xl shadow-2xl shadow-cyan-500/20 w-64 sm:w-72 min-h-[4rem] whitespace-normal leading-relaxed break-words"
          style={tooltipStyle}
          role="tooltip"
        >
          <div className="relative">
            <div className="font-medium leading-relaxed">{content}</div>
            {/* Cosmic glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-purple-400/5 rounded-xl pointer-events-none" />
            {/* Arrow */}
            <div 
              className={`absolute w-3 h-3 bg-gray-900/95 border-l border-t border-gray-600/50 transform rotate-45 ${
                position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
                position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
                'left-[-6px] top-1/2 -translate-y-1/2'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};