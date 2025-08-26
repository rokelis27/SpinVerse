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
    'mystical-academy': {
      universe: 'Mystical Academy',
      worldDescription: 'the magical academy world',
      specialInstructions: 'Focus on magical elements, house loyalties, and the journey from student to graduate. Use magical terminology and reference academy life, spells, and magical creatures.'
    },
    'survival-tournament': {
      universe: 'Survival Tournament',
      worldDescription: 'the dystopian tournament world',
      specialInstructions: 'Focus on survival, arena challenges, and rebellion against oppression. Reference regions, the empire, official manipulation, and resistance. Emphasize themes of sacrifice, hope, and fighting tyranny.'
    }
  };
  
  return configs[themeId] || configs['mystical-academy'];
}

export async function POST(req: NextRequest) {
  try {
    const { results, themeName, themeId } = await req.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid results provided' }, { status: 400 });
    }

    // Get theme-specific configurations
    const themeConfig = getThemeConfig(themeId || 'mystical-academy');
    
    // Calculate rarity score
    const rarityScore = calculateRarityScore(results, themeId);
    
    // Generate story prompt
    const storyPrompt = generateStoryPrompt(results, themeName, rarityScore, themeId);
    
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
      characterLookalike: getCharacterLookalike(results, themeId),
    });

  } catch (error) {
    console.error('Story generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
}

function calculateRarityScore(results: SequenceResult[], themeId?: string): number {
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
    
    // Theme-specific bonus points
    if (themeId === 'mystical-academy') {
      if (segment.id === 'void-spell') totalRarityPoints += 15; // Ultra rare spell
      if (segment.id === 'phoenix' || segment.id === 'shadow-horse') totalRarityPoints += 10; // Ultra rare pets
      if (segment.id === 'crystal-phoenix') totalRarityPoints += 12; // Ultra rare wand
    }
    
    if (themeId === 'survival-tournament') {
      if (segment.id === 'region-12') totalRarityPoints += 15; // Ultra rare region (1% chance)
      if (segment.id === 'score-11' || segment.id === 'score-12') totalRarityPoints += 12; // Perfect scores
      if (segment.id === 'rule-change-victory') totalRarityPoints += 18; // Official manipulation
      if (segment.id === 'the-symbol') totalRarityPoints += 15; // Rebellion symbol
      if (segment.id === 'emperor-assassin') totalRarityPoints += 20; // Ultimate rebellion
      if (segment.id === 'volcanic-hellscape') totalRarityPoints += 10; // Ultra rare arena
      if (segment.id === 'betrayal-plot') totalRarityPoints += 12; // Ultra rare strategy
      
      // Death outcomes reduce points (but still concompetitor to story)
      if (segment.id.includes('death') || segment.id.includes('die-')) {
        totalRarityPoints -= 5; // Deaths are common outcomes
      }
      
      // Survival bonuses
      if (segment.id.includes('survive') && result.stepId.includes('bloodbath')) {
        totalRarityPoints += 3; // Surviving bloodbath
      }
    }
  }
  
  // Check for theme-specific Easter egg combinations
  const resultMap = results.reduce((acc, r) => {
    acc[r.stepId] = r.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  if (themeId === 'mystical-academy') {
    // Bonus for legendary paths
    if (isHeroPath(resultMap)) totalRarityPoints += 25;
    if (isDarkPath(resultMap)) totalRarityPoints += 30;
    if (isProtectorPath(resultMap)) totalRarityPoints += 20;
  }
  
  if (themeId === 'survival-tournament') {
    // Perfect Symbol Path
    if (isPerfectSymbolPath(resultMap)) totalRarityPoints += 30; // Ultra legendary
    
    // Full Arena Survivor
    if (isFullArenaSurvivor(resultMap)) totalRarityPoints += 25; // Survived all 6 challenges
    
    // Star-Crossed Lovers
    if (isStarCrossedPath(resultMap)) totalRarityPoints += 20; // Joint victory romance
    
    // Underdog Victory
    if (isUnderdogPath(resultMap)) totalRarityPoints += 15;
  }
  
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

function getCharacterLookalike(results: SequenceResult[], themeId?: string): string {
  const resultMap = results.reduce((acc, r) => {
    acc[r.stepId] = r.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  if (themeId === 'survival-tournament') {
    return getSurvivalTournamentCharacterMatch(resultMap);
  }
  
  // Mystical Academy character matching
  const { origin, house, purpose, spell } = resultMap;
  const schoolPerf = resultMap['school-performance'];
  const career = resultMap['hero-career'] || resultMap['scholar-career'] || resultMap['nature-career'];
  
  // Specific character archetypes
  if (house === 'courage-house' && spell === 'disarm-spell' && purpose === 'defeat-darkness') {
    return 'The Chosen Hero - The brave one destined for greatness';
  }
  
  if (house === 'courage-house' && origin === 'muggle-born' && schoolPerf === 'top-grades') {
    return 'The Brilliant Scholar - The studious one who mastered magic through knowledge';
  }
  
  if (house === 'ambition-house' && spell === 'void-spell' && origin === 'pure-blood') {
    return 'The Dark Master - The ambitious one who sought forbidden power';
  }
  
  if (house === 'wisdom-house' && schoolPerf === 'head-student' && purpose === 'teach-academy') {
    return 'The Wise Mentor - The protector of magical knowledge';
  }
  
  if (house === 'ambition-house' && career === 'potions-master' && schoolPerf === 'top-grades') {
    return 'The Master Alchemist - The skilled potion maker';
  }
  
  if (house === 'loyalty-house' && schoolPerf === 'flight-captain') {
    return 'The True Champion - The loyal leader and skyball master';
  }
  
  if (house === 'wisdom-house' && schoolPerf === 'quiet-genius') {
    return 'The Unique Dreamer - The wise one who sees beyond the ordinary';
  }
  
  // General matches based on house
  const houseMatches = {
    'courage-house': 'The Brave Guardian - The courageous one who found their strength',
    'ambition-house': 'The Ambitious Achiever - The driven one who seeks greatness',
    'loyalty-house': 'The Faithful Friend - The loyal one who stands by others',
    'wisdom-house': 'The Wise Scholar - The intelligent one who values knowledge'
  };
  
  return houseMatches[house as keyof typeof houseMatches] || 'A unique mage of your own making';
}

function getSurvivalTournamentCharacterMatch(resultMap: Record<string, string>): string {
  const region = resultMap.region;
  const competitorStatus = resultMap['competitor-status'];
  const trainingScore = resultMap['training-score'];
  const alliance = resultMap['alliance-strategy'];
  const victory = resultMap['final-showdown'];
  const rebellion = resultMap['rebellion-role'];
  
  // Check for death outcomes first
  const hasDied = Object.values(resultMap).some(value => value.includes('death') || value.includes('die-'));
  
  if (hasDied) {
    // Tragic heroes who died but inspired others
    if (region === 'region-11') {
      return 'The Young Ally - The one whose death sparked outrage';
    }
    if (region === 'region-12') {
      return 'The Symbol - A sign of resistance even in death';
    }
    return 'Fallen Competitor - Your sacrifice fueled the rebellion';
  }
  
  // Perfect Symbol Path
  if (
    region === 'region-12' &&
    competitorStatus === 'volunteer-save' &&
    (trainingScore === 'score-11' || trainingScore === 'score-12') &&
    (victory === 'joint-victory' || victory === 'rule-change-victory') &&
    rebellion === 'the-symbol'
  ) {
    return 'The Fire Symbol - The one who ignited the revolution';
  }
  
  // Star-Crossed Lovers
  if (alliance === 'secret-romance' && victory === 'joint-victory') {
    if (region === 'region-12') {
      return 'The Beloved - The one whose love conquered the Empire';
    }
    return 'Star-Crossed Survivor - Your love story gave the Empire hope';
  }
  
  // Career Competitors
  if (competitorStatus === 'career-volunteer') {
    if (region === 'region-2' && victory === 'brutal-victory') {
      return 'The Brutal Elite - The trained fighter who fell to arena cruelty';
    }
    if (region === 'region-1') {
      return 'The Elite Killer - The trained assassin who underestimated heart';
    }
    if (region === 'region-4' && rebellion) {
      return 'The Elite Rebel - The trained fighter who joined the rebellion';
    }
    return 'Career Competitor - Trained to kill, learned to question';
  }
  
  // Region-specific matches
  if (region === 'region-7' && alliance === 'solo-survivor') {
    return 'The Axe Wielder - The forest survivor who played the game';
  }
  
  if (region === 'region-3' && victory === 'strategic-victory') {
    return 'The Tech Genius - The brilliant mind who outsmarted the arena';
  }
  
  if (region === 'region-11' && alliance === 'region-alliance') {
    return 'The Honorable Warrior - The powerful competitor who honored alliances';
  }
  
  if (region === 'region-5' && trainingScore?.includes('score-5')) {
    return 'The Clever Fox - The smart competitor who survived through intelligence';
  }
  
  // Rebellion roles
  if (rebellion === 'emperor-assassin') {
    return 'The Assassin - The one who personally ended the Emperor\'s reign';
  }
  
  if (rebellion === 'underground-coordinator') {
    return 'The Mastermind - The genius behind the revolution';
  }
  
  if (rebellion === 'region-liberator') {
    return 'The Commander - The military leader who freed the regions';
  }
  
  if (rebellion === 'capitol-infiltrator') {
    return 'The Inside Rebel - The spy who brought down the system from within';
  }
  
  // General region matches
  const regionMatches: Record<string, string> = {
    'region-1': 'Luxury Competitor - Raised in wealth, learned about suffering',
    'region-2': 'Stone Warrior - Trained for combat, forged in rebellion',
    'region-3': 'Tech Survivor - Used intelligence over strength',
    'region-4': 'Water Competitor - Flowed like the tide, adapted to survive',
    'region-5': 'Power Player - Generated energy for the revolution',
    'region-6': 'Transport Rebel - Carried the revolution forward',
    'region-7': 'Forest Fighter - Strong as the trees, sharp as an axe',
    'region-8': 'Fabric Weaver - Wove the threads of rebellion',
    'region-9': 'Grain Guardian - Fed the hope of a hungry nation',
    'region-10': 'Animal Ally - Understood the call of the wild and free',
    'region-11': 'Agricultural Rebel - Planted seeds of revolution',
    'region-12': 'Coal Fire - Burned bright against the darkness',
  };
  
  return regionMatches[region] || 'Unique Competitor - Your story stands alone in the Empire\'s history';
}

function isHeroPath(results: Record<string, string>): boolean {
  return (
    results.house === 'courage-house' &&
    results.purpose === 'defeat-darkness' &&
    (results.spell === 'guardian-spirit' || results.spell === 'disarm-spell')
  );
}

function isDarkPath(results: Record<string, string>): boolean {
  return (
    results.origin === 'pure-blood' &&
    results.house === 'ambition-house' &&
    results.spell === 'void-spell'
  );
}

function isProtectorPath(results: Record<string, string>): boolean {
  return (
    results.purpose === 'teach-academy' &&
    results['school-performance'] === 'head-student'
  );
}

// Survival Tournament path detection functions
function isPerfectSymbolPath(results: Record<string, string>): boolean {
  return (
    results.region === 'region-12' &&
    results['competitor-status'] === 'volunteer-save' &&
    (results['training-score'] === 'score-11' || results['training-score'] === 'score-12') &&
    (results['final-showdown'] === 'joint-victory' || results['final-showdown'] === 'rule-change-victory') &&
    results['rebellion-role'] === 'the-symbol'
  );
}

function isFullArenaSurvivor(results: Record<string, string>): boolean {
  // Check if survived all major arena challenges
  const survivedBloodbath = results['cornucopia-bloodbath'] === 'survive-bloodbath';
  const survivedNight = results['first-night-survival'] === 'survive-night';
  const survivedDisaster = results['arena-disaster-survival'] === 'survive-disaster';
  const survivedMutts = results['mutt-attack'] === 'survive-mutts';
  const hasVictory = !!results['final-showdown'];
  
  return survivedBloodbath && survivedNight && survivedDisaster && survivedMutts && hasVictory;
}

function isStarCrossedPath(results: Record<string, string>): boolean {
  return (
    results['alliance-strategy'] === 'secret-romance' &&
    results['final-showdown'] === 'joint-victory'
  );
}

function isUnderdogPath(results: Record<string, string>): boolean {
  const isUnderdogRegion = !['region-1', 'region-2', 'region-4'].includes(results.region);
  const notEliteVolunteer = results['competitor-status'] !== 'elite-volunteer';
  const hasVictory = !!results['final-showdown'];
  
  return isUnderdogRegion && notEliteVolunteer && hasVictory;
}

function generateStoryPrompt(results: SequenceResult[], themeName: string, rarityScore: number, themeId?: string): string {
  const resultsList = results.map(r => `${r.stepId}: ${r.spinResult.segment.text}`).join('\n');
  
  if (themeId === 'survival-tournament') {
    return `Generate an epic survival tournament competitor story for this ${themeName} character with rarity score ${rarityScore}/100:

COMPETITOR JOURNEY:
${resultsList}

Please create:
1. A compelling 3-4 paragraph narrative that follows their journey from Region to Arena to (potential) rebellion
2. Compare this character to a tournament archetype (explain the similarities)
3. Explain the rarity (what makes this combination special in the Empire's history)
4. Make it feel authentic to the brutal world of survival competition

If they died in the Arena, focus on their heroic sacrifice and how it inspired the rebellion.
If they survived, show their transformation from competitor to rebel leader.
Include specific details about their Region skills, Arena survival tactics, and impact on the Empire's future.
Make the reader feel the stakes, the brutality, but also the hope that drives the revolution.`;
  }
  
  // Default Mystical Academy prompt
  return `Generate a magical story for this ${themeName} character with rarity score ${rarityScore}/100:

RESULTS:
${resultsList}

Please create:
1. A compelling 3-4 paragraph narrative that weaves these results into an engaging story
2. Compare this character to a magical archetype (be specific about why)
3. Explain the rarity (what makes this combination special/unique)
4. Make it feel authentic to the magical academy universe

Focus on storytelling that brings these random results to life as a coherent, magical journey. Make the reader feel like this is THEIR unique mage story.`;
}