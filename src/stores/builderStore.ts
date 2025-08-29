import { create } from 'zustand';
import { UserSequence, SequenceStepBuilder, WheelSegmentBuilder, ValidationResult } from '@/types/builder';

interface BuilderState {
  // Current editing state
  currentSequence: UserSequence | null;
  selectedStepIndex: number;
  isDirty: boolean;
  isPreviewMode: boolean;
  
  // Actions
  createNewSequence: () => void;
  loadSequence: (sequence: UserSequence) => void;
  updateSequenceName: (name: string) => void;
  updateSequenceDescription: (description: string) => void;
  
  // Step management
  addStep: (afterIndex?: number) => void;
  removeStep: (index: number) => void;
  updateStep: (index: number, updates: Partial<SequenceStepBuilder>) => void;
  setSelectedStep: (index: number) => void;
  
  // Determiner step management
  insertDeterminerStep: (targetIndex: number) => void;
  removeDeterminerStep: (targetIndex: number) => void;
  findDeterminerStep: (targetIndex: number) => number;
  
  // Segment management
  addSegment: (stepIndex: number) => void;
  removeSegment: (stepIndex: number, segmentId: string) => void;
  updateSegment: (stepIndex: number, segmentId: string, updates: Partial<WheelSegmentBuilder>) => void;
  
  // Preview mode
  togglePreviewMode: () => void;
  
  // Validation
  validateSequence: () => ValidationResult;
  
  // Save/Load (localStorage for now)
  saveSequence: () => void;
  
  // Utility
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const generateStepId = () => `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateSegmentId = () => `segment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Create standard determiner step with 1-5 options
const createDeterminerStep = (targetStepId: string): SequenceStepBuilder => ({
  id: `${targetStepId}-determiner`,
  title: "Spin Count Determiner",
  description: "This step determines how many times the next step will spin.",
  isCustom: true,
  isDeterminer: true,
  targetStepId,
  wheelConfig: {
    segments: [
      { 
        id: '1-spin', 
        text: '1', 
        color: '#FF6B6B', 
        weight: 20, 
        rarity: 'common',
        description: '1 spin'
      },
      { 
        id: '2-spins', 
        text: '2', 
        color: '#4ECDC4', 
        weight: 25, 
        rarity: 'common',
        description: '2 spins'
      },
      { 
        id: '3-spins', 
        text: '3', 
        color: '#45B7D1', 
        weight: 25, 
        rarity: 'common',
        description: '3 spins'
      },
      { 
        id: '4-spins', 
        text: '4', 
        color: '#96CEB4', 
        weight: 20, 
        rarity: 'uncommon',
        description: '4 spins'
      },
      { 
        id: '5-spins', 
        text: '5', 
        color: '#FECA57', 
        weight: 10, 
        rarity: 'rare',
        description: '5 spins'
      },
    ],
    size: 400,
    spinDuration: 3000,
    friction: 0.02,
    theme: 'system'
  }
});

export const useBuilderStore = create<BuilderState>((set, get) => ({
  // Initial state
  currentSequence: null,
  selectedStepIndex: 0,
  isDirty: false,
  isPreviewMode: false,

  // Create new sequence
  createNewSequence: () => {
    const newSequence: UserSequence = {
      id: `custom-${Date.now()}`,
      name: 'My Custom Journey',
      description: 'A personalized wheel sequence',
      color: '#4A90A4',
      startStepId: 'step-1',
      isCustom: true,
      createdBy: 'user',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      version: '1.0',
      isPublic: false,
      tags: ['custom'],
      steps: [
        {
          id: 'step-1',
          title: 'Your Choice',
          description: 'Make your first decision',
          isCustom: true,
          wheelConfig: {
            segments: [
              {
                id: 'option-1',
                text: 'Option 1',
                color: '#4682B4',
                rarity: 'common',
                weight: 50,
                description: 'First choice'
              },
              {
                id: 'option-2', 
                text: 'Option 2',
                color: '#32CD32',
                rarity: 'common',
                weight: 50,
                description: 'Second choice'
              }
            ],
            size: 400,
            spinDuration: 3000,
            friction: 0.02,
            theme: 'default'
          }
        }
      ],
      narrativeTemplate: 'You chose {step-1}.'
    };
    
    set({ 
      currentSequence: newSequence, 
      selectedStepIndex: 0, 
      isDirty: true, 
      isPreviewMode: false 
    });
  },

  // Load existing sequence
  loadSequence: (sequence) => {
    // Ensure all steps have required builder properties
    const sequenceWithBuilderProps: UserSequence = {
      ...sequence,
      steps: sequence.steps.map(step => ({
        ...step,
        isCustom: true, // All loaded sequences are custom
        wheelConfig: {
          ...step.wheelConfig,
          segments: step.wheelConfig.segments.map(segment => ({
            ...segment,
            description: '', // Add missing description property for builder
          }))
        }
      }))
    };
    
    set({ 
      currentSequence: sequenceWithBuilderProps, 
      selectedStepIndex: 0, 
      isDirty: false, 
      isPreviewMode: false 
    });
  },

  // Update sequence metadata
  updateSequenceName: (name) => {
    const state = get();
    if (!state.currentSequence) return;
    
    set({
      currentSequence: {
        ...state.currentSequence,
        name,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  updateSequenceDescription: (description) => {
    const state = get();
    if (!state.currentSequence) return;
    
    set({
      currentSequence: {
        ...state.currentSequence,
        description,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  // Step management
  addStep: (afterIndex?: number) => {
    const state = get();
    if (!state.currentSequence) return;

    // Determine where to insert: after the specified index, or after currently selected step
    const insertAfterIndex = afterIndex !== undefined ? afterIndex : state.selectedStepIndex;
    const insertPosition = insertAfterIndex + 1;

    const stepId = generateStepId();
    const newStep: SequenceStepBuilder = {
      id: stepId,
      title: `Step ${state.currentSequence.steps.length + 1}`,
      description: 'Choose your option',
      isCustom: true,
      wheelConfig: {
        segments: [
          {
            id: generateSegmentId(),
            text: 'Option 1',
            color: '#4682B4',
            rarity: 'common',
            weight: 50
          },
          {
            id: generateSegmentId(),
            text: 'Option 2', 
            color: '#32CD32',
            rarity: 'common',
            weight: 50
          }
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'default'
      }
    };

    const updatedSteps = [...state.currentSequence.steps];
    
    // Handle connection logic when inserting in the middle
    if (insertPosition < updatedSteps.length) {
      // We're inserting in the middle - set up connections
      const previousStep = updatedSteps[insertAfterIndex];
      
      if (previousStep && previousStep.defaultNextStep) {
        // Previous step had a connection - redirect it through our new step
        newStep.defaultNextStep = previousStep.defaultNextStep;
        previousStep.defaultNextStep = stepId;
      } else if (previousStep && insertPosition < updatedSteps.length) {
        // Previous step had no explicit connection, but there is a next step
        // Connect: previousStep -> newStep -> nextStep
        newStep.defaultNextStep = updatedSteps[insertPosition].id;
        previousStep.defaultNextStep = stepId;
      }
    } else {
      // We're adding at the end - link previous step if it has no connection
      if (updatedSteps.length > 0) {
        const previousStep = updatedSteps[insertAfterIndex];
        if (previousStep && !previousStep.defaultNextStep) {
          previousStep.defaultNextStep = stepId;
        }
      }
    }
    
    // Insert the new step at the calculated position
    updatedSteps.splice(insertPosition, 0, newStep);

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      selectedStepIndex: insertPosition, // Select the newly inserted step
      isDirty: true
    });
  },

  removeStep: (index) => {
    const state = get();
    if (!state.currentSequence || state.currentSequence.steps.length <= 1) return;

    const updatedSteps = [...state.currentSequence.steps];
    const removedStep = updatedSteps[index];
    updatedSteps.splice(index, 1);

    // Update references to removed step
    updatedSteps.forEach(step => {
      if (step.defaultNextStep === removedStep.id) {
        step.defaultNextStep = undefined;
      }
      if (step.branches) {
        step.branches = step.branches.filter(branch => branch.nextStepId !== removedStep.id);
      }
    });

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      selectedStepIndex: Math.max(0, Math.min(index, updatedSteps.length - 1)),
      isDirty: true
    });
  },

  updateStep: (index, updates) => {
    const state = get();
    if (!state.currentSequence) return;

    const updatedSteps = [...state.currentSequence.steps];
    updatedSteps[index] = { ...updatedSteps[index], ...updates };

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  setSelectedStep: (index) => {
    set({ selectedStepIndex: index });
  },

  // Determiner step management
  insertDeterminerStep: (targetIndex) => {
    const state = get();
    if (!state.currentSequence) return;

    const targetStep = state.currentSequence.steps[targetIndex];
    if (!targetStep) return;

    // Create the determiner step with connection to target step
    const determinerStep = {
      ...createDeterminerStep(targetStep.id),
      defaultNextStep: targetStep.id // Ensure determiner flows to target step
    };
    
    // Insert determiner step before the target step
    const updatedSteps = [
      ...state.currentSequence.steps.slice(0, targetIndex),
      determinerStep,
      ...state.currentSequence.steps.slice(targetIndex)
    ];

    // Update any previous step that was connecting to the target step to now connect to determiner
    if (targetIndex > 0) {
      const previousStep = updatedSteps[targetIndex - 1];
      if (previousStep && previousStep.defaultNextStep === targetStep.id) {
        previousStep.defaultNextStep = determinerStep.id;
      }
      // Also check branches in previous steps
      updatedSteps.forEach(step => {
        if (step.branches) {
          step.branches = step.branches.map(branch => 
            branch.nextStepId === targetStep.id 
              ? { ...branch, nextStepId: determinerStep.id }
              : branch
          );
        }
      });
    }

    // Update the target step's determiner reference and mode (now at targetIndex + 1)
    const updatedTargetStep = {
      ...updatedSteps[targetIndex + 1],
      multiSpin: {
        ...updatedSteps[targetIndex + 1].multiSpin,
        mode: 'dynamic',
        determinerStepId: determinerStep.id,
        aggregateResults: true
      }
    };
    updatedSteps[targetIndex + 1] = updatedTargetStep;

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true,
      selectedStepIndex: targetIndex + 1 // Select the multi-spin step (now moved one position down)
    });
  },

  removeDeterminerStep: (targetIndex) => {
    const state = get();
    if (!state.currentSequence) return;

    const determinerIndex = get().findDeterminerStep(targetIndex);
    if (determinerIndex === -1) return;

    // Remove determiner step and clear reference
    const updatedSteps = state.currentSequence.steps.filter((_, index) => index !== determinerIndex);
    
    // Clear determinerStepId and reset to fixed mode for the target step (adjust index if determiner was before it)
    const adjustedTargetIndex = determinerIndex < targetIndex ? targetIndex - 1 : targetIndex;
    if (updatedSteps[adjustedTargetIndex]?.multiSpin) {
      updatedSteps[adjustedTargetIndex] = {
        ...updatedSteps[adjustedTargetIndex],
        multiSpin: {
          ...updatedSteps[adjustedTargetIndex].multiSpin,
          mode: 'fixed',
          fixedCount: updatedSteps[adjustedTargetIndex].multiSpin?.fixedCount || 3,
          determinerStepId: undefined,
          aggregateResults: true
        }
      };
    }

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true,
      selectedStepIndex: Math.min(adjustedTargetIndex, updatedSteps.length - 1)
    });
  },

  findDeterminerStep: (targetIndex) => {
    const state = get();
    if (!state.currentSequence) return -1;

    const targetStep = state.currentSequence.steps[targetIndex];
    if (!targetStep) return -1;

    // Look for a determiner step that targets this step
    return state.currentSequence.steps.findIndex(step => 
      step.isDeterminer && step.targetStepId === targetStep.id
    );
  },

  // Segment management
  addSegment: (stepIndex) => {
    const state = get();
    if (!state.currentSequence) return;

    const updatedSteps = [...state.currentSequence.steps];
    const step = updatedSteps[stepIndex];
    
    const colors = [
      '#4682B4', '#32CD32', '#FF6347', '#9370DB', '#FFD700',
      '#FF69B4', '#00CED1', '#FFA500', '#DC143C', '#20B2AA'
    ];
    
    const newSegment: WheelSegmentBuilder = {
      id: generateSegmentId(),
      text: `Option ${step.wheelConfig.segments.length + 1}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      rarity: 'common',
      weight: 25
    };

    step.wheelConfig.segments = [...step.wheelConfig.segments, newSegment];

    // Rebalance weights
    const totalSegments = step.wheelConfig.segments.length;
    const equalWeight = Math.round(100 / totalSegments);
    step.wheelConfig.segments = step.wheelConfig.segments.map(segment => ({
      ...segment,
      weight: equalWeight
    }));

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  removeSegment: (stepIndex, segmentId) => {
    const state = get();
    if (!state.currentSequence) return;

    const updatedSteps = [...state.currentSequence.steps];
    const step = updatedSteps[stepIndex];
    
    if (step.wheelConfig.segments.length <= 2) return; // Keep minimum 2 segments

    step.wheelConfig.segments = step.wheelConfig.segments.filter(s => s.id !== segmentId);

    // Rebalance weights
    const totalSegments = step.wheelConfig.segments.length;
    const equalWeight = Math.round(100 / totalSegments);
    step.wheelConfig.segments = step.wheelConfig.segments.map(segment => ({
      ...segment,
      weight: equalWeight
    }));

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  updateSegment: (stepIndex, segmentId, updates) => {
    const state = get();
    if (!state.currentSequence) return;

    const updatedSteps = [...state.currentSequence.steps];
    const step = updatedSteps[stepIndex];
    
    const segmentIndex = step.wheelConfig.segments.findIndex(s => s.id === segmentId);
    if (segmentIndex === -1) return;

    step.wheelConfig.segments = step.wheelConfig.segments.map((segment, index) =>
      index === segmentIndex ? { ...segment, ...updates } : segment
    );

    set({
      currentSequence: {
        ...state.currentSequence,
        steps: updatedSteps,
        lastModified: new Date().toISOString()
      },
      isDirty: true
    });
  },

  // Preview mode
  togglePreviewMode: () => {
    set(state => ({ isPreviewMode: !state.isPreviewMode }));
  },

  // Basic validation
  validateSequence: () => {
    const state = get();
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!state.currentSequence) {
      errors.push({ id: 'no-sequence', message: 'No sequence to validate', type: 'error' });
      return { isValid: false, errors, warnings };
    }

    const sequence = state.currentSequence;

    // Check sequence has name
    if (!sequence.name.trim()) {
      errors.push({
        id: 'no-name',
        message: 'Sequence must have a name',
        type: 'error'
      });
    }

    // Check each step
    sequence.steps.forEach((step, index) => {
      if (!step.title.trim()) {
        errors.push({
          id: `step-${index}-no-title`,
          message: `Step ${index + 1} must have a title`,
          type: 'error',
          stepIndex: index
        });
      }

      if (step.wheelConfig.segments.length < 2) {
        errors.push({
          id: `step-${index}-few-segments`,
          message: `Step ${index + 1} must have at least 2 segments`,
          type: 'error',
          stepIndex: index
        });
      }

      // Check segments
      step.wheelConfig.segments.forEach(segment => {
        if (!segment.text.trim()) {
          errors.push({
            id: `segment-${segment.id}-no-text`,
            message: 'Segment must have text',
            type: 'error',
            stepIndex: index,
            segmentId: segment.id
          });
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  // Save to localStorage
  saveSequence: () => {
    const state = get();
    if (!state.currentSequence) return;

    try {
      const saved = JSON.parse(localStorage.getItem('spinverse-custom-sequences') || '[]');
      const existingIndex = saved.findIndex((s: any) => s.id === state.currentSequence!.id);
      
      if (existingIndex >= 0) {
        saved[existingIndex] = state.currentSequence;
      } else {
        saved.push(state.currentSequence);
      }
      
      localStorage.setItem('spinverse-custom-sequences', JSON.stringify(saved));
      set({ isDirty: false });
    } catch (error) {
      console.error('Failed to save sequence:', error);
    }
  },

  // Utility
  setDirty: (dirty) => {
    set({ isDirty: dirty });
  },

  reset: () => {
    set({
      currentSequence: null,
      selectedStepIndex: 0,
      isDirty: false,
      isPreviewMode: false
    });
  }
}));