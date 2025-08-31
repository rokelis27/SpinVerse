'use client';

import { create } from 'zustand';

interface UpgradeModalState {
  isOpen: boolean;
  triggerFeature?: 'sequences' | 'steps' | 'options' | 'ai' | 'storage';
  openModal: (triggerFeature?: 'sequences' | 'steps' | 'options' | 'ai' | 'storage') => void;
  closeModal: () => void;
}

export const useUpgradeModal = create<UpgradeModalState>((set) => ({
  isOpen: false,
  triggerFeature: undefined,
  openModal: (triggerFeature) => set({ isOpen: true, triggerFeature }),
  closeModal: () => set({ isOpen: false, triggerFeature: undefined }),
}));