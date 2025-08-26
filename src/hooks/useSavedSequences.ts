'use client';

import { useState, useEffect } from 'react';
import { UserSequence } from '@/types/builder';

export function useSavedSequences() {
  const [savedSequences, setSavedSequences] = useState<UserSequence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedSequences();
  }, []);

  const loadSavedSequences = () => {
    try {
      const saved = localStorage.getItem('spinverse-custom-sequences');
      if (saved) {
        const sequences: UserSequence[] = JSON.parse(saved);
        setSavedSequences(sequences.sort((a, b) => 
          new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to load saved sequences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSequence = (sequenceId: string) => {
    try {
      const updated = savedSequences.filter(seq => seq.id !== sequenceId);
      localStorage.setItem('spinverse-custom-sequences', JSON.stringify(updated));
      setSavedSequences(updated);
    } catch (error) {
      console.error('Failed to delete sequence:', error);
    }
  };

  const refreshSequences = () => {
    loadSavedSequences();
  };

  return {
    savedSequences,
    isLoading,
    deleteSequence,
    refreshSequences
  };
}