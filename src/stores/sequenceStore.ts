import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SequenceState, SequenceActions, SequenceTheme, SequenceResult } from '@/types/sequence';
import { SpinResult } from '@/types/wheel';

interface SequenceStore extends SequenceState, SequenceActions {}

export const useSequenceStore = create<SequenceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTheme: null,
      currentStepIndex: 0,
      isActive: false,
      results: [],
      isTransitioning: false,
      progress: {
        completed: 0,
        total: 0,
        percentage: 0,
      },

      // Actions
      startSequence: (theme: SequenceTheme) => {
        set({
          currentTheme: theme,
          currentStepIndex: 0,
          isActive: true,
          results: [],
          isTransitioning: false,
          progress: {
            completed: 0,
            total: theme.steps.length,
            percentage: 0,
          },
        }, false, 'sequence/start');
      },

      completeStep: (spinResult: SpinResult) => {
        const { currentTheme, currentStepIndex, results } = get();
        
        if (!currentTheme || currentStepIndex >= currentTheme.steps.length) {
          console.log('Invalid completeStep call - no theme or index out of bounds');
          return;
        }

        const currentStep = currentTheme.steps[currentStepIndex];
        
        // Check if this step is already completed to prevent duplicates
        const existingResult = results.find(r => r.stepId === currentStep.id);
        if (existingResult) {
          console.log('Step already completed, ignoring duplicate:', currentStep.id);
          return;
        }

        const sequenceResult: SequenceResult = {
          stepId: currentStep.id,
          spinResult,
          timestamp: Date.now(),
        };

        const newResults = [...results, sequenceResult];
        const completed = newResults.length;
        const total = currentTheme.steps.length;

        set({
          results: newResults,
          progress: {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
          },
        }, false, 'sequence/completeStep');

        // Note: Auto-advance is now handled by the component
      },

      nextStep: () => {
        const { currentTheme, currentStepIndex, isTransitioning } = get();
        
        if (!currentTheme || isTransitioning) {
          console.log('NextStep blocked - no theme or transitioning');
          return;
        }

        const nextIndex = currentStepIndex + 1;
        console.log(`NextStep: currentIndex=${currentStepIndex}, nextIndex=${nextIndex}, totalSteps=${currentTheme.steps.length}`);
        
        // Check if sequence is complete
        if (nextIndex >= currentTheme.steps.length) {
          console.log('Sequence complete!');
          set({
            isActive: false,
            isTransitioning: false,
          }, false, 'sequence/complete');
          return;
        }

        // Start transition
        set({ isTransitioning: true }, false, 'sequence/startTransition');

        // After transition animation, move to next step
        setTimeout(() => {
          set({
            currentStepIndex: nextIndex,
            isTransitioning: false,
          }, false, 'sequence/nextStep');
        }, 500);
      },

      resetSequence: () => {
        set({
          currentTheme: null,
          currentStepIndex: 0,
          isActive: false,
          results: [],
          isTransitioning: false,
          progress: {
            completed: 0,
            total: 0,
            percentage: 0,
          },
        }, false, 'sequence/reset');
      },

      goToStep: (stepIndex: number) => {
        const { currentTheme } = get();
        
        if (!currentTheme || stepIndex < 0 || stepIndex >= currentTheme.steps.length) {
          return;
        }

        set({
          currentStepIndex: stepIndex,
          isTransitioning: false,
        }, false, 'sequence/goToStep');
      },

      setTransitioning: (isTransitioning: boolean) => {
        set({ isTransitioning }, false, 'sequence/setTransitioning');
      },
    }),
    {
      name: 'sequence-store', // DevTools name
    }
  )
);

// Selectors for common use cases
export const useCurrentStep = () => {
  return useSequenceStore(state => {
    if (!state.currentTheme) return null;
    return state.currentTheme.steps[state.currentStepIndex] || null;
  });
};

export const useIsSequenceComplete = () => {
  return useSequenceStore(state => {
    if (!state.currentTheme) return false;
    return state.results.length >= state.currentTheme.steps.length;
  });
};

export const useSequenceNarrative = () => {
  return useSequenceStore(state => {
    if (!state.currentTheme || state.results.length === 0) return '';
    
    // Generate narrative from results
    const results = state.results.map(r => r.spinResult.segment.text);
    return results.join(' → ');
  });
};