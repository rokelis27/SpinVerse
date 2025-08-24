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
 * Get the appropriate narrative template based on results
 */
export function getNarrativeTemplate(
  theme: SequenceTheme,
  results: SequenceResult[]
): string {
  if (!theme.narrativeTemplates) {
    return theme.narrativeTemplate || '';
  }
  
  // You can add logic here to choose different templates based on the path taken
  // For now, return the default or first available template
  const templateKeys = Object.keys(theme.narrativeTemplates);
  if (templateKeys.length === 0) {
    return theme.narrativeTemplate || '';
  }
  
  // Future: Add logic to select template based on specific conditions
  // e.g., "light_path", "dark_path", "neutral_path"
  
  return theme.narrativeTemplates[templateKeys[0]] || theme.narrativeTemplate || '';
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