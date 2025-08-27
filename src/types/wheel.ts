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
  theme?: 'default' | 'mystical-academy' | 'survival-tournament' | 'detective-mystery' | 'underground-racing' | 'marvel' | 'startup';
}

export interface SpinResult {
  segment: WheelSegment;
  index: number;
  angle: number;
  timestamp: number;
}

export interface WheelPhysics {
  currentAngle: number;
  velocity: number;
  acceleration: number;
  isSpinning: boolean;
  targetAngle?: number;
}