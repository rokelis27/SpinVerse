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
 * Enhanced Harry Potter-specific conditional logic
 */
export function applyConditionalWeights(
  segments: WheelSegment[],
  previousResults: Record<string, string>
): WheelSegment[] {
  return segments.map(segment => {
    let adjustedWeight = segment.weight || (segment.rarity ? RARITY_WEIGHTS[segment.rarity] : 25);
    
    // === HOUSE SORTING CONDITIONAL LOGIC ===
    const origin = previousResults.origin;
    
    // SLYTHERIN: Traditionally Pure-blood dominated
    if (segment.id === 'slytherin') {
      if (origin === 'pure-blood') adjustedWeight *= 2.2; // 120% increase - Strong family traditions
      if (origin === 'half-blood') adjustedWeight *= 0.7;  // 30% decrease - Some prejudice
      if (origin === 'muggle-born') adjustedWeight *= 0.3; // 70% decrease - Major prejudice
      if (origin === 'squib') adjustedWeight *= 1.6;       // 60% increase - Desperation for magical belonging
    }
    
    // GRYFFINDOR: Values bravery over blood status
    if (segment.id === 'gryffindor') {
      if (origin === 'pure-blood') adjustedWeight *= 0.9;   // 10% decrease - Less common but not rare
      if (origin === 'half-blood') adjustedWeight *= 1.3;   // 30% increase - Like Harry Potter
      if (origin === 'muggle-born') adjustedWeight *= 1.5;  // 50% increase - Like Hermione
      if (origin === 'squib') adjustedWeight *= 1.2;        // 20% increase - Proving magical worth
    }
    
    // HUFFLEPUFF: Most accepting of all backgrounds
    if (segment.id === 'hufflepuff') {
      if (origin === 'pure-blood') adjustedWeight *= 0.8;   // 20% decrease - Less prestigious
      if (origin === 'half-blood') adjustedWeight *= 1.4;   // 40% increase - Welcomes mixed heritage
      if (origin === 'muggle-born') adjustedWeight *= 1.6;  // 60% increase - Most welcoming house
      if (origin === 'squib') adjustedWeight *= 1.8;        // 80% increase - Most accepting of magical struggles
    }
    
    // RAVENCLAW: Values intelligence regardless of blood
    if (segment.id === 'ravenclaw') {
      if (origin === 'pure-blood') adjustedWeight *= 1.0;   // No change - Merit-based
      if (origin === 'half-blood') adjustedWeight *= 1.2;   // 20% increase - Analytical minds
      if (origin === 'muggle-born') adjustedWeight *= 1.3;  // 30% increase - Eager to learn magic
      if (origin === 'squib') adjustedWeight *= 0.9;        // 10% decrease - Self-doubt about magical ability
    }
    
    // === MAGIC SPECIALIZATION LOGIC ===
    const house = previousResults.house;
    
    // Light Magic Specializations
    if (segment.id === 'healing' && house === 'hufflepuff') adjustedWeight *= 1.6;
    if (segment.id === 'protection' && house === 'gryffindor') adjustedWeight *= 1.5;
    if (segment.id === 'patronus' && house === 'gryffindor') adjustedWeight *= 1.8;
    if (segment.id === 'transfiguration' && house === 'ravenclaw') adjustedWeight *= 1.4;
    
    // Advanced Magic Specializations  
    if (segment.id === 'legilimency' && house === 'slytherin') adjustedWeight *= 1.7;
    if (segment.id === 'occlumency' && house === 'slytherin') adjustedWeight *= 1.6;
    if (segment.id === 'advanced-potions' && house === 'slytherin') adjustedWeight *= 1.5;
    if (segment.id === 'ancient-runes' && house === 'ravenclaw') adjustedWeight *= 1.8;
    if (segment.id === 'dark-arts' && house === 'slytherin') adjustedWeight *= 2.0;
    
    // Reduce dark arts for other houses
    if (segment.id === 'dark-arts' && ['gryffindor', 'hufflepuff'].includes(house)) {
      adjustedWeight *= 0.1; // 90% decrease
    }
    
    // === SCHOOL PERFORMANCE CONDITIONAL LOGIC ===
    const schoolPerf = previousResults['school-performance'];
    
    // Wand selection based on school performance
    if (schoolPerf === 'quidditch-captain') {
      if (segment.id === 'cherry-dragon' || segment.id === 'rowan-dragon') adjustedWeight *= 1.5; // Fast, agile wands
    }
    if (schoolPerf === 'head-student') {
      if (segment.id === 'holly-phoenix' || segment.id === 'elder-phoenix') adjustedWeight *= 1.8; // Leadership wands
    }
    if (schoolPerf === 'top-grades') {
      if (segment.id === 'oak-unicorn' || segment.id === 'birch-unicorn') adjustedWeight *= 1.4; // Reliable study wands
    }
    if (schoolPerf === 'dueling-champion') {
      if (segment.id === 'ebony-dragon' || segment.id === 'yew-phoenix') adjustedWeight *= 1.6; // Combat wands
    }
    
    // Pet selection based on school performance
    if (schoolPerf === 'quidditch-captain' && segment.id === 'snowy-owl') adjustedWeight *= 1.5;
    if (schoolPerf === 'head-student' && (segment.id === 'snowy-owl' || segment.id === 'phoenix')) adjustedWeight *= 1.4;
    if (schoolPerf === 'rule-breaker' && (segment.id === 'ferret' || segment.id === 'snake')) adjustedWeight *= 1.6;
    if (schoolPerf === 'quiet-genius' && (segment.id === 'tabby-cat' || segment.id === 'bowtruckle')) adjustedWeight *= 1.3;
    if (schoolPerf === 'class-clown' && segment.id === 'pygmy-puff') adjustedWeight *= 1.8;
    
    // === CAREER CONDITIONAL LOGIC ===
    const purpose = previousResults.purpose;
    const magicSpec = previousResults['light-magic'] || previousResults['dark-magic'];
    
    // Hero Career Logic
    if (segment.id === 'auror') {
      if (purpose === 'defeat-voldemort') adjustedWeight *= 2.0;
      if (purpose === 'become-auror') adjustedWeight *= 2.5;
      if (house === 'gryffindor') adjustedWeight *= 1.4;
      if (magicSpec === 'protection') adjustedWeight *= 1.3;
      if (schoolPerf === 'dueling-champion') adjustedWeight *= 1.6;
      if (schoolPerf === 'quidditch-captain') adjustedWeight *= 1.3; // Leadership experience
    }
    
    if (segment.id === 'hit-wizard') {
      if (house === 'slytherin') adjustedWeight *= 1.5;
      if (schoolPerf === 'dueling-champion') adjustedWeight *= 1.8;
      if (schoolPerf === 'rule-breaker') adjustedWeight *= 1.4;
    }
    
    if (segment.id === 'curse-breaker') {
      if (house === 'ravenclaw') adjustedWeight *= 1.6;
      if (schoolPerf === 'top-grades') adjustedWeight *= 1.5;
      if (schoolPerf === 'quiet-genius') adjustedWeight *= 1.4;
    }
    
    if (segment.id === 'dragon-keeper') {
      if (house === 'gryffindor') adjustedWeight *= 1.4;
      if (schoolPerf === 'quidditch-star') adjustedWeight *= 1.3; // Athletic ability
    }
    
    // Scholar Career Logic
    if (segment.id === 'potions-master') {
      if (magicSpec === 'advanced-potions') adjustedWeight *= 2.0;
      if (house === 'slytherin') adjustedWeight *= 1.6;
      if (purpose === 'master-potions') adjustedWeight *= 2.5;
      if (schoolPerf === 'top-grades') adjustedWeight *= 1.4;
      if (schoolPerf === 'quiet-genius') adjustedWeight *= 1.3;
    }
    
    if (segment.id === 'unspeakable') {
      if (house === 'ravenclaw') adjustedWeight *= 1.8;
      if (magicSpec === 'legilimency' || magicSpec === 'ancient-runes') adjustedWeight *= 1.5;
      if (schoolPerf === 'head-student') adjustedWeight *= 1.4;
      if (schoolPerf === 'top-grades') adjustedWeight *= 1.6;
    }
    
    if (segment.id === 'herbology-professor' && purpose === 'teach-hogwarts') adjustedWeight *= 1.8;
    if (segment.id === 'charms-professor' && schoolPerf === 'popular-student') adjustedWeight *= 1.3;
    if (segment.id === 'magical-researcher' && schoolPerf === 'quiet-genius') adjustedWeight *= 1.5;
    
    // Nature Career Logic
    if (segment.id === 'magizoologist' && purpose === 'save-creatures') adjustedWeight *= 2.0;
    if (segment.id === 'phoenix-whisperer' && magicSpec === 'patronus') adjustedWeight *= 1.8;
    if (segment.id === 'creature-healer' && magicSpec === 'healing') adjustedWeight *= 1.6;
    
    // === SPELL CONDITIONAL LOGIC ===
    if (segment.id === 'avada-kedavra') {
      if (house === 'slytherin' && magicSpec === 'dark-arts') adjustedWeight *= 3.0;
      else adjustedWeight *= 0.05; // Extremely rare for non-dark wizards
    }
    
    if (segment.id === 'expecto-patronum') {
      if (magicSpec === 'patronus') adjustedWeight *= 2.5;
      if (house === 'gryffindor') adjustedWeight *= 1.5;
      if (purpose === 'defeat-voldemort') adjustedWeight *= 1.4;
    }
    
    if (segment.id === 'protego' && magicSpec === 'protection') adjustedWeight *= 1.8;
    if (segment.id === 'stupefy' && house === 'slytherin') adjustedWeight *= 1.3;
    
    return {
      ...segment,
      weight: Math.max(adjustedWeight, 1) // Ensure minimum weight of 1
    };
  });
}