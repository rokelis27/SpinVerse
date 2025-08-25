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
    },
    'hunger-games': {
      universe: 'Hunger Games',
      worldDescription: 'the dystopian world of Panem',
      specialInstructions: 'Focus on survival, class inequality, rebellion against oppression, and the brutal reality of the Arena. Reference Districts, the Capitol, Gamemaker manipulation, and the growing rebellion. Emphasize themes of sacrifice, hope, and resistance against tyranny.'
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
    if (themeId === 'harry-potter') {
      if (segment.id === 'avada-kedavra') totalRarityPoints += 15; // Ultra rare spell
      if (segment.id === 'phoenix' || segment.id === 'thestral') totalRarityPoints += 10; // Ultra rare pets
      if (segment.id === 'elder-phoenix') totalRarityPoints += 12; // Death stick wand
    }
    
    if (themeId === 'hunger-games') {
      if (segment.id === 'district-12') totalRarityPoints += 15; // Ultra rare district (1% chance)
      if (segment.id === 'score-11' || segment.id === 'score-12') totalRarityPoints += 12; // Perfect scores
      if (segment.id === 'rule-change-victory') totalRarityPoints += 18; // Gamemaker manipulation
      if (segment.id === 'the-mockingjay') totalRarityPoints += 15; // Rebellion symbol
      if (segment.id === 'presidential-assassin') totalRarityPoints += 20; // Ultimate rebellion
      if (segment.id === 'volcanic-hellscape') totalRarityPoints += 10; // Ultra rare arena
      if (segment.id === 'betrayal-plot') totalRarityPoints += 12; // Ultra rare strategy
      
      // Death outcomes reduce points (but still contribute to story)
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
  
  if (themeId === 'harry-potter') {
    // Bonus for legendary paths
    if (isChosenOnePath(resultMap)) totalRarityPoints += 25;
    if (isDarkLordPath(resultMap)) totalRarityPoints += 30;
    if (isGrandProtectorPath(resultMap)) totalRarityPoints += 20;
  }
  
  if (themeId === 'hunger-games') {
    // Perfect Mockingjay Path
    if (isPerfectMockingjayPath(resultMap)) totalRarityPoints += 30; // Ultra legendary
    
    // Full Arena Survivor
    if (isFullArenaSurvivor(resultMap)) totalRarityPoints += 25; // Survived all 6 challenges
    
    // Star-Crossed Lovers
    if (isStarCrossedPath(resultMap)) totalRarityPoints += 20; // Joint victory romance
    
    // Career Killer (non-career beats careers)
    if (isCareerKillerPath(resultMap)) totalRarityPoints += 15;
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
  
  if (themeId === 'hunger-games') {
    return getHungerGamesCharacterMatch(resultMap);
  }
  
  // Harry Potter character matching
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

function getHungerGamesCharacterMatch(resultMap: Record<string, string>): string {
  const district = resultMap.district;
  const tributeStatus = resultMap['tribute-status'];
  const trainingScore = resultMap['training-score'];
  const alliance = resultMap['alliance-strategy'];
  const victory = resultMap['final-showdown'];
  const rebellion = resultMap['rebellion-role'];
  
  // Check for death outcomes first
  const hasDied = Object.values(resultMap).some(value => value.includes('death') || value.includes('die-'));
  
  if (hasDied) {
    // Tragic heroes who died but inspired others
    if (district === 'district-11') {
      return 'Rue - The young ally whose death sparked outrage';
    }
    if (district === 'district-12') {
      return 'Mockingjay Tribute - A symbol of resistance even in death';
    }
    return 'Fallen Tribute - Your sacrifice fueled the rebellion';
  }
  
  // Perfect Mockingjay Path
  if (
    district === 'district-12' &&
    tributeStatus === 'volunteer-save' &&
    (trainingScore === 'score-11' || trainingScore === 'score-12') &&
    (victory === 'joint-victory' || victory === 'rule-change-victory') &&
    rebellion === 'the-mockingjay'
  ) {
    return 'Katniss Everdeen - The Girl on Fire who ignited the revolution';
  }
  
  // Star-Crossed Lovers
  if (alliance === 'secret-romance' && victory === 'joint-victory') {
    if (district === 'district-12') {
      return 'Peeta Mellark - The boy with the bread whose love conquered the Capitol';
    }
    return 'Star-Crossed Survivor - Your love story gave Panem hope';
  }
  
  // Career Tributes
  if (tributeStatus === 'career-volunteer') {
    if (district === 'district-2' && victory === 'brutal-victory') {
      return 'Cato - The brutal Career who fell to the arena\'s cruelty';
    }
    if (district === 'district-1') {
      return 'Marvel/Glimmer - The trained killer who underestimated heart';
    }
    if (district === 'district-4' && rebellion) {
      return 'Finnick Odair - The Career who joined the rebellion';
    }
    return 'Career Tribute - Trained to kill, learned to question';
  }
  
  // District-specific matches
  if (district === 'district-7' && alliance === 'solo-survivor') {
    return 'Johanna Mason - The axe-wielding survivor who played the game';
  }
  
  if (district === 'district-3' && victory === 'strategic-victory') {
    return 'Beetee - The technical genius who outsmarted the arena';
  }
  
  if (district === 'district-11' && alliance === 'district-alliance') {
    return 'Thresh - The powerful tribute who honored alliances';
  }
  
  if (district === 'district-5' && trainingScore?.includes('score-5')) {
    return 'Foxface - The clever tribute who survived through intelligence';
  }
  
  // Rebellion roles
  if (rebellion === 'presidential-assassin') {
    return 'The Assassin - The one who personally ended Snow\'s reign';
  }
  
  if (rebellion === 'underground-coordinator') {
    return 'Plutarch Heavensbee - The mastermind of the revolution';
  }
  
  if (rebellion === 'district-liberator') {
    return 'Commander Paylor - The military leader who freed the districts';
  }
  
  if (rebellion === 'capitol-infiltrator') {
    return 'Inside Rebel - The spy who brought down the system from within';
  }
  
  // General district matches
  const districtMatches: Record<string, string> = {
    'district-1': 'Luxury Tribute - Raised in wealth, learned about suffering',
    'district-2': 'Stone Warrior - Trained for combat, forged in rebellion',
    'district-3': 'Tech Survivor - Used intelligence over strength',
    'district-4': 'Water Tribute - Flowed like the tide, adapted to survive',
    'district-5': 'Power Player - Generated energy for the revolution',
    'district-6': 'Transport Rebel - Carried the revolution forward',
    'district-7': 'Forest Fighter - Strong as the trees, sharp as an axe',
    'district-8': 'Fabric Weaver - Wove the threads of rebellion',
    'district-9': 'Grain Guardian - Fed the hope of a hungry nation',
    'district-10': 'Animal Ally - Understood the call of the wild and free',
    'district-11': 'Agricultural Rebel - Planted seeds of revolution',
    'district-12': 'Coal Fire - Burned bright against the darkness',
  };
  
  return districtMatches[district] || 'Unique Tribute - Your story stands alone in Panem\'s history';
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

// Hunger Games path detection functions
function isPerfectMockingjayPath(results: Record<string, string>): boolean {
  return (
    results.district === 'district-12' &&
    results['tribute-status'] === 'volunteer-save' &&
    (results['training-score'] === 'score-11' || results['training-score'] === 'score-12') &&
    (results['final-showdown'] === 'joint-victory' || results['final-showdown'] === 'rule-change-victory') &&
    results['rebellion-role'] === 'the-mockingjay'
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

function isCareerKillerPath(results: Record<string, string>): boolean {
  const isNonCareerDistrict = !['district-1', 'district-2', 'district-4'].includes(results.district);
  const notCareerVolunteer = results['tribute-status'] !== 'career-volunteer';
  const hasVictory = !!results['final-showdown'];
  
  return isNonCareerDistrict && notCareerVolunteer && hasVictory;
}

function generateStoryPrompt(results: SequenceResult[], themeName: string, rarityScore: number, themeId?: string): string {
  const resultsList = results.map(r => `${r.stepId}: ${r.spinResult.segment.text}`).join('\n');
  
  if (themeId === 'hunger-games') {
    return `Generate an epic Hunger Games tribute story for this ${themeName} character with rarity score ${rarityScore}/100:

TRIBUTE JOURNEY:
${resultsList}

Please create:
1. A compelling 3-4 paragraph narrative that follows their journey from District to Arena to (potential) rebellion
2. Compare this character to a known Hunger Games character (explain the similarities)
3. Explain the rarity (what makes this combination special in Panem's history)
4. Make it feel authentic to the brutal world of the Hunger Games

If they died in the Arena, focus on their heroic sacrifice and how it inspired the rebellion.
If they survived, show their transformation from tribute to rebel leader.
Include specific details about their District skills, Arena survival tactics, and impact on Panem's future.
Make the reader feel the stakes, the brutality, but also the hope that drives the revolution.`;
  }
  
  // Default Harry Potter prompt
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