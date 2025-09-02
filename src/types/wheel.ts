export type RarityLevel = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface WheelSegment {
  id: string;
  text: string;
  color: string;
  textColor?: string;
  weight?: number; // Probability weight (1-100, default: 25 for even distribution)
  rarity?: RarityLevel; // Visual rarity indicator
}

export interface WheelConfig {
  segments: readonly WheelSegment[] | WheelSegment[];
  size: number;
  spinDuration: number;
  friction: number;
  theme?: 'default' | 'mystical-academy' | 'survival-tournament' | 'detective-mystery' | 'underground-racing' | 'world-cup-manager' | 'startup';
}

export interface SpinResult {
  segment: WheelSegment;
  index: number;
  angle: number;
  timestamp: number;
  stepId?: string; // For multi-spin tracking
  spinIndex?: number; // 0 for initial, 1+ for multi-spins
}

export interface MultiSpinState {
  isActive: boolean;
  currentCount: number;
  totalCount: number;
  results: SpinResult[];
  currentStepId: string;
  aggregateResults: boolean;
}

export interface WheelPhysics {
  currentAngle: number;
  velocity: number;
  acceleration: number;
  isSpinning: boolean;
  targetAngle?: number;
}