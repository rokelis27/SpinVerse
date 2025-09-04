'use client';

import { createContext, useContext, useState } from 'react';
import { TermsModal } from '@/components/legal/TermsModal';

interface TermsModalContextType {
  isOpen: boolean;
  openTerms: () => void;
  closeTerms: () => void;
}

const TermsModalContext = createContext<TermsModalContextType | undefined>(undefined);

export function TermsModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openTerms = () => setIsOpen(true);
  const closeTerms = () => setIsOpen(false);

  return (
    <TermsModalContext.Provider value={{ isOpen, openTerms, closeTerms }}>
      {children}
      <TermsModal isOpen={isOpen} onClose={closeTerms} />
    </TermsModalContext.Provider>
  );
}

export function useTermsModal() {
  const context = useContext(TermsModalContext);
  if (context === undefined) {
    throw new Error('useTermsModal must be used within a TermsModalProvider');
  }
  return context;
}