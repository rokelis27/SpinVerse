import { SequenceTheme, SequenceStep, SequenceBranch, SequenceCondition } from './sequence';
import { WheelSegment, WheelConfig } from './wheel';

// Builder-specific extensions
export interface UserSequence extends SequenceTheme {
  // Metadata
  createdBy: string;
  createdAt: string;
  lastModified: string;
  version: string;
  isPublic: boolean;
  tags: string[];
  
  // Template inheritance
  baseTemplate?: string; // 'mystical-academy' | 'survival-tournament' | 'custom'
  isCustom: boolean;
}

export interface WheelSegmentBuilder extends WheelSegment {
  // Enhanced builder properties
  description?: string; // User-friendly description
  icon?: string; // Visual icon for builder
}

export interface SequenceStepBuilder extends SequenceStep {
  // Builder-specific properties
  isCustom: boolean;
  position?: { x: number; y: number }; // For future canvas positioning
  
  // Enhanced configuration
  wheelConfig: WheelConfigBuilder;
}

export interface WheelConfigBuilder extends WheelConfig {
  segments: WheelSegmentBuilder[];
}

// Builder UI state
export interface BuilderUIState {
  currentSequence: UserSequence | null;
  selectedStepIndex: number;
  isDirty: boolean;
  isPreviewMode: boolean;
}

// Validation
export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  message: string;
  stepIndex?: number;
  segmentId?: string;
  autoFix?: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}