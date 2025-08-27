import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SequenceState, SequenceActions, SequenceTheme, SequenceResult } from '@/types/sequence';
import { SpinResult } from '@/types/wheel';
import { getNextStepId, findStepById, isSequenceComplete, getSequencePath, applyWeightOverrides } from '@/utils/branchingUtils';

interface SequenceStore extends SequenceState, SequenceActions {}

export const useSequenceStore = create<SequenceStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentTheme: null,
      currentStepId: null,
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
        const startStepId = theme.startStepId || theme.steps[0]?.id;
        const totalSteps = getSequencePath(theme, []).length; // Get expected path length
        
        set({
          currentTheme: theme,
          currentStepId: startStepId,
          currentStepIndex: 0,
          isActive: true,
          results: [],
          isTransitioning: false,
          progress: {
            completed: 0,
            total: totalSteps,
            percentage: 0,
          },
        }, false, 'sequence/start');
      },

      completeStep: (spinResult: SpinResult) => {
        const { currentTheme, currentStepId, results, isInMultiSpinMode } = get();
        
        if (!currentTheme || !currentStepId) {
          return;
        }

        // Check if this step is already completed to prevent duplicates
        const existingResult = results.find(r => r.stepId === currentStepId);
        if (existingResult && !isInMultiSpinMode) {
          return;
        }

        const sequenceResult: SequenceResult = {
          stepId: currentStepId,
          spinResult,
          timestamp: Date.now(),
        };


        const newResults = [...results, sequenceResult];
        const completed = newResults.length;
        const expectedPath = getSequencePath(currentTheme, newResults);
        const total = expectedPath.length;

        set({
          results: newResults,
          progress: {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
          },
        }, false, 'sequence/completeStep');
      },

      nextStep: () => {
        const { currentTheme, currentStepId, results, isTransitioning } = get();
        
        if (!currentTheme || !currentStepId || isTransitioning) {
          return;
        }

        const currentStep = findStepById(currentTheme, currentStepId);
        if (!currentStep) {
          return;
        }

        // Use branching logic to determine next step and weight overrides
        const branchResult = getNextStepId(currentStep, results);
        
        if (!branchResult.nextStepId) {
          set({
            isTransitioning: false,
            // Keep isActive: true so results screen shows
          }, false, 'sequence/complete');
          return;
        }

        const nextStep = findStepById(currentTheme, branchResult.nextStepId);
        if (!nextStep) {
          return;
        }

        // Start transition
        set({ isTransitioning: true }, false, 'sequence/startTransition');

        // After transition animation, move to next step
        setTimeout(() => {
          // Apply weight overrides if any
          const stepWithOverrides = applyWeightOverrides(nextStep, branchResult.weightOverrides);
          
          // Update the theme with the modified step
          const updatedTheme = {
            ...currentTheme,
            steps: currentTheme.steps.map(step => 
              step.id === stepWithOverrides.id ? stepWithOverrides : step
            )
          };
          
          // Calculate new step index for backward compatibility
          const newStepIndex = currentTheme.steps.findIndex(s => s.id === branchResult.nextStepId);
          
          set({
            currentTheme: updatedTheme,
            currentStepId: branchResult.nextStepId,
            currentStepIndex: newStepIndex,
            isTransitioning: false,
          }, false, 'sequence/nextStep');
        }, 500);
      },

      resetSequence: () => {
        set({
          currentTheme: null,
          currentStepId: null,
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
    if (!state.currentTheme || !state.currentStepId) return null;
    return findStepById(state.currentTheme, state.currentStepId);
  });
};

export const useIsSequenceComplete = () => {
  return useSequenceStore(state => {
    if (!state.currentTheme) return false;
    return isSequenceComplete(state.currentTheme, state.results);
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