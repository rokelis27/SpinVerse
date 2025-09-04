'use client';

import { useState } from 'react';
import * as Sentry from '@sentry/nextjs';

interface FeedbackButtonProps {
  className?: string;
  variant?: 'footer' | 'floating' | 'inline';
}

export function FeedbackButton({ className = '', variant = 'footer' }: FeedbackButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedbackClick = async () => {
    try {
      setIsLoading(true);
      
      // Get the feedback integration and open the dialog
      const feedbackIntegration = Sentry.getClient()?.getIntegrationByName?.('Feedback');
      
      if (feedbackIntegration && 'openDialog' in feedbackIntegration) {
        // Type assertion for the openDialog method
        (feedbackIntegration as any).openDialog();
      } else {
        // Fallback: Try to use the global Sentry feedback API if available
        if ('showReportDialog' in Sentry) {
          (Sentry as any).showReportDialog();
        } else {
          console.warn('Sentry feedback integration not found');
          // Could show a manual feedback form here as fallback
        }
      }
    } catch (error) {
      console.error('Failed to open feedback dialog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Different styles based on variant
  const getButtonStyles = () => {
    const baseStyles = "transition-all duration-200 flex items-center gap-2 font-medium";
    
    switch (variant) {
      case 'footer':
        return `${baseStyles} text-gray-400 hover:text-white text-sm px-3 py-2 rounded-md hover:bg-gray-800/50`;
      case 'floating':
        return `${baseStyles} bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl`;
      case 'inline':
        return `${baseStyles} text-purple-400 hover:text-purple-300 text-sm underline underline-offset-4`;
      default:
        return baseStyles;
    }
  };

  const getIconStyles = () => {
    const baseIconStyles = "transition-transform duration-200";
    return variant === 'floating' 
      ? `${baseIconStyles} group-hover:scale-110` 
      : baseIconStyles;
  };

  return (
    <button
      onClick={handleFeedbackClick}
      disabled={isLoading}
      className={`${getButtonStyles()} ${className} group disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label="Leave feedback"
    >
      {/* Feedback Icon */}
      <svg 
        className={getIconStyles()}
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
      
      {isLoading ? (
        <span className="text-sm">Opening...</span>
      ) : (
        <span className="text-sm">
          {variant === 'footer' ? 'Feedback & Bugs' : 
           variant === 'floating' ? 'Feedback' : 
           'Give Feedback'}
        </span>
      )}
    </button>
  );
}

// Alternative component for cases where we want to ensure the integration is available
export function SafeFeedbackButton(props: FeedbackButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if Sentry feedback is available on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const checkFeedbackAvailable = () => {
        const client = Sentry.getClient();
        const feedbackIntegration = client?.getIntegrationByName?.('Feedback');
        setIsAvailable(!!feedbackIntegration);
      };

      // Check immediately and also after a short delay to ensure Sentry is fully loaded
      checkFeedbackAvailable();
      setTimeout(checkFeedbackAvailable, 1000);
    }
  });

  if (!isAvailable) {
    return null; // Don't render if feedback integration isn't available
  }

  return <FeedbackButton {...props} />;
}