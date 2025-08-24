import { WheelSegment, RarityLevel } from '@/types/wheel';

// Default weights based on rarity levels
export const RARITY_WEIGHTS = {
  common: 40,      // 40% base probability
  uncommon: 30,    // 30% base probability  
  rare: 20,        // 20% base probability
  legendary: 10,   // 10% base probability
} as const;

// Visual indicators for rarity levels
export const RARITY_INDICATORS = {
  common: '⚫',     // No special indicator
  uncommon: '🔵',  // Blue circle
  rare: '🟡',      // Yellow circle
  legendary: '🟠', // Orange circle
} as const;

/**
 * Calculate weighted probability for wheel segment selection
 * Uses weights if provided, otherwise uses rarity-based weights, 
 * falls back to equal distribution
 */
export function calculateSegmentProbabilities(segments: readonly WheelSegment[]): number[] {
  const weights = segments.map(segment => {
    // Use explicit weight if provided
    if (segment.weight && segment.weight > 0) {
      return segment.weight;
    }
    
    // Use rarity-based weight
    if (segment.rarity && RARITY_WEIGHTS[segment.rarity]) {
      return RARITY_WEIGHTS[segment.rarity];
    }
    
    // Default equal distribution
    return 25; // 100 / 4 segments = 25 each (adjust based on segment count)
  });
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  // Convert weights to probabilities (0-1 range)
  return weights.map(weight => weight / totalWeight);
}

/**
 * Select a segment index based on weighted probabilities
 * Returns the index of the selected segment
 */
export function selectWeightedSegment(segments: readonly WheelSegment[]): number {
  const probabilities = calculateSegmentProbabilities(segments);
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (let i = 0; i < probabilities.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random <= cumulativeProbability) {
      return i;
    }
  }
  
  // Fallback to last segment (should rarely happen)
  return segments.length - 1;
}

/**
 * Calculate the target angle for a specific segment based on weighted selection
 * This ensures the wheel lands on the intended segment after weighted calculation
 */
export function calculateTargetAngle(
  segmentIndex: number, 
  totalSegments: number, 
  extraRotations: number = 3
): number {
  const segmentAngle = (2 * Math.PI) / totalSegments;
  const segmentCenterAngle = (segmentIndex * segmentAngle) + (segmentAngle / 2);
  
  // Add extra full rotations for dramatic effect
  const totalAngle = (extraRotations * 2 * Math.PI) + segmentCenterAngle;
  
  // The wheel rotates clockwise, but we measure counter-clockwise, so we need to invert
  return -totalAngle - Math.PI / 2;
}

/**
 * Get visual rarity indicator for segment
 */
export function getRarityIndicator(rarity?: RarityLevel): string {
  if (!rarity || rarity === 'common') return '';
  return RARITY_INDICATORS[rarity];
}

/**
 * Find which segment the pointer is pointing to based on angle and proportional segments
 */
export function findSegmentByAngle(
  angle: number,
  segments: readonly WheelSegment[]
): number {
  const probabilities = calculateSegmentProbabilities(segments);
  const segmentAngles = probabilities.map(prob => prob * 2 * Math.PI);
  
  // Normalize angle to 0-2π range
  let normalizedAngle = angle;
  while (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
  while (normalizedAngle >= 2 * Math.PI) normalizedAngle -= 2 * Math.PI;
  
  // Find which segment this angle falls into
  let cumulativeAngle = 0;
  
  console.log(`Looking for angle ${normalizedAngle} in segments:`);
  
  for (let i = 0; i < segmentAngles.length; i++) {
    const segmentStart = cumulativeAngle;
    const segmentEnd = cumulativeAngle + segmentAngles[i];
    
    console.log(`Segment ${i} (${segments[i].text}): ${segmentStart} to ${segmentEnd}`);
    
    if (normalizedAngle >= segmentStart && normalizedAngle < segmentEnd) {
      console.log(`✓ Found in segment ${i}: ${segments[i].text}`);
      return i;
    }
    
    cumulativeAngle = segmentEnd;
  }
  
  // Fallback to last segment
  return segments.length - 1;
}

/**
 * Add contextual probability weights based on previous choices
 * This implements the conditional logic mentioned in TODO
 */
export function applyConditionalWeights(
  segments: WheelSegment[],
  previousResults: Record<string, string>
): WheelSegment[] {
  return segments.map(segment => {
    let adjustedWeight = segment.weight || (segment.rarity ? RARITY_WEIGHTS[segment.rarity] : 25);
    
    // Example: Harry Potter conditional logic
    // If Pure-blood origin, increase Slytherin probability
    if (segment.id === 'slytherin' && previousResults.origin === 'pure-blood') {
      adjustedWeight *= 1.5; // 50% increase
    }
    
    // If Gryffindor house, decrease dark spell probabilities
    if (previousResults.house === 'gryffindor') {
      const darkSpells = ['stupefy', 'sectumsempra']; // Example dark spells
      if (darkSpells.includes(segment.id)) {
        adjustedWeight *= 0.3; // 70% decrease
      }
    }
    
    return {
      ...segment,
      weight: adjustedWeight
    };
  });
}