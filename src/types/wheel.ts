export interface WheelSegment {
  id: string;
  text: string;
  color: string;
  textColor?: string;
  weight?: number; // For weighted probability (future feature)
}

export interface WheelConfig {
  segments: readonly WheelSegment[] | WheelSegment[];
  size: number;
  spinDuration: number;
  friction: number;
  theme?: 'default' | 'harry-potter' | 'marvel' | 'startup';
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