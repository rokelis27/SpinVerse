'use client';

import { useTermsModal } from '@/components/providers/TermsModalProvider';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { openTerms } = useTermsModal();

  return (
    <footer className="w-full py-8 mt-2 border-t border-gray-800/20 bg-gradient-to-t from-gray-900/50 to-transparent backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side - Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-center md:text-left">
              <div className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                SpinVerse
              </div>
              <div className="text-sm text-gray-400">
                Transform spins into epic stories
              </div>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex items-center space-x-6">
            <button
              className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-md hover:bg-gray-800/50 transition-all duration-200"
              onClick={openTerms}
            >
              Terms and Conditions
            </button>
          </div>

          {/* Right side - Copyright */}
          <div className="text-sm text-gray-500 text-center md:text-right">
            <div>© {currentYear} SpinVerse</div>
            <div className="text-xs mt-1">Interactive Storytelling Platform</div>
          </div>
        </div>
      </div>

    </footer>
  );
}