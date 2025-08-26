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
 * Supports both Harry Potter and Hunger Games themes
 */
export function applyConditionalWeights(
  segments: WheelSegment[],
  previousResults: Record<string, string>,
  currentStepId?: string
): WheelSegment[] {
  return segments.map(segment => {
    let adjustedWeight = segment.weight || (segment.rarity ? RARITY_WEIGHTS[segment.rarity] : 25);
    
    // Determine theme based on segment IDs or current step
    const isHungerGames = currentStepId?.includes('-') || segment.id.startsWith('district-') || segment.id.includes('bloodbath') || segment.id.includes('survive');
    
    if (isHungerGames) {
      // Apply Hunger Games conditional logic
      adjustedWeight = applyHungerGamesConditionalWeights(segment, adjustedWeight, previousResults, currentStepId);
    } else {
      // Apply Harry Potter conditional logic
      adjustedWeight = applyHarryPotterConditionalWeights(segment, adjustedWeight, previousResults);
    }
    
    return {
      ...segment,
      weight: Math.max(adjustedWeight, 1) // Ensure minimum weight of 1
    };
  });
}

/**
 * Apply Harry Potter specific conditional logic
 */
function applyHarryPotterConditionalWeights(
  segment: WheelSegment,
  baseWeight: number,
  previousResults: Record<string, string>
): number {
  let adjustedWeight = baseWeight;
    
  // === HOUSE SORTING CONDITIONAL LOGIC ===
  const origin = previousResults.origin;
  
  // SLYTHERIN: Traditionally Pure-blood dominated
    if (segment.id === 'slytherin') {
      if (origin === 'pure-blood') adjustedWeight *= 2.2; // 120% increase - Strong family traditions
      if (origin === 'half-blood') adjustedWeight *= 0.7;  // 30% decrease - Some prejudice
      if (origin === 'muggle-born') adjustedWeight *= 0.3; // 70% decrease - Major prejudice
      if (origin === 'squib') adjustedWeight *= 1.6;       // 60% increase - Desperation for magical belonging
    }
    
    // COURAGE HOUSE: Values bravery over blood status
    if (segment.id === 'courage-house') {
      if (origin === 'ancient-lineage') adjustedWeight *= 0.9;   // Less common but not rare
      if (origin === 'mixed-heritage') adjustedWeight *= 1.3;   // Values diverse perspective
      if (origin === 'common-born') adjustedWeight *= 1.5;  // Proving themselves through courage
      if (origin === 'wildcard-origin') adjustedWeight *= 1.2;  // Proving magical worth
      if (origin === 'lost-bloodline') adjustedWeight *= 1.4; // Reclaiming honor
      if (origin === 'first-generation') adjustedWeight *= 1.6; // Fresh perspective on bravery
    }
    
    // LOYALTY HOUSE: Most accepting of all backgrounds
    if (segment.id === 'loyalty-house') {
      if (origin === 'ancient-lineage') adjustedWeight *= 0.8;   // Less prestigious
      if (origin === 'mixed-heritage') adjustedWeight *= 1.4;   // Welcomes mixed heritage
      if (origin === 'common-born') adjustedWeight *= 1.6;  // Most welcoming house
      if (origin === 'wildcard-origin') adjustedWeight *= 1.8;  // Most accepting of magical struggles
      if (origin === 'lost-bloodline') adjustedWeight *= 1.5; // Accepting of lost souls
      if (origin === 'first-generation') adjustedWeight *= 1.7; // Welcoming to newcomers
    }
    
    // WISDOM HOUSE: Values intelligence regardless of blood
    if (segment.id === 'wisdom-house') {
      if (origin === 'ancient-lineage') adjustedWeight *= 1.0;   // Merit-based
      if (origin === 'mixed-heritage') adjustedWeight *= 1.2;   // Analytical minds
      if (origin === 'common-born') adjustedWeight *= 1.3;  // Eager to learn magic
      if (origin === 'wildcard-origin') adjustedWeight *= 0.9;  // Self-doubt about ability
      if (origin === 'lost-bloodline') adjustedWeight *= 1.3; // Seeking to understand heritage
      if (origin === 'first-generation') adjustedWeight *= 1.4; // Fresh curiosity
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
  
  return adjustedWeight;
}

/**
 * Apply Hunger Games specific conditional logic
 */
function applyHungerGamesConditionalWeights(
  segment: WheelSegment,
  baseWeight: number,
  previousResults: Record<string, string>,
  currentStepId?: string
): number {
  let adjustedWeight = baseWeight;
  
  const district = previousResults.district;
  const tributeStatus = previousResults['tribute-status'];
  const trainingScore = previousResults['training-score'];
  const arena = previousResults['arena-environment'];
  const alliance = previousResults['alliance-strategy'];
  
  // === TRIBUTE STATUS CONDITIONAL LOGIC ===
  if (segment.id === 'career-volunteer') {
    // Only available for Career districts
    if (!['district-1', 'district-2', 'district-4'].includes(district)) {
      adjustedWeight *= 0.05; // Nearly impossible for non-Career districts
    } else {
      adjustedWeight *= 2.0; // More common in Career districts
    }
  }
  
  if (segment.id === 'volunteer-save') {
    // Higher probability for poorer districts (desperation)
    if (['district-11', 'district-12'].includes(district)) {
      adjustedWeight *= 2.5; // Like Katniss volunteering for Prim
    }
    if (['district-9', 'district-10'].includes(district)) {
      adjustedWeight *= 1.8;
    }
  }
  
  if (segment.id === 'reaped-multiple') {
    // More tessera entries for poorer districts
    if (['district-11', 'district-12'].includes(district)) {
      adjustedWeight *= 2.0;
    }
    if (['district-8', 'district-9', 'district-10'].includes(district)) {
      adjustedWeight *= 1.5;
    }
    if (['district-1', 'district-2'].includes(district)) {
      adjustedWeight *= 0.3; // Wealthy districts rarely need tessera
    }
  }
  
  // === TRAINING SCORE CONDITIONAL LOGIC ===
  if (segment.id.startsWith('score-')) {
    const scoreNumber = parseInt(segment.id.split('-')[1]);
    
    // Career tributes get higher scores
    if (tributeStatus === 'career-volunteer') {
      if (scoreNumber >= 9) adjustedWeight *= 3.0; // 60% chance of 9+ for careers
      if (scoreNumber <= 6) adjustedWeight *= 0.2; // Rare for careers to score low
    }
    
    // District advantages for certain scores
    if (['district-1', 'district-2', 'district-4'].includes(district) && scoreNumber >= 8) {
      adjustedWeight *= 1.8; // Career districts excel
    }
    
    if (['district-3', 'district-5', 'district-6'].includes(district) && scoreNumber >= 6 && scoreNumber <= 8) {
      adjustedWeight *= 1.4; // Tech districts show moderate competence
    }
    
    // District 12 special: Katniss bow moment (score 11)
    if (district === 'district-12' && segment.id === 'score-11') {
      adjustedWeight *= 5.0; // Ultra rare but possible
    }
    
    // Lower district expectations
    if (['district-8', 'district-9', 'district-10', 'district-11', 'district-12'].includes(district) && scoreNumber >= 9) {
      adjustedWeight *= 0.5; // Unusual for poor districts to score very high
    }
  }
  
  // === ARENA ENVIRONMENT ADVANTAGES ===
  if (currentStepId === 'arena-environment') {
    // District advantages for specific arenas
    if (segment.id === 'dense-forest') {
      if (['district-7', 'district-12'].includes(district)) {
        adjustedWeight *= 1.5; // Forestry and hunting experience
      }
    }
    
    if (segment.id === 'tropical-island') {
      if (district === 'district-4') {
        adjustedWeight *= 2.0; // Fishing district = water advantage
      }
    }
    
    if (segment.id === 'urban-ruins') {
      if (['district-3', 'district-5', 'district-6'].includes(district)) {
        adjustedWeight *= 1.6; // Tech districts understand infrastructure
      }
    }
    
    if (segment.id === 'frozen-tundra') {
      if (['district-9', 'district-10', 'district-11'].includes(district)) {
        adjustedWeight *= 1.3; // Agricultural hardiness
      }
    }
  }
  
  // === ALLIANCE STRATEGY CONDITIONAL LOGIC ===
  if (segment.id === 'career-pack') {
    // Only high-scoring or Career tributes get invited
    const score = parseInt(trainingScore?.split('-')[1] || '0');
    if (tributeStatus === 'career-volunteer' || score >= 8) {
      adjustedWeight *= 2.0;
    } else {
      adjustedWeight *= 0.1; // Very unlikely for weak tributes
    }
  }
  
  if (segment.id === 'secret-romance') {
    // More likely for joint District tributes
    if (district === 'district-12') {
      adjustedWeight *= 2.5; // Katniss and Peeta reference
    }
  }
  
  if (segment.id === 'solo-survivor') {
    // More likely for hunting/independent districts
    if (['district-7', 'district-12'].includes(district)) {
      adjustedWeight *= 1.8; // Used to self-reliance
    }
  }
  
  // === SURVIVAL WHEELS CONDITIONAL LOGIC ===
  
  // CORNUCOPIA BLOODBATH
  if (currentStepId === 'cornucopia-bloodbath') {
    if (segment.id === 'survive-bloodbath') {
      // Career districts trained for this
      if (tributeStatus === 'career-volunteer') adjustedWeight *= 1.2; // 90% survival
      if (['district-1', 'district-2', 'district-4'].includes(district)) adjustedWeight *= 1.27; // 95% survival
      
      // High training scores help
      const score = parseInt(trainingScore?.split('-')[1] || '5');
      if (score >= 8) adjustedWeight *= 1.2; // 90% survival for high scorers
      
      // Agile districts survive better
      if (['district-11', 'district-12'].includes(district)) adjustedWeight *= 1.13; // 85% survival (agility)
      
      // Solo strategy avoids bloodbath entirely
      if (alliance === 'solo-survivor') adjustedWeight *= 1.33; // 100% survival (avoided carnage)
    }
  }
  
  // FIRST NIGHT SURVIVAL
  if (currentStepId === 'first-night-survival') {
    if (segment.id === 'survive-night') {
      // Outdoor districts excel
      if (district === 'district-7') adjustedWeight *= 1.31; // 105% survival (forestry skills)
      if (district === 'district-12') adjustedWeight *= 1.25; // 100% survival (harsh conditions)
      if (['district-9', 'district-10', 'district-11'].includes(district)) adjustedWeight *= 1.19; // 95% survival (hardiness)
      
      // Career districts struggle with basics
      if (['district-1', 'district-2'].includes(district) && tributeStatus === 'career-volunteer') {
        adjustedWeight *= 0.875; // 70% survival (pampered)
      }
      
      // Extreme arenas are deadly
      if (['desert-wasteland', 'frozen-tundra'].includes(arena)) {
        adjustedWeight *= 0.82; // 65% survival in extreme conditions
      }
    }
  }
  
  // TRACKER JACKER ENCOUNTER
  if (currentStepId === 'tracker-jacker-encounter') {
    // Only appears in forest/tropical arenas
    if (!['dense-forest', 'tropical-island'].includes(arena)) {
      return 0; // Skip this wheel entirely
    }
    
    if (segment.id === 'survive-trackers') {
      // Forest districts have advantages
      if (district === 'district-7') adjustedWeight *= 1.43; // 100% survival (tree climbing)
      if (district === 'district-12') adjustedWeight *= 1.36; // 95% survival (hunting/tracking)
      
      // High intelligence helps
      const score = parseInt(trainingScore?.split('-')[1] || '5');
      if (score >= 8) adjustedWeight *= 1.29; // 90% survival (quick thinking)
      
      // Alliance help with recovery
      if (alliance !== 'solo-survivor') adjustedWeight *= 1.21; // 85% survival (help)
    }
  }
  
  // ARENA DISASTER SURVIVAL
  if (currentStepId === 'arena-disaster-survival') {
    if (segment.id === 'survive-disaster') {
      // Tech districts understand systems
      if (['district-3', 'district-5', 'district-6'].includes(district)) {
        adjustedWeight *= 1.38; // 90% survival (understand manipulation)
      }
      
      // District 12: Fire/explosion experience
      if (district === 'district-12') adjustedWeight *= 1.31; // 85% survival (coal mining)
      
      // District 4: Swimming in floods
      if (district === 'district-4') adjustedWeight *= 1.46; // 95% survival (water)
      
      // High scores = adaptability
      const score = parseInt(trainingScore?.split('-')[1] || '5');
      if (score >= 8) adjustedWeight *= 1.31; // 85% survival
      
      // Alliance coordination
      if (alliance !== 'solo-survivor') adjustedWeight *= 1.23; // 80% survival
    }
  }
  
  // MUTT ATTACK
  if (currentStepId === 'mutt-attack') {
    if (segment.id === 'survive-mutts') {
      // Combat-trained districts
      if (tributeStatus === 'career-volunteer') adjustedWeight *= 1.5; // 90% survival
      if (['district-1', 'district-2'].includes(district)) adjustedWeight *= 1.42; // 85% survival
      
      // Animal handling knowledge
      if (district === 'district-10') adjustedWeight *= 1.33; // 80% survival
      
      // Group defense
      if (alliance !== 'solo-survivor') adjustedWeight *= 1.33; // 80% survival
      
      // High combat scores
      const score = parseInt(trainingScore?.split('-')[1] || '5');
      if (score >= 8) adjustedWeight *= 1.42; // 85% survival
      
      // Final 6 = deadlier mutts
      // This would need to be tracked in sequence state
    }
  }
  
  // ALLIANCE BETRAYAL TEST
  if (currentStepId === 'alliance-betrayal-test') {
    // Skip for solo survivors
    if (alliance === 'solo-survivor') return 0;
    
    if (segment.id === 'survive-betrayal') {
      // Career Pack has high betrayal rate
      if (alliance === 'career-pack') adjustedWeight *= 0.43; // 30% survival (70% betrayal)
      
      // Secret Romance has low betrayal rate
      if (alliance === 'secret-romance') adjustedWeight *= 4.0; // 80% survival (20% betrayal)
      
      // District Alliance moderate betrayal
      if (alliance === 'district-alliance') adjustedWeight *= 1.22; // 55% survival (45% betrayal)
      
      // Better fighters survive betrayals
      const score = parseInt(trainingScore?.split('-')[1] || '5');
      if (score >= 8) adjustedWeight *= 1.36; // +20% survival bonus
      
      // Underestimated districts surprise attackers
      if (['district-11', 'district-12'].includes(district)) {
        adjustedWeight *= 1.27; // +15% survival bonus
      }
    }
  }
  
  // FINAL SHOWDOWN
  if (currentStepId === 'final-showdown') {
    // Career advantages
    if (tributeStatus === 'career-volunteer') {
      if (segment.id === 'brutal-victory') adjustedWeight *= 1.5;
    }
    
    // High intelligence = strategic victory
    const score = parseInt(trainingScore?.split('-')[1] || '5');
    if (score >= 8 && segment.id === 'strategic-victory') {
      adjustedWeight *= 1.4;
    }
    
    // Secret Romance unlocks Joint Victory
    if (alliance === 'secret-romance' && segment.id === 'joint-victory') {
      adjustedWeight *= 3.0;
    }
    
    // District 12 rule change boost (Katniss reference)
    if (district === 'district-12' && segment.id === 'rule-change-victory') {
      adjustedWeight *= 2.5; // 5% chance instead of 2%
    }
    
    // Tech districts = strategic thinking
    if (['district-3', 'district-5', 'district-6'].includes(district) && segment.id === 'strategic-victory') {
      adjustedWeight *= 1.3;
    }
  }
  
  // REBELLION ROLE
  if (currentStepId === 'rebellion-role') {
    // District 12 = Mockingjay path
    if (district === 'district-12' && segment.id === 'the-mockingjay') {
      adjustedWeight *= 1.6; // 40% chance instead of 25%
    }
    
    // Career districts = infiltrator access
    if (['district-1', 'district-2'].includes(district) && segment.id === 'capitol-infiltrator') {
      adjustedWeight *= 1.5; // Inside access to Capitol
    }
    
    // Presidential Assassin only with rule change history
    if (segment.id === 'presidential-assassin') {
      const victory = previousResults['final-showdown'];
      if (victory !== 'rule-change-victory') {
        adjustedWeight *= 0.1; // Nearly impossible without gamemaker manipulation history
      }
    }
    
    // Joint Victory = Propaganda Stars
    if (segment.id === 'propaganda-star') {
      const victory = previousResults['final-showdown'];
      if (victory === 'joint-victory') {
        adjustedWeight *= 2.0;
      }
    }
    
    // Brutal Victory reduces Mockingjay chances (trauma)
    if (segment.id === 'the-mockingjay') {
      const victory = previousResults['final-showdown'];
      if (victory === 'brutal-victory') {
        adjustedWeight *= 0.6; // Too traumatized to be symbol
      }
    }
  }
  
  return adjustedWeight;
}