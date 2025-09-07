'use client';

import { useTermsModal, useCookieModal, usePrivacyModal } from '@/components/providers/TermsModalProvider';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { openTerms } = useTermsModal();
  const { openCookies } = useCookieModal();
  const { openPrivacy } = usePrivacyModal();

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
              <div className="text-sm bg-gradient-to-r from-gray-300 to-gray-100 bg-clip-text text-transparent font-medium">
                Transform spins into epic stories
              </div>
            </div>
          </div>

          {/* Center - Links */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              className="text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text text-sm px-3 py-2 rounded-md hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300 font-medium"
              onClick={openTerms}
            >
              Terms and Conditions
            </button>
            <button
              className="text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-purple-400 hover:to-pink-400 hover:bg-clip-text text-sm px-3 py-2 rounded-md hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300 font-medium"
              onClick={openPrivacy}
            >
              Privacy Policy
            </button>
            <button
              className="text-gray-300 hover:text-transparent hover:bg-gradient-to-r hover:from-pink-400 hover:to-cyan-400 hover:bg-clip-text text-sm px-3 py-2 rounded-md hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300 font-medium"
              onClick={openCookies}
            >
              Cookie Policy
            </button>
          </div>

          {/* Right side - Copyright */}
          <div className="text-sm text-center md:text-right">
            <div className="bg-gradient-to-r from-gray-400 to-gray-200 bg-clip-text text-transparent font-medium">
              © {currentYear} SpinVerse
            </div>
            <div className="text-xs mt-1 bg-gradient-to-r from-gray-500 to-gray-300 bg-clip-text text-transparent">
              Interactive Storytelling Platform
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}