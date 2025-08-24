export interface SequenceStep {
  id: string;
  title: string;
  wheelConfig: import('./wheel').WheelConfig;
  description?: string;
}

export interface SequenceTheme {
  id: string;
  name: string;
  description: string;
  color: string;
  steps: SequenceStep[];
  narrativeTemplate?: string; // For story generation
}

export interface SequenceResult {
  stepId: string;
  spinResult: import('./wheel').SpinResult;
  timestamp: number;
}

export interface SequenceState {
  currentTheme: SequenceTheme | null;
  currentStepIndex: number;
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