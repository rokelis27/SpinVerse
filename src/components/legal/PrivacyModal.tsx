'use client';

import { useEffect } from 'react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Load iubenda script when modal opens
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function (w,d) {
          var loader = function () {
            var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; 
            s.src="https://cdn.iubenda.com/iubenda.js"; 
            tag.parentNode.insertBefore(s,tag);
          }; 
          if(w.addEventListener){
            w.addEventListener("load", loader, false);
          }else if(w.attachEvent){
            w.attachEvent("onload", loader);
          }else{
            w.onload = loader;
          }
        })(window, document);
      `;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Privacy Policy
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center shadow-lg"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          <div className="prose prose-invert max-w-none">
            <div className="text-center mb-6">
              {/* iubenda Privacy Policy embed */}
              <a 
                href="https://www.iubenda.com/privacy-policy/21489467" 
                className="iubenda-white iubenda-noiframe iubenda-embed iubenda-noiframe inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl" 
                title="Privacy Policy"
              >
                View Privacy Policy
              </a>
            </div>

            <div className="text-sm text-gray-400 text-center mt-4">
              <p>Our Privacy Policy is hosted by iubenda and details how we collect, use, and protect your personal information.</p>
              <p className="mt-2">Click the button above to view our complete Privacy Policy in a new window.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}