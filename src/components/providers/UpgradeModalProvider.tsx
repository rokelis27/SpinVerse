'use client';

import { UpgradeFlow } from '@/components/upgrade/UpgradeFlow';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';

interface UpgradeModalProviderProps {
  children: React.ReactNode;
}

export function UpgradeModalProvider({ children }: UpgradeModalProviderProps) {
  const { isOpen, triggerFeature, closeModal } = useUpgradeModal();

  return (
    <>
      {children}
      <UpgradeFlow
        isOpen={isOpen}
        onClose={closeModal}
        triggerFeature={triggerFeature}
      />
    </>
  );
}