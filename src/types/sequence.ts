export interface SequenceCondition {
  stepId: string;
  segmentId: string;
  operator?: 'equals' | 'not_equals' | 'in' | 'not_in';
  value?: string | string[];
}

export interface WeightOverride {
  segmentId: string;
  newWeight: number;
}

export interface SequenceBranch {
  conditions: SequenceCondition[];
  nextStepId: string;
  operator?: 'and' | 'or'; // How to combine multiple conditions (default: 'and')
  weightOverrides?: WeightOverride[]; // Override weights for the target step if this branch is taken
}

export interface StepMultiSpinConfig {
  enabled: boolean;
  mode: 'fixed' | 'dynamic'; // Fixed count or determined by previous step
  fixedCount?: number; // Number of spins (1-5) for fixed mode
  determinerStepId?: string; // ID of step that determines spin count for dynamic mode
  aggregateResults: boolean; // Whether to collect all results
}

export interface SequenceStep {
  id: string;
  title: string;
  wheelConfig: import('./wheel').WheelConfig;
  description?: string;
  branches?: SequenceBranch[]; // Conditional next steps
  defaultNextStep?: string; // Fallback if no branches match
  multiSpin?: StepMultiSpinConfig; // Step-level multi-spin configuration
}

export interface SequenceTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  steps: SequenceStep[]; // All possible steps (not necessarily linear)
  startStepId: string; // Which step to start with
  narrativeTemplate?: string; // For story generation
  narrativeTemplates?: Record<string, string>; // Multiple templates for different paths
}

export interface SequenceResult {
  stepId: string;
  spinResult: import('./wheel').SpinResult;
  timestamp: number;
  multiSpinResults?: import('./wheel').SpinResult[]; // Store all multi-spin results for aggregate mode
}

export interface SequenceState {
  currentTheme: SequenceTheme | null;
  currentStepId: string | null; // Changed from index to ID for branching support
  currentStepIndex: number; // Keep for backward compatibility, but will be calculated
  isActive: boolean;
  results: SequenceResult[];
  isTransitioning: boolean;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  multiSpinState: import('./wheel').MultiSpinState;
}

export interface SequenceActions {
  startSequence: (theme: SequenceTheme) => void;
  completeStep: (result: import('./wheel').SpinResult) => void;
  nextStep: () => void;
  resetSequence: () => void;
  goToStep: (stepIndex: number) => void;
  setTransitioning: (isTransitioning: boolean) => void;
  
  // Multi-spin actions
  initializeStepMultiSpin: (stepId: string, config: StepMultiSpinConfig, spinCount: number) => void;
  executeNextMultiSpin: () => Promise<void>;
  completeMultiSpin: (results: import('./wheel').SpinResult[]) => void;
  cancelMultiSpin: () => void;
}