import { WheelConfig, WheelSegment } from '@/types/wheel';

// Theme color palettes
export const THEME_COLORS = {
  'startup': {
    primary: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    secondary: ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed']
  },
  'default': {
    primary: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'],
    secondary: ['#ff5252', '#26c6da', '#42a5f5', '#66bb6a', '#ffca28', '#e91e63', '#3f51b5', '#9c27b0']
  }
} as const;

// Predefined wheel configurations for different themes
export const WHEEL_THEMES = {
  'startup-industry': {
    segments: [
      { id: 'fintech', text: 'FinTech', color: '#3b82f6' },
      { id: 'healthtech', text: 'HealthTech', color: '#10b981' },
      { id: 'edtech', text: 'EdTech', color: '#f59e0b' },
      { id: 'saas', text: 'SaaS', color: '#8b5cf6' },
      { id: 'ecommerce', text: 'E-commerce', color: '#ef4444' },
      { id: 'ai', text: 'AI/ML', color: '#06b6d4' },
      { id: 'gaming', text: 'Gaming', color: '#f97316' },
      { id: 'crypto', text: 'Blockchain', color: '#84cc16' }
    ],
    size: 400,
    theme: 'startup' as const
  }
} as const;

// Utility function to create custom wheel with theme colors
export function createThemedWheel(
  segments: string[], 
  theme: keyof typeof THEME_COLORS = 'default',
  size: number = 400
): WheelConfig {
  const colors = THEME_COLORS[theme];
  
  return {
    segments: segments.map((text, index) => ({
      id: `segment-${index}`,
      text,
      color: colors.primary[index % colors.primary.length],
      textColor: undefined // Auto-calculated based on background
    })),
    size,
    spinDuration: 3000,
    friction: 0.985,
    theme
  };
}

// Utility function to get a predefined themed wheel
export function getThemedWheel(wheelType: keyof typeof WHEEL_THEMES): WheelConfig {
  const baseConfig = WHEEL_THEMES[wheelType];
  return {
    ...baseConfig,
    spinDuration: 3000,
    friction: 0.985
  };
}

// Utility function to create evenly distributed color segments
export function createColoredSegments(
  segments: string[],
  colors?: string[]
): WheelSegment[] {
  const defaultColors = THEME_COLORS.default.primary;
  const segmentColors = colors || defaultColors;
  
  return segments.map((text, index) => ({
    id: `segment-${index}`,
    text,
    color: segmentColors[index % segmentColors.length]
  }));
}