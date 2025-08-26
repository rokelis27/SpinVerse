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

export interface SequenceStep {
  id: string;
  title: string;
  wheelConfig: import('./wheel').WheelConfig;
  description?: string;
  branches?: SequenceBranch[]; // Conditional next steps
  defaultNextStep?: string; // Fallback if no branches match
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
}

export interface SequenceActions {
  startSequence: (theme: SequenceTheme) => void;
  completeStep: (result: import('./wheel').SpinResult) => void;
  nextStep: () => void;
  resetSequence: () => void;
  goToStep: (stepIndex: number) => void;
  setTransitioning: (isTransitioning: boolean) => void;
}