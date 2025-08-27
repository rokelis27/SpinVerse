import { SequenceStep, SequenceBranch, SequenceCondition, SequenceResult, SequenceTheme } from '@/types/sequence';

/**
 * Evaluate a single condition against sequence results
 */
export function evaluateCondition(
  condition: SequenceCondition,
  results: SequenceResult[]
): boolean {
  const result = results.find(r => r.stepId === condition.stepId);
  if (!result) {
    return false;
  }
  
  const actualValue = result.spinResult.segment.id;
  const expectedValue = condition.value;
  const operator = condition.operator || 'equals';
  
  
  switch (operator) {
    case 'equals':
      return actualValue === expectedValue;
    case 'not_equals':
      return actualValue !== expectedValue;
    case 'in':
      return Array.isArray(expectedValue) && expectedValue.includes(actualValue);
    case 'not_in':
      return Array.isArray(expectedValue) && !expectedValue.includes(actualValue);
    default:
      return false;
  }
}

/**
 * Evaluate a branch (set of conditions) against sequence results
 */
export function evaluateBranch(
  branch: SequenceBranch,
  results: SequenceResult[]
): boolean {
  const operator = branch.operator || 'and';
  
  if (operator === 'and') {
    // All conditions must be true
    return branch.conditions.every(condition => evaluateCondition(condition, results));
  } else {
    // At least one condition must be true
    return branch.conditions.some(condition => evaluateCondition(condition, results));
  }
}

/**
 * Find the next step ID based on current step and results
 */
export function getNextStepId(
  currentStep: SequenceStep,
  results: SequenceResult[]
): { nextStepId: string | null; weightOverrides?: import('@/types/sequence').WeightOverride[] } {
  
  // Check branches in order
  if (currentStep.branches) {
    for (let i = 0; i < currentStep.branches.length; i++) {
      const branch = currentStep.branches[i];
      const branchResult = evaluateBranch(branch, results);
      
      if (branchResult) {
        return { 
          nextStepId: branch.nextStepId,
          weightOverrides: branch.weightOverrides
        };
      }
    }
  }
  
  // Fall back to default next step
  return { nextStepId: currentStep.defaultNextStep || null };
}

/**
 * Apply weight overrides to a step's wheel configuration
 */
export function applyWeightOverrides(
  step: SequenceStep, 
  weightOverrides?: import('@/types/sequence').WeightOverride[]
): SequenceStep {
  if (!weightOverrides || weightOverrides.length === 0) {
    return step;
  }


  // Create a map of overridden weights
  const overrideMap = new Map(weightOverrides.map(override => [override.segmentId, override.newWeight]));
  
  // Calculate total overridden weight
  const totalOverriddenWeight = weightOverrides.reduce((sum, override) => sum + override.newWeight, 0);
  const remainingWeight = Math.max(0, 100 - totalOverriddenWeight);
  
  // Get segments that are not overridden
  const nonOverriddenSegments = step.wheelConfig.segments.filter(segment => !overrideMap.has(segment.id));
  const weightPerNonOverridden = nonOverriddenSegments.length > 0 ? remainingWeight / nonOverriddenSegments.length : 0;

  // Apply overrides
  const updatedSegments = step.wheelConfig.segments.map(segment => {
    if (overrideMap.has(segment.id)) {
      const newWeight = overrideMap.get(segment.id)!;
      return { ...segment, weight: newWeight };
    } else {
      const newWeight = Math.round(weightPerNonOverridden);
      return { ...segment, weight: newWeight };
    }
  });

  return {
    ...step,
    wheelConfig: {
      ...step.wheelConfig,
      segments: updatedSegments
    }
  };
}

/**
 * Find a step by ID in a theme
 */
export function findStepById(theme: SequenceTheme, stepId: string): SequenceStep | null {
  return theme.steps.find(step => step.id === stepId) || null;
}

/**
 * Get the complete sequence path for given results
 */
export function getSequencePath(
  theme: SequenceTheme,
  results: SequenceResult[]
): SequenceStep[] {
  const path: SequenceStep[] = [];
  let currentStepId: string | null = theme.startStepId;
  
  while (currentStepId) {
    const step = findStepById(theme, currentStepId);
    if (!step) break;
    
    path.push(step);
    
    // Find next step based on results so far
    const relevantResults = results.filter(r => 
      path.some(s => s.id === r.stepId)
    );
    
    const branchResult = getNextStepId(step, relevantResults);
    currentStepId = branchResult.nextStepId;
  }
  
  return path;
}

/**
 * Check if sequence is complete for given results
 */
export function isSequenceComplete(
  theme: SequenceTheme,
  results: SequenceResult[]
): boolean {
  const path = getSequencePath(theme, results);
  const completedSteps = results.map(r => r.stepId);
  
  // Check if all steps in the path have been completed
  return path.every(step => completedSteps.includes(step.id));
}

/**
 * Detect Harry Potter Easter egg combinations for special narratives
 */
export function detectHarryPotterEasterEggs(
  results: SequenceResult[]
): string | null {
  const resultMap = results.reduce((acc, result) => {
    acc[result.stepId] = result.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  const { origin, house, wand, purpose, spell } = resultMap;
  const career = resultMap['hero-career'] || resultMap['scholar-career'] || resultMap['nature-career'];
  const magic = resultMap['light-magic'] || resultMap['dark-magic'];
  
  // THE CHOSEN ONE: Harry Potter-like combination
  if (
    (origin === 'half-blood' || origin === 'pure-blood') &&
    house === 'gryffindor' &&
    (wand === 'holly-phoenix' || wand === 'maple-phoenix') &&
    purpose === 'defeat-voldemort' &&
    (spell === 'expecto-patronum' || spell === 'expelliarmus')
  ) {
    return 'chosen-one';
  }
  
  // THE DARK LORD: Voldemort-like combination
  if (
    origin === 'pure-blood' &&
    house === 'slytherin' &&
    magic === 'dark-arts' &&
    spell === 'avada-kedavra' &&
    (career === 'unspeakable' || purpose === 'discover-magic')
  ) {
    return 'dark-lord';
  }
  
  // THE GRAND PROTECTOR: Dumbledore-like combination
  if (
    (origin === 'half-blood' || origin === 'pure-blood') &&
    (house === 'gryffindor' || house === 'ravenclaw') &&
    (wand === 'holly-phoenix' || wand === 'maple-phoenix') &&
    purpose === 'teach-hogwarts' &&
    career === 'unspeakable' &&
    magic === 'patronus'
  ) {
    return 'grand-protector';
  }
  
  return null;
}

/**
 * Detect Hunger Games storyline combinations for special narratives
 */
export function detectHungerGamesStorylines(
  results: SequenceResult[]
): string | null {
  const resultMap = results.reduce((acc, result) => {
    acc[result.stepId] = result.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  const district = resultMap['district'];
  const tributeStatus = resultMap['tribute-status'];
  const trainingScore = resultMap['training-score'];
  const alliance = resultMap['alliance-strategy'];
  const victory = resultMap['final-showdown'];
  const rebellion = resultMap['rebellion-role'];
  
  // Check for death outcomes first
  const bloodbathDeath = resultMap['bloodbath-death'];
  const exposureDeath = resultMap['exposure-death'];
  const trackerDeath = resultMap['tracker-death'];
  const disasterDeath = resultMap['disaster-death'];
  const muttDeath = resultMap['mutt-death'];
  const betrayalDeath = resultMap['betrayal-death'];
  
  // Death storylines
  if (bloodbathDeath) return 'bloodbath-victim';
  if (exposureDeath) return 'exposure-victim';
  if (trackerDeath) return 'tracker-victim';
  if (disasterDeath) return 'disaster-victim';
  if (muttDeath) return 'mutt-victim';
  if (betrayalDeath) return 'betrayal-victim';
  
  // Victory storylines
  if (victory && rebellion) {
    // THE PERFECT MOCKINGJAY: District 12 + Volunteer + High score + Joint victory + Mockingjay
    if (
      district === 'district-12' &&
      tributeStatus === 'volunteer-save' &&
      (trainingScore === 'score-11' || trainingScore === 'score-12') &&
      (victory === 'joint-victory' || victory === 'rule-change-victory') &&
      rebellion === 'the-mockingjay'
    ) {
      return 'mockingjay-perfect';
    }
    
    // STAR-CROSSED SURVIVORS: Joint victory + Secret romance
    if (
      victory === 'joint-victory' &&
      alliance === 'secret-romance'
    ) {
      return 'star-crossed';
    }
    
    // BRUTAL SURVIVOR: Brutal victory + haunted
    if (victory === 'brutal-victory') {
      return 'brutal-survivor';
    }
    
    // STRATEGIC MASTERMIND: Strategic victory + intelligence
    if (victory === 'strategic-victory') {
      return 'strategic-mastermind';
    }
    
    // UNLIKELY HERO: Non-career district + low expectations + success
    if (
      !['district-1', 'district-2', 'district-4'].includes(district) &&
      tributeStatus !== 'career-volunteer' &&
      (victory === 'sacrifice-victory' || victory === 'mercy-victory')
    ) {
      return 'unlikely-hero';
    }
  }
  
  return null;
}

/**
 * Get the appropriate narrative template based on results
 */
export function getNarrativeTemplate(
  theme: SequenceTheme,
  results: SequenceResult[]
): string {
  if (!theme.narrativeTemplates) {
    return theme.narrativeTemplate || '';
  }
  
  // Check for theme-specific storylines
  if (theme.id === 'harry-potter') {
    const easterEgg = detectHarryPotterEasterEggs(results);
    if (easterEgg && theme.narrativeTemplates[easterEgg]) {
      return theme.narrativeTemplates[easterEgg];
    }
  }
  
  if (theme.id === 'hunger-games') {
    const storyline = detectHungerGamesStorylines(results);
    if (storyline && theme.narrativeTemplates[storyline]) {
      return theme.narrativeTemplates[storyline];
    }
  }
  
  // Standard path detection for Harry Potter
  const hasHeroCareer = results.some(r => r.stepId === 'hero-career');
  const hasScholarCareer = results.some(r => r.stepId === 'scholar-career');
  const hasNatureCareer = results.some(r => r.stepId === 'nature-career');
  const hasLightMagic = results.some(r => r.stepId === 'light-magic');
  const hasDarkMagic = results.some(r => r.stepId === 'dark-magic');
  
  // Select appropriate template based on path taken
  if (hasHeroCareer && theme.narrativeTemplates['hero-path']) {
    return theme.narrativeTemplates['hero-path'];
  }
  if (hasScholarCareer && theme.narrativeTemplates['scholar-path']) {
    return theme.narrativeTemplates['scholar-path'];
  }
  if (hasNatureCareer && theme.narrativeTemplates['nature-path']) {
    return theme.narrativeTemplates['nature-path'];
  }
  if (hasLightMagic && theme.narrativeTemplates['light-path']) {
    return theme.narrativeTemplates['light-path'];
  }
  if (hasDarkMagic && theme.narrativeTemplates['dark-path']) {
    return theme.narrativeTemplates['dark-path'];
  }
  
  // Fallback to default template
  return theme.narrativeTemplates['default'] || theme.narrativeTemplate || '';
}

/**
 * Create branching conditions helper functions
 */
export const BranchingConditions = {
  // Simple equality condition
  equals: (stepId: string, segmentId: string): SequenceCondition => ({
    stepId,
    segmentId,
    operator: 'equals',
    value: segmentId
  }),
  
  // Multiple choice condition
  oneOf: (stepId: string, segmentIds: string[]): SequenceCondition => ({
    stepId,
    segmentId: stepId, // Not used for 'in' operator
    operator: 'in',
    value: segmentIds
  }),
  
  // Exclusion condition
  notEquals: (stepId: string, segmentId: string): SequenceCondition => ({
    stepId,
    segmentId,
    operator: 'not_equals',
    value: segmentId
  })
};

/**
 * Helper to create branches more easily
 */
export const createBranch = (
  nextStepId: string,
  conditions: SequenceCondition[],
  operator: 'and' | 'or' = 'and'
): SequenceBranch => ({
  conditions,
  nextStepId,
  operator
});