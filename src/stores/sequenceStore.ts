import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SequenceState, SequenceActions, SequenceTheme, SequenceResult, StepMultiSpinConfig } from '@/types/sequence';
import { SpinResult, MultiSpinState } from '@/types/wheel';
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
      multiSpinState: {
        isActive: false,
        currentCount: 0,
        totalCount: 0,
        results: [],
        currentStepId: '',
        aggregateResults: false,
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
          multiSpinState: {
            isActive: false,
            currentCount: 0,
            totalCount: 0,
            results: [],
            currentStepId: '',
            aggregateResults: false,
          },
        }, false, 'sequence/start');
      },

      completeStep: (spinResult: SpinResult) => {
        // Add call tracking and debounce protection
        const now = Date.now();
        const lastCallKey = `${get().currentStepId}-${spinResult.segment.text}`;
        const lastCallTime = (window as any).lastCompleteStepTimes?.[lastCallKey] || 0;
        
        if (now - lastCallTime < 100) {
          return; // Block duplicate call within 100ms
        }
        
        // Store call time
        (window as any).lastCompleteStepTimes = (window as any).lastCompleteStepTimes || {};
        (window as any).lastCompleteStepTimes[lastCallKey] = now;
        
        
        // Take a fresh snapshot of the state at the beginning
        let state = get();
        let { currentTheme, currentStepId, results, multiSpinState } = state;
        
        if (!currentTheme || !currentStepId) {
          return;
        }


        // Handle active multi-spin - collect this result
        // Use initial state snapshot to avoid mid-function state changes
        if (multiSpinState.isActive && multiSpinState.currentStepId === currentStepId) {
          // Ensure the spin result has proper stepId and spinIndex
          const enhancedSpinResult = {
            ...spinResult,
            stepId: multiSpinState.currentStepId,
            spinIndex: multiSpinState.currentCount + 1
          };
          const updatedResults = [...multiSpinState.results, enhancedSpinResult];
          const newCount = multiSpinState.currentCount + 1;
          
          set({
            multiSpinState: {
              ...multiSpinState,
              currentCount: newCount,
              results: updatedResults
            }
          }, false, 'multiSpin/collectResult');

          // Check if multi-spin sequence is complete
          if (newCount >= multiSpinState.totalCount) {
            // Complete multi-spin after a small delay to ensure UI updates
            setTimeout(() => {
              get().completeMultiSpin(updatedResults);
            }, 100);
          }
          return;
        }

        // Check if current step has multi-spin configuration  
        // IMPORTANT: Only check for multi-spin initialization if NOT currently active
        const currentStep = findStepById(currentTheme, currentStepId);
        if (currentStep?.multiSpin?.enabled && !multiSpinState.isActive) {
          // Determine spin count based on mode
          let spinCount = 1;
          if (currentStep.multiSpin.mode === 'fixed' && currentStep.multiSpin.fixedCount) {
            spinCount = currentStep.multiSpin.fixedCount;
          } else if (currentStep.multiSpin.mode === 'dynamic' && currentStep.multiSpin.determinerStepId) {
            // Find the result from the determiner step to get spin count
            const determinerResult = results.find(r => r.stepId === currentStep.multiSpin?.determinerStepId);
            if (determinerResult) {
              // Parse spin count using ID-based approach for reliability
              const segmentId = determinerResult.spinResult.segment.id;
              
              // Parse spin count from standardized segment IDs
              const spinCountMap: Record<string, number> = {
                '1-spin': 1,
                '2-spins': 2,
                '3-spins': 3,
                '4-spins': 4,
                '5-spins': 5
              };
              
              const parsedSpinCount = spinCountMap[segmentId];
              
              // Validation with fallback
              if (typeof parsedSpinCount === 'number' && parsedSpinCount >= 1 && parsedSpinCount <= 5) {
                spinCount = parsedSpinCount;
              } else {
                spinCount = 1;
              }
            } else {
              spinCount = 1;
            }
          }
          
          if (spinCount > 1) {
            // Initialize multi-spin with this first result
            const firstSpinResult = {
              ...spinResult,
              stepId: currentStepId,
              spinIndex: 1
            };
            set({
              multiSpinState: {
                isActive: true,
                currentCount: 1, // This represents spins completed, including this one
                totalCount: spinCount,
                results: [firstSpinResult],
                currentStepId: currentStepId,
                aggregateResults: currentStep.multiSpin.aggregateResults
              }
            }, false, 'multiSpin/initialize');
            return; // Stay in multi-spin mode, don't complete step yet
          } else if (spinCount === 1) {
            // When determiner step results in 1 spin, complete step normally and advance
            
            // Complete the step first
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
            }, false, 'sequence/completeSingleSpinMultiStep');
            
            // Advance to next step after a short delay
            setTimeout(() => {
              get().nextStep();
            }, 2500);
            
            return; // Don't continue with normal completion flow
          }
        }

        // Check if this step is already completed to prevent duplicates
        const existingResult = results.find(r => r.stepId === currentStepId);
        if (existingResult && !multiSpinState.isActive) {
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

        // Start transition and immediately reset multi-spin state
        set({ 
          isTransitioning: true,
          multiSpinState: {
            isActive: false,
            currentCount: 0,
            totalCount: 0,
            results: [],
            currentStepId: '',
            aggregateResults: false,
          }
        }, false, 'sequence/startTransition');

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
          multiSpinState: {
            isActive: false,
            currentCount: 0,
            totalCount: 0,
            results: [],
            currentStepId: '',
            aggregateResults: false,
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

      // Multi-spin actions
      initializeStepMultiSpin: (stepId: string, config: StepMultiSpinConfig, spinCount: number) => {
        set({
          multiSpinState: {
            isActive: true,
            currentCount: 0,
            totalCount: spinCount,
            results: [],
            currentStepId: stepId,
            aggregateResults: config.aggregateResults
          }
        }, false, 'multiSpin/initialize');

        // Multi-spin initialized - user needs to manually spin the wheel
      },

      executeNextMultiSpin: async () => {
        const { multiSpinState, currentTheme } = get();
        
        if (!multiSpinState.isActive || !currentTheme) {
          return;
        }

        if (multiSpinState.currentCount >= multiSpinState.totalCount) {
          // Multi-spin sequence complete
          get().completeMultiSpin(multiSpinState.results);
          return;
        }

        // Wait for visual delay between spins
        await new Promise(resolve => setTimeout(resolve, 800));

        // Find the multi-spin step for spinning
        const targetStep = findStepById(currentTheme, multiSpinState.currentStepId);
        
        if (!targetStep) {
          get().cancelMultiSpin();
          return;
        }

        // Simulate automatic spin result (this would typically come from the wheel component)
        // For now, we'll create a mock result - in real implementation, this would trigger a wheel spin
        const segments = targetStep.wheelConfig.segments;
        const weights = segments.map(s => s.weight || 25);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let randomWeight = Math.random() * totalWeight;
        let selectedIndex = 0;
        
        for (let i = 0; i < weights.length; i++) {
          randomWeight -= weights[i];
          if (randomWeight <= 0) {
            selectedIndex = i;
            break;
          }
        }

        const spinResult: SpinResult = {
          segment: segments[selectedIndex],
          index: selectedIndex,
          angle: Math.random() * 360,
          timestamp: Date.now(),
          stepId: multiSpinState.currentStepId,
          spinIndex: multiSpinState.currentCount + 1
        };

        const updatedResults = [...multiSpinState.results, spinResult];
        
        set({
          multiSpinState: {
            ...multiSpinState,
            currentCount: multiSpinState.currentCount + 1,
            results: updatedResults
          }
        }, false, 'multiSpin/executeNext');

        // Continue with next spin
        setTimeout(() => {
          get().executeNextMultiSpin();
        }, 100);
      },

      completeMultiSpin: (results: SpinResult[]) => {
        const { multiSpinState } = get();
        
        if (!multiSpinState.isActive || results.length === 0) return;

        // Store the current step ID before resetting the multi-spin state
        const currentMultiSpinStepId = multiSpinState.currentStepId;

        // Determine final result based on aggregation setting
        let finalResult: SpinResult;
        
        if (multiSpinState.aggregateResults) {
          // For aggregate mode, use the first result but store all results for story generation
          finalResult = results[0];
        } else {
          // For override mode, use the last result
          finalResult = results[results.length - 1];
        }

        // Complete the step with the final result (without triggering another multi-spin)
        const state = get();
        const { currentTheme } = state;
        
        if (!currentTheme) {
          return;
        }

        const sequenceResult: SequenceResult = {
          stepId: currentMultiSpinStepId,
          spinResult: finalResult,
          timestamp: Date.now(),
          multiSpinResults: multiSpinState.aggregateResults ? results : undefined,
        };

        const newResults = [...state.results, sequenceResult];
        const completed = newResults.length;
        const expectedPath = getSequencePath(currentTheme, newResults);
        const total = expectedPath.length;

        // Reset multi-spin state AND update results in one atomic operation
        set({
          results: newResults,
          progress: {
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
          },
          multiSpinState: {
            isActive: false,
            currentCount: 0,
            totalCount: 0,
            results: [],
            currentStepId: '',
            aggregateResults: false,
          }
        }, false, 'sequence/completeMultiSpinStep');

        // Advance to next step after multi-spin completion
        get().nextStep();
      },

      cancelMultiSpin: () => {
        set({
          multiSpinState: {
            isActive: false,
            currentCount: 0,
            totalCount: 0,
            results: [],
            currentStepId: '',
            aggregateResults: false,
          }
        }, false, 'multiSpin/cancel');
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