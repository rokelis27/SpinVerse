'use client';

import { createContext, useContext, useState } from 'react';
import { TermsModal } from '@/components/legal/TermsModal';
import { CookieModal } from '@/components/legal/CookieModal';

interface LegalModalContextType {
  termsModal: {
    isOpen: boolean;
    openTerms: () => void;
    closeTerms: () => void;
  };
  cookieModal: {
    isOpen: boolean;
    openCookies: () => void;
    closeCookies: () => void;
  };
}

const LegalModalContext = createContext<LegalModalContextType | undefined>(undefined);

export function TermsModalProvider({ children }: { children: React.ReactNode }) {
  const [termsOpen, setTermsOpen] = useState(false);
  const [cookiesOpen, setCookiesOpen] = useState(false);

  const openTerms = () => setTermsOpen(true);
  const closeTerms = () => setTermsOpen(false);
  const openCookies = () => setCookiesOpen(true);
  const closeCookies = () => setCookiesOpen(false);

  return (
    <LegalModalContext.Provider value={{
      termsModal: { isOpen: termsOpen, openTerms, closeTerms },
      cookieModal: { isOpen: cookiesOpen, openCookies, closeCookies }
    }}>
      {children}
      <TermsModal isOpen={termsOpen} onClose={closeTerms} />
      <CookieModal isOpen={cookiesOpen} onClose={closeCookies} />
    </LegalModalContext.Provider>
  );
}

export function useTermsModal() {
  const context = useContext(LegalModalContext);
  if (context === undefined) {
    throw new Error('useTermsModal must be used within a TermsModalProvider');
  }
  return context.termsModal;
}

export function useCookieModal() {
  const context = useContext(LegalModalContext);
  if (context === undefined) {
    throw new Error('useCookieModal must be used within a TermsModalProvider');
  }
  return context.cookieModal;
}