import { SequenceStep, SequenceBranch, SequenceCondition, SequenceResult, SequenceTheme } from '@/types/sequence';

/**
 * Evaluate a single condition against sequence results
 */
export function evaluateCondition(
  condition: SequenceCondition,
  results: SequenceResult[]
): boolean {
  const result = results.find(r => r.stepId === condition.stepId);
  if (!result) return false;
  
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
): string | null {
  // Check branches in order
  if (currentStep.branches) {
    for (const branch of currentStep.branches) {
      if (evaluateBranch(branch, results)) {
        return branch.nextStepId;
      }
    }
  }
  
  // Fall back to default next step
  return currentStep.defaultNextStep || null;
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
  let currentStepId = theme.startStepId;
  
  while (currentStepId) {
    const step = findStepById(theme, currentStepId);
    if (!step) break;
    
    path.push(step);
    
    // Find next step based on results so far
    const relevantResults = results.filter(r => 
      path.some(s => s.id === r.stepId)
    );
    
    currentStepId = getNextStepId(step, relevantResults);
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
 * Get the appropriate narrative template based on results
 */
export function getNarrativeTemplate(
  theme: SequenceTheme,
  results: SequenceResult[]
): string {
  if (!theme.narrativeTemplates) {
    return theme.narrativeTemplate || '';
  }
  
  // Check for Harry Potter Easter eggs first
  if (theme.id === 'harry-potter') {
    const easterEgg = detectHarryPotterEasterEggs(results);
    if (easterEgg && theme.narrativeTemplates[easterEgg]) {
      return theme.narrativeTemplates[easterEgg];
    }
  }
  
  // Standard path detection
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