import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SequenceStepBuilder } from '@/types/builder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EnhanceStepRequest {
  step: SequenceStepBuilder;
  sequenceContext: {
    name: string;
    description: string;
    theme?: string;
    previousSteps: Array<{
      title: string;
      options: string[];
    }>;
  };
  enhancementType: 'options' | 'narrative' | 'mixed';
  preserveExisting: boolean;
}

interface StepEnhancementSummary {
  addedOptions: number;
  improvedDescriptions: boolean;
  enhancementType: string;
  originalOptionsCount: number;
  enhancedOptionsCount: number;
}

export async function POST(request: NextRequest) {
  console.log('🔥 Step Enhancement API called');
  const startTime = Date.now();
  
  try {
    console.log('📥 Parsing request body...');
    const { 
      step, 
      sequenceContext, 
      enhancementType = 'mixed', 
      preserveExisting = true,
      userMode = 'anonymous'
    }: EnhanceStepRequest & { userMode?: 'anonymous' | 'account' } = await request.json();

    // PRO-only feature check
    if (userMode === 'anonymous') {
      console.log('❌ Anonymous user trying to access PRO-only feature');
      return NextResponse.json({
        error: 'PRO_FEATURE_REQUIRED',
        message: 'Steps AI Enhancer is a PRO-only feature. Upgrade to enhance your sequence steps!',
        featureName: 'Steps AI Enhancer',
        upgradeRequired: true,
        proFeatures: [
          'AI-powered step enhancement',
          'Smart option generation', 
          'Narrative consistency checks',
          'Advanced story improvements'
        ]
      }, { status: 403 });
    }

    console.log('✅ Request parsed:', { 
      stepTitle: step?.title,
      sequenceName: sequenceContext?.name,
      enhancementType,
      originalOptionsCount: step?.wheelConfig?.segments?.length || 0
    });

    // Enhanced validation
    if (!step || !step.wheelConfig || !step.wheelConfig.segments) {
      console.error('❌ Invalid step provided');
      return NextResponse.json({ 
        error: 'Invalid step provided',
        details: 'Step must have wheelConfig with segments array' 
      }, { status: 400 });
    }

    if (!step.title || step.title.trim().length === 0) {
      console.error('❌ Step missing title');
      return NextResponse.json({ 
        error: 'Step must have a title',
        details: 'Empty or missing step title' 
      }, { status: 400 });
    }

    if (step.wheelConfig.segments.length === 0) {
      console.error('❌ Step has no segments');
      return NextResponse.json({ 
        error: 'Step must have at least one option',
        details: 'Cannot enhance step with no wheel segments' 
      }, { status: 400 });
    }

    if (step.wheelConfig.segments.length > 20) {
      console.error('❌ Step has too many segments');
      return NextResponse.json({ 
        error: 'Step has too many options',
        details: 'Maximum 20 options supported for enhancement' 
      }, { status: 400 });
    }

    if (!sequenceContext || !sequenceContext.name) {
      console.error('❌ Invalid sequence context');
      return NextResponse.json({ 
        error: 'Invalid sequence context',
        details: 'Sequence name is required for context-aware enhancement' 
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OpenAI API key not found');
      return NextResponse.json({ 
        error: 'AI service not configured',
        details: 'OpenAI API key not available' 
      }, { status: 503 });
    }

    const originalOptionsCount = step.wheelConfig.segments.length;

    // Build the AI prompt
    console.log('🤖 Building AI prompt...');
    const prompt = buildStepEnhancementPrompt(step, sequenceContext, enhancementType, preserveExisting);
    console.log('📝 Prompt length:', prompt.length);

    // Call OpenAI API with retry logic
    console.log('🚀 Calling OpenAI API...');
    let completion;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        completion = await Promise.race([
          openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: getStepEnhancementSystemPrompt()
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.4 + (retryCount * 0.1), // Slightly increase creativity on retry
            max_tokens: 2000,
          }),
          // 30-second timeout
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout after 30 seconds')), 30000)
          )
        ]);
        break; // Success, exit retry loop
      } catch (apiError: any) {
        retryCount++;
        console.warn(`⚠️ OpenAI API attempt ${retryCount} failed:`, apiError.message);
        
        if (retryCount >= maxRetries) {
          if (apiError.message === 'API timeout after 30 seconds') {
            throw new Error('AI service is taking too long to respond. Please try again.');
          } else if (apiError.status === 429) {
            throw new Error('AI service is temporarily overloaded. Please try again in a moment.');
          } else if (apiError.status >= 500) {
            throw new Error('AI service is temporarily unavailable. Please try again.');
          } else {
            throw new Error(`AI service error: ${apiError.message}`);
          }
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    if (!completion) {
      throw new Error('Failed to get response from AI service after multiple attempts');
    }

    console.log('✅ OpenAI response received');

    const aiResponse = completion.choices[0]?.message?.content;
    console.log('📄 AI Response length:', aiResponse?.length);
    console.log('📄 AI Response preview:', aiResponse?.substring(0, 300));
    
    if (!aiResponse) {
      console.error('❌ No response content from AI');
      throw new Error('No response from AI');
    }

    // Parse and validate the enhanced step with fallback
    let enhancedStep: SequenceStepBuilder;
    try {
      console.log('🔍 Attempting to parse JSON...');
      enhancedStep = JSON.parse(aiResponse);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.log('⚠️ Direct JSON parse failed, trying to extract...');
      console.log('Parse error:', parseError);
      
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log('🔍 Found JSON match, attempting to parse...');
        try {
          enhancedStep = JSON.parse(jsonMatch[0]);
          console.log('✅ Extracted JSON parsed successfully');
        } catch (extractError) {
          console.error('❌ Failed to parse extracted JSON:', extractError);
          throw new Error('AI returned invalid response format. Please try again.');
        }
      } else {
        console.error('❌ No JSON found in AI response');
        throw new Error('AI did not return a valid enhancement. Please try again.');
      }
    }

    // Validate the enhanced step
    console.log('🔍 Validating enhanced step...');
    const validationResult = validateEnhancedStep(enhancedStep, step);
    if (!validationResult.isValid) {
      console.error('❌ Validation failed:', validationResult.errors);
      throw new Error(`AI enhancement failed validation: ${validationResult.errors.slice(0, 2).join(', ')}. Please try again.`);
    }
    console.log('✅ Enhanced step validated successfully');

    // Ensure the step keeps original ID and required properties
    enhancedStep.id = step.id;
    enhancedStep.isCustom = true;

    // Calculate enhancement summary
    const enhancementSummary: StepEnhancementSummary = {
      addedOptions: enhancedStep.wheelConfig.segments.length - originalOptionsCount,
      improvedDescriptions: enhancedStep.title !== step.title || enhancedStep.description !== step.description,
      enhancementType,
      originalOptionsCount,
      enhancedOptionsCount: enhancedStep.wheelConfig.segments.length
    };

    console.log('✅ Sending successful response:', {
      success: true,
      addedOptions: enhancementSummary.addedOptions,
      enhancedOptionsCount: enhancementSummary.enhancedOptionsCount,
      processingTime: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      enhancedStep,
      enhancementSummary,
      processingTime: Date.now() - startTime
    });

  } catch (error: any) {
    console.error('Step enhancement error:', error);
    
    // Categorize errors for better user feedback
    let statusCode = 500;
    let userMessage = 'Failed to enhance step';
    
    if (error.message.includes('timeout') || error.message.includes('taking too long')) {
      statusCode = 408;
      userMessage = 'Enhancement is taking too long. Please try again.';
    } else if (error.message.includes('overloaded') || error.message.includes('rate limit')) {
      statusCode = 429;
      userMessage = 'AI service is busy. Please wait a moment and try again.';
    } else if (error.message.includes('temporarily unavailable')) {
      statusCode = 503;
      userMessage = 'AI service is temporarily unavailable. Please try again later.';
    } else if (error.message.includes('Invalid') || error.message.includes('validation')) {
      statusCode = 400;
      userMessage = error.message;
    } else if (error.message.includes('API key') || error.message.includes('not configured')) {
      statusCode = 503;
      userMessage = 'AI service is not available right now.';
    }
    
    return NextResponse.json({
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }, { status: statusCode });
  }
}

function getStepEnhancementSystemPrompt(): string {
  return `You are an expert interactive story designer. Enhance individual story steps by adding engaging options, improving descriptions, and creating meaningful choices while maintaining narrative consistency.

CRITICAL REQUIREMENTS:
1. Output MUST be valid JSON for a single SequenceStepBuilder object
2. Preserve the step's core concept and role in the story
3. Add 2-4 new diverse wheel options while keeping existing ones (if preserveExisting is true)
4. Improve step title and description for better engagement
5. Ensure all segment weights are positive integers (higher = more likely)
6. Create meaningful option text that advances the story
7. Each segment must have: id, text, color, weight (integer), rarity
8. Keep the same wheelConfig structure (size, spinDuration, friction, theme)
9. **LANGUAGE DETECTION**: Automatically detect the language of the user's content and respond in the SAME LANGUAGE. If my sequence choices are in English, write the story in English. If my sequence choices are in another language, write in that language.

ENHANCEMENT FOCUS:
- More diverse and interesting wheel options that fit the story context
- Better step titles and descriptions that reflect the narrative progression
- Varied option weights for balanced but realistic gameplay
- Options that create story momentum and meaningful consequences
- Clear, engaging option text that players want to choose
- **Maintain the original language throughout all enhanced content**

INPUT: Single step + sequence context (theme, previous choices)
OUTPUT: Enhanced single step JSON (no additional text, pure JSON only)`;
}

function buildStepEnhancementPrompt(
  step: SequenceStepBuilder, 
  context: any, 
  enhancementType: string, 
  preserveExisting: boolean
): string {
  const previousStepsContext = context.previousSteps.length > 0 
    ? `Previous story choices: ${context.previousSteps.map((s: any) => `"${s.title}" → [${s.options.join(', ')}]`).join(' → ')}`
    : 'This is the first step in the sequence.';

  return `Please enhance this story step while maintaining narrative consistency with the overall sequence.

SEQUENCE CONTEXT:
- Story Theme: "${context.name}"
- Description: "${context.description}"
- ${previousStepsContext}

CURRENT STEP TO ENHANCE:
${JSON.stringify(step, null, 2)}

ENHANCEMENT INSTRUCTIONS:
- Enhancement Type: ${enhancementType}
- ${preserveExisting ? 'PRESERVE existing options and add new ones' : 'Feel free to replace existing options'}
- Add 2-4 new engaging options that fit the story context
- Improve the step title to be more compelling and specific to the narrative
- Enhance the step description to better set the scene
- Ensure all options feel meaningful and contribute to story progression
- Use appropriate weights (higher numbers = more likely outcomes)
- Consider the story context when creating new options
- **IMPORTANT**: Detect the language of the existing content and respond in that SAME LANGUAGE. Do not translate or change the language. If my sequence choices are in English, write the story in English. If my sequence choices are in another language, write in that language.

EXAMPLE OPTION IMPROVEMENTS:
- Instead of "Option 1" → "Train with the first team"
- Instead of "Good ending" → "Lift the Champions League trophy"
- Instead of "Bad choice" → "Suffer a career-ending injury"

Generate unique segment IDs using the pattern: segment-{timestamp}-{randomString}

Return only the enhanced step JSON, no additional text.`;
}

function validateEnhancedStep(enhanced: SequenceStepBuilder, original: SequenceStepBuilder) {
  const errors: string[] = [];

  // Basic structure validation
  if (!enhanced || typeof enhanced !== 'object') {
    errors.push('Enhanced step is not a valid object');
    return { isValid: false, errors };
  }

  if (!enhanced.title || typeof enhanced.title !== 'string') {
    errors.push('Enhanced step missing or invalid title');
  }

  if (!enhanced.wheelConfig || !Array.isArray(enhanced.wheelConfig.segments)) {
    errors.push('Enhanced step missing wheelConfig or segments');
    return { isValid: false, errors };
  }

  if (enhanced.wheelConfig.segments.length === 0) {
    errors.push('Enhanced step must have at least one segment');
    return { isValid: false, errors };
  }

  // Validate each segment
  enhanced.wheelConfig.segments.forEach((segment, index) => {
    if (!segment.id || !segment.text || typeof segment.weight !== 'number') {
      errors.push(`Segment ${index} missing required fields (id, text, weight)`);
    }

    if (segment.weight && segment.weight <= 0) {
      errors.push(`Segment ${index} weight must be positive`);
    }

    if (!segment.color) {
      errors.push(`Segment ${index} missing color`);
    }
  });

  // Check that step wasn't completely transformed beyond recognition
  if (enhanced.wheelConfig.segments.length > original.wheelConfig.segments.length + 6) {
    errors.push('Too many new options added (maximum 6 additional options)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}