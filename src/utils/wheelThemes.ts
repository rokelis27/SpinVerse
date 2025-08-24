import { WheelConfig, WheelSegment } from '@/types/wheel';

// Theme color palettes
export const THEME_COLORS = {
  'harry-potter': {
    primary: ['#740001', '#1a472a', '#ffdb00', '#0e1a40'],
    secondary: ['#8b0000', '#2d5d3d', '#ffd700', '#1a2b5c']
  },
  'marvel': {
    primary: ['#e62429', '#1f3a93', '#00a652', '#f78f1e', '#9b2d7f'],
    secondary: ['#cc1e22', '#1a3280', '#008a45', '#e67c1a', '#8a2872']
  },
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
  'harry-potter-house': {
    segments: [
      { id: 'gryffindor', text: 'Gryffindor', color: '#740001' },
      { id: 'slytherin', text: 'Slytherin', color: '#1a472a' },
      { id: 'hufflepuff', text: 'Hufflepuff', color: '#ffdb00', textColor: '#000000' },
      { id: 'ravenclaw', text: 'Ravenclaw', color: '#0e1a40' }
    ],
    size: 400,
    theme: 'harry-potter' as const
  },
  
  'harry-potter-wand': {
    segments: [
      { id: 'holly', text: 'Holly & Phoenix', color: '#8b4513' },
      { id: 'oak', text: 'Oak & Dragon', color: '#654321' },
      { id: 'willow', text: 'Willow & Unicorn', color: '#daa520' },
      { id: 'maple', text: 'Maple & Phoenix', color: '#d2691e' },
      { id: 'birch', text: 'Birch & Dragon', color: '#f5deb3', textColor: '#000000' },
      { id: 'pine', text: 'Pine & Unicorn', color: '#228b22' }
    ],
    size: 400,
    theme: 'harry-potter' as const
  },

  'marvel-powers': {
    segments: [
      { id: 'strength', text: 'Super Strength', color: '#e62429' },
      { id: 'speed', text: 'Super Speed', color: '#ffd700', textColor: '#000000' },
      { id: 'flight', text: 'Flight', color: '#1f3a93' },
      { id: 'telepathy', text: 'Telepathy', color: '#9b2d7f' },
      { id: 'invisibility', text: 'Invisibility', color: '#4b0082' },
      { id: 'laser', text: 'Laser Vision', color: '#ff4500' },
      { id: 'healing', text: 'Healing Factor', color: '#00a652' },
      { id: 'tech', text: 'Tech Genius', color: '#f78f1e' }
    ],
    size: 400,
    theme: 'marvel' as const
  },

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