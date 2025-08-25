import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SequenceResult } from '@/types/sequence';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ThemeConfig {
  universe: string;
  worldDescription: string;
  specialInstructions: string;
}

function getThemeConfig(themeId: string): ThemeConfig {
  const configs: Record<string, ThemeConfig> = {
    'harry-potter': {
      universe: 'Harry Potter',
      worldDescription: 'the magical wizarding world',
      specialInstructions: 'Focus on magical elements, house loyalties, and the struggle between good and evil. Use wizarding terminology and reference Hogwarts, spells, and magical creatures.'
    }
  };
  
  return configs[themeId] || configs['harry-potter'];
}

export async function POST(req: NextRequest) {
  try {
    const { results, themeName, themeId } = await req.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid results provided' }, { status: 400 });
    }

    // Get theme-specific configurations
    const themeConfig = getThemeConfig(themeId || 'harry-potter');
    
    // Calculate rarity score
    const rarityScore = calculateRarityScore(results);
    
    // Generate story prompt
    const storyPrompt = generateStoryPrompt(results, themeName, rarityScore);
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a master storyteller specializing in ${themeConfig.universe} universe narratives. Create immersive, personalized stories that feel authentic to ${themeConfig.worldDescription}. Include:
          1. A compelling narrative (3-4 paragraphs)
          2. Character comparison to known ${themeConfig.universe} characters (be specific about similarities)
          3. Rarity assessment with specific percentage
          4. What makes this combination special or unique
          
          ${themeConfig.specialInstructions}`
        },
        {
          role: 'user',
          content: storyPrompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.8'),
    });

    const generatedStory = completion.choices[0]?.message?.content || 'Story generation failed';

    const rarityData = getRarityPercentage(rarityScore);
    
    return NextResponse.json({
      story: generatedStory,
      rarityScore,
      rarityPercentage: rarityData.percentage,
      rarityTier: rarityData.tier,
      characterLookalike: getCharacterLookalike(results),
    });

  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}

function calculateRarityScore(results: SequenceResult[]): number {
  let totalRarityPoints = 0;
  
  for (const result of results) {
    const segment = result.spinResult.segment;
    
    // Base rarity points
    const rarityPoints = {
      common: 1,
      uncommon: 3,
      rare: 8,
      legendary: 20
    };
    
    totalRarityPoints += rarityPoints[segment.rarity || 'common'];
    
    // Bonus points for specific combinations
    if (segment.id === 'avada-kedavra') totalRarityPoints += 15; // Ultra rare spell
    if (segment.id === 'phoenix' || segment.id === 'thestral') totalRarityPoints += 10; // Ultra rare pets
    if (segment.id === 'elder-phoenix') totalRarityPoints += 12; // Death stick wand
  }
  
  // Check for Easter egg combinations
  const resultMap = results.reduce((acc, r) => {
    acc[r.stepId] = r.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  // Bonus for legendary paths
  if (isChosenOnePath(resultMap)) totalRarityPoints += 25;
  if (isDarkLordPath(resultMap)) totalRarityPoints += 30;
  if (isGrandProtectorPath(resultMap)) totalRarityPoints += 20;
  
  return Math.min(totalRarityPoints, 100); // Cap at 100
}

function getRarityPercentage(score: number): { percentage: string; tier: string } {
  if (score >= 80) return { percentage: '0.1%', tier: 'Ultra Legendary' };
  if (score >= 60) return { percentage: '0.5%', tier: 'Legendary' };
  if (score >= 40) return { percentage: '2%', tier: 'Very Rare' };
  if (score >= 25) return { percentage: '8%', tier: 'Rare' };
  if (score >= 15) return { percentage: '20%', tier: 'Uncommon' };
  return { percentage: '45%', tier: 'Common' };
}

function getCharacterLookalike(results: SequenceResult[]): string {
  const resultMap = results.reduce((acc, r) => {
    acc[r.stepId] = r.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  const { origin, house, purpose, spell } = resultMap;
  const schoolPerf = resultMap['school-performance'];
  const career = resultMap['hero-career'] || resultMap['scholar-career'] || resultMap['nature-career'];
  
  // Specific character matches
  if (house === 'gryffindor' && spell === 'expelliarmus' && purpose === 'defeat-voldemort') {
    return 'Harry Potter - The Chosen One who lived';
  }
  
  if (house === 'gryffindor' && origin === 'muggle-born' && schoolPerf === 'top-grades') {
    return 'Hermione Granger - The brilliant witch who changed everything';
  }
  
  if (house === 'slytherin' && spell === 'avada-kedavra' && origin === 'pure-blood') {
    return 'Tom Riddle/Voldemort - The Dark Lord who sought immortality';
  }
  
  if (house === 'gryffindor' && schoolPerf === 'head-student' && purpose === 'teach-hogwarts') {
    return 'Albus Dumbledore - The wise protector of the wizarding world';
  }
  
  if (house === 'slytherin' && career === 'potions-master' && schoolPerf === 'top-grades') {
    return 'Severus Snape - The Half-Blood Prince';
  }
  
  if (house === 'hufflepuff' && schoolPerf === 'quidditch-captain') {
    return 'Cedric Diggory - The true Hufflepuff champion';
  }
  
  if (house === 'ravenclaw' && schoolPerf === 'quiet-genius') {
    return 'Luna Lovegood - The unique Ravenclaw dreamer';
  }
  
  // General matches based on house
  const houseMatches = {
    gryffindor: 'Neville Longbottom - The brave Gryffindor who found his courage',
    slytherin: 'Draco Malfoy - The ambitious Slytherin',
    hufflepuff: 'Hannah Abbott - The loyal Hufflepuff',
    ravenclaw: 'Cho Chang - The intelligent Ravenclaw'
  };
  
  return houseMatches[house as keyof typeof houseMatches] || 'A unique wizard of your own making';
}

function isChosenOnePath(results: Record<string, string>): boolean {
  return (
    results.house === 'gryffindor' &&
    results.purpose === 'defeat-voldemort' &&
    (results.spell === 'expecto-patronum' || results.spell === 'expelliarmus')
  );
}

function isDarkLordPath(results: Record<string, string>): boolean {
  return (
    results.origin === 'pure-blood' &&
    results.house === 'slytherin' &&
    results.spell === 'avada-kedavra'
  );
}

function isGrandProtectorPath(results: Record<string, string>): boolean {
  return (
    results.purpose === 'teach-hogwarts' &&
    results['school-performance'] === 'head-student'
  );
}

function generateStoryPrompt(results: SequenceResult[], themeName: string, rarityScore: number): string {
  const resultsList = results.map(r => `${r.stepId}: ${r.spinResult.segment.text}`).join('\n');
  
  return `Generate a magical story for this ${themeName} character with rarity score ${rarityScore}/100:

RESULTS:
${resultsList}

Please create:
1. A compelling 3-4 paragraph narrative that weaves these results into an engaging story
2. Compare this character to a known Harry Potter character (be specific about why)
3. Explain the rarity (what makes this combination special/unique)
4. Make it feel authentic to the Harry Potter universe

Focus on storytelling that brings these random results to life as a coherent, magical journey. Make the reader feel like this is THEIR unique wizard story.`;
}