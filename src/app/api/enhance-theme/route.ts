import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { UserSequence } from '@/types/builder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EnhanceThemeRequest {
  sequence: UserSequence;
  enhancementLevel: 'light' | 'moderate' | 'heavy';
  focusAreas: ('branching' | 'options' | 'narrative' | 'outcomes')[];
  preserveCore: boolean;
}

interface EnhancementSummary {
  addedSteps: number;
  addedBranches: number;
  addedOptions: number;
  enhancementAreas: string[];
}

export async function POST(request: NextRequest) {
  console.log('🔥 Enhancement API called');
  const startTime = Date.now();
  
  try {
    console.log('📥 Parsing request body...');
    const { sequence, enhancementLevel = 'moderate', focusAreas = ['branching', 'options'], preserveCore = true }: EnhanceThemeRequest = await request.json();

    console.log('✅ Request parsed:', { 
      sequenceId: sequence?.id, 
      sequenceName: sequence?.name,
      stepsCount: sequence?.steps?.length,
      enhancementLevel, 
      focusAreas 
    });

    if (!sequence || !sequence.steps || sequence.steps.length === 0) {
      console.error('❌ Invalid sequence provided');
      return NextResponse.json({ error: 'Invalid sequence provided' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const originalStepCount = sequence.steps.length;
    const originalBranchCount = sequence.steps.reduce((acc, step) => acc + (step.branches?.length || 0), 0);
    const originalOptionCount = sequence.steps.reduce((acc, step) => acc + step.wheelConfig.segments.length, 0);

    // Create enhancement configuration based on level
    const enhancementConfig = getEnhancementConfig(enhancementLevel, focusAreas);

    // Build the AI prompt
    console.log('🤖 Building AI prompt...');
    const prompt = buildEnhancementPrompt(sequence, enhancementConfig, preserveCore);
    console.log('📝 Prompt length:', prompt.length);

    // Call OpenAI API
    console.log('🚀 Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent output
      max_tokens: 16000, // Increased max tokens for complex sequences
    });

    console.log('✅ OpenAI response received');

    const aiResponse = completion.choices[0]?.message?.content;
    console.log('📄 AI Response length:', aiResponse?.length);
    console.log('📄 AI Response preview:', aiResponse?.substring(0, 200));
    
    if (!aiResponse) {
      console.error('❌ No response content from AI');
      throw new Error('No response from AI');
    }

    // Parse and validate the enhanced sequence
    let enhancedSequence: UserSequence;
    try {
      console.log('🔍 Attempting to parse JSON...');
      enhancedSequence = JSON.parse(aiResponse);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.log('⚠️ Direct JSON parse failed, trying to extract...');
      console.log('Parse error:', parseError);
      
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 Found JSON match, attempting to parse...');
        try {
          enhancedSequence = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON parsed successfully');
        } catch (extractError) {
          console.error('❌ Failed to parse extracted JSON:', extractError);
          throw new Error('Invalid JSON response from AI - extraction failed');
        }
      } else {
        console.error('❌ No JSON found in AI response');
        throw new Error('Invalid JSON response from AI - no JSON found');
      }
    }

    // Validate the enhanced sequence
    console.log('🔍 Validating enhanced sequence...');
    const validationResult = validateEnhancedSequence(enhancedSequence, sequence);
    if (!validationResult.isValid) {
      console.error('❌ Validation failed:', validationResult.errors);
      throw new Error(`AI generated invalid sequence: ${validationResult.errors.join(', ')}`);
    }
    console.log('✅ Enhanced sequence validated successfully');

    // Ensure the sequence has the original ID and metadata
    enhancedSequence.id = sequence.id;
    enhancedSequence.createdAt = sequence.createdAt;
    enhancedSequence.lastModified = new Date().toISOString();
    enhancedSequence.isCustom = true;

    // Calculate enhancement summary
    const enhancementSummary: EnhancementSummary = {
      addedSteps: enhancedSequence.steps.length - originalStepCount,
      addedBranches: enhancedSequence.steps.reduce((acc, step) => acc + (step.branches?.length || 0), 0) - originalBranchCount,
      addedOptions: enhancedSequence.steps.reduce((acc, step) => acc + step.wheelConfig.segments.length, 0) - originalOptionCount,
      enhancementAreas: focusAreas
    };

    console.log('✅ Sending successful response:', {
      success: true,
      addedSteps: enhancementSummary.addedSteps,
      addedOptions: enhancementSummary.addedOptions,
      processingTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      enhancedSequence,
      enhancementSummary,
      processingTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Theme enhancement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to enhance theme' },
      { status: 500 }
    );
  }
}

function getSystemPrompt(): string {
  return `You are an expert interactive story designer specializing in choice-driven narratives. Your task is to enhance user-created story sequences by adding depth, complexity, and engaging branching paths.

CRITICAL REQUIREMENTS:
1. Output MUST be valid JSON matching the UserSequence TypeScript interface
2. Preserve the original story's core theme and essence
3. Add meaningful branches that create different story outcomes
4. Ensure all segment weights are positive integers (higher = more likely)
5. Create compelling narrative hooks and unexpected twists
6. Maintain logical story flow and character consistency
7. Each step must have an id, title, wheelConfig with segments array
8. Each segment must have id, text, color, weight (integer), rarity
9. **CRITICAL**: ALL branch nextStepId values MUST reference step IDs that exist in the steps array
10. **CRITICAL**: Double-check all step ID references before outputting JSON
11. Support weightOverrides in branches for dynamic probability changes
12. When creating new steps, use unique IDs with timestamp format: step-{timestamp}-{randomString}

ENHANCEMENT FOCUS AREAS:
- Rich branching narratives with consequences
- Diverse wheel options with varying probabilities
- Character development opportunities
- Plot twists and narrative surprises
- Multiple ending possibilities
- Thematic depth and world-building

EXAMPLE PROPER JSON FORMAT:
{
  "id": "custom-1756241493077",
  "name": "My Adventure Quest",
  "description": "An epic journey through challenges",
  "color": "#4A90A4",
  "startStepId": "step-1",
  "isCustom": true,
  "createdBy": "user",
  "createdAt": "2025-08-26T20:51:33.077Z",
  "lastModified": "2025-08-26T20:52:14.541Z",
  "version": "1.0",
  "isPublic": false,
  "tags": ["custom"],
  "steps": [
    {
      "id": "step-1",
      "title": "Choose Your Path",
      "description": "The journey begins",
      "isCustom": true,
      "wheelConfig": {
        "segments": [
          {
            "id": "option-1",
            "text": "Forest Trail",
            "color": "#32CD32",
            "rarity": "common",
            "weight": 50
          },
          {
            "id": "option-2", 
            "text": "Mountain Pass",
            "color": "#4682B4",
            "rarity": "common", 
            "weight": 50
          }
        ],
        "size": 400,
        "spinDuration": 3000,
        "friction": 0.02,
        "theme": "default"
      },
      "defaultNextStep": "step-2",
      "branches": [
        {
          "conditions": [
            {
              "stepId": "step-1",
              "segmentId": "option-1", 
              "operator": "equals",
              "value": "option-1"
            }
          ],
          "nextStepId": "step-forest",
          "operator": "and"
        }
      ]
    }
  ],
  "narrativeTemplate": "You chose {step-1}."
}

INPUT FORMAT: Original UserSequence JSON
OUTPUT FORMAT: Enhanced UserSequence JSON (pure JSON only, no additional text)`;
}

function getEnhancementConfig(level: string, focusAreas: string[]) {
  const configs = {
    light: {
      maxNewSteps: 2,
      maxNewOptionsPerStep: 3,
      maxNewBranchesPerStep: 2,
      complexityMultiplier: 1.3
    },
    moderate: {
      maxNewSteps: 4,
      maxNewOptionsPerStep: 5,
      maxNewBranchesPerStep: 3,
      complexityMultiplier: 1.8
    },
    heavy: {
      maxNewSteps: 8,
      maxNewOptionsPerStep: 8,
      maxNewBranchesPerStep: 5,
      complexityMultiplier: 2.5
    }
  };
  
  return configs[level as keyof typeof configs] || configs.moderate;
}

function buildEnhancementPrompt(sequence: UserSequence, config: any, preserveCore: boolean): string {
  return `Please enhance the following interactive story sequence. 

ORIGINAL SEQUENCE:
${JSON.stringify(sequence, null, 2)}

ENHANCEMENT INSTRUCTIONS:
- Enhancement Level: Add up to ${config.maxNewSteps} new steps
- Add up to ${config.maxNewOptionsPerStep} new options per step where appropriate
- Create up to ${config.maxNewBranchesPerStep} new branches per step for meaningful choices
- ${preserveCore ? 'PRESERVE the original story theme and core narrative' : 'Feel free to expand the story theme creatively'}
- Ensure all weights are realistic integers (higher for more likely outcomes)
- Add compelling character development and plot twists
- Create meaningful consequences for different choices
- Ensure all branch nextStepId values reference valid step IDs

Focus on making the story more engaging while maintaining narrative coherence. Add depth through:
1. More nuanced character interactions
2. Meaningful choice consequences
3. Multiple story paths and endings
4. Rich world-building details
5. Unexpected narrative twists

VALIDATION CHECKLIST BEFORE RETURNING JSON:
- All steps have unique IDs
- All branch nextStepId values reference existing step IDs in the steps array
- All segments have proper structure (id, text, color, weight, rarity)
- JSON is complete and not truncated
- No circular references unless intentional

Return only the enhanced sequence JSON, no additional text.`;
}

function validateEnhancedSequence(enhanced: UserSequence, original: UserSequence) {
  const errors: string[] = [];

  // Basic structure validation
  if (!enhanced || typeof enhanced !== 'object') {
    errors.push('Enhanced sequence is not a valid object');
    return { isValid: false, errors };
  }

  if (!enhanced.name || typeof enhanced.name !== 'string') {
    errors.push('Enhanced sequence missing or invalid name');
  }

  if (!enhanced.steps || !Array.isArray(enhanced.steps) || enhanced.steps.length === 0) {
    errors.push('Enhanced sequence missing or invalid steps array');
    return { isValid: false, errors };
  }

  // Validate each step
  enhanced.steps.forEach((step, index) => {
    if (!step.id || !step.title) {
      errors.push(`Step ${index} missing id or title`);
    }

    if (!step.wheelConfig || !Array.isArray(step.wheelConfig.segments)) {
      errors.push(`Step ${index} missing wheelConfig or segments`);
    } else {
      step.wheelConfig.segments.forEach((segment, segIndex) => {
        if (!segment.id || !segment.text || typeof segment.weight !== 'number') {
          errors.push(`Step ${index}, segment ${segIndex} missing required fields`);
        }
      });
    }

    // Validate branch references
    if (step.branches) {
      step.branches.forEach((branch, branchIndex) => {
        if (branch.nextStepId && !enhanced.steps.find(s => s.id === branch.nextStepId)) {
          const availableStepIds = enhanced.steps.map(s => s.id).join(', ');
          errors.push(`Step ${index} (${step.title}), branch ${branchIndex} references invalid step ID: ${branch.nextStepId}. Available step IDs: [${availableStepIds}]`);
        }
      });
    }

    // Validate defaultNextStep references
    if (step.defaultNextStep && !enhanced.steps.find(s => s.id === step.defaultNextStep)) {
      const availableStepIds = enhanced.steps.map(s => s.id).join(', ');
      errors.push(`Step ${index} (${step.title}) has invalid defaultNextStep: ${step.defaultNextStep}. Available step IDs: [${availableStepIds}]`);
    }
  });

  // Check if core theme is preserved (basic check)
  const originalWords = original.name.toLowerCase().split(' ');
  const enhancedWords = enhanced.name.toLowerCase().split(' ');
  const commonWords = originalWords.filter(word => enhancedWords.includes(word));
  
  if (commonWords.length === 0 && original.name.length > 0) {
    // This is just a warning, not a hard error
    console.warn('Enhanced sequence may have diverged from original theme');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}