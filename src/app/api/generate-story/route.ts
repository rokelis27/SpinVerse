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
    },
    'underground-racing': {
      universe: 'Underground Racing',
      worldDescription: 'the street racing underworld',
      specialInstructions: 'Focus on speed, adrenaline, crew loyalty, and the underground racing scene. Reference cars, racing techniques, crew dynamics, sponsorships, and the constant tension between street racing and law enforcement.'
    },
    'detective-mystery': {
      universe: 'Detective Mystery',
      worldDescription: 'the crime investigation world',
      specialInstructions: 'Focus on investigation techniques, evidence analysis, suspect interviews, and solving complex crimes. Reference detective work, clues, plot twists, and the pursuit of justice.'
    }
  };
  
  return configs[themeId] || configs['mystical-academy'];
}

export async function POST(req: NextRequest) {
  try {
    const { results, themeName, themeId, isCustomSequence, sequenceDescription } = await req.json();

    if (!results || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid results provided' }, { status: 400 });
    }

    // Handle custom sequences differently
    let themeConfig: ThemeConfig;
    let rarityScore: number;
    let storyPrompt: string;
    
    // Detect custom sequences either by explicit flag or by themeId pattern
    const isActuallyCustom = isCustomSequence === true || (themeId && themeId.startsWith('custom-'));
    
    if (isActuallyCustom) {
      const fallbackDescription = sequenceDescription || `A custom ${themeName} experience`;
      themeConfig = getCustomThemeConfig(themeName, fallbackDescription);
      rarityScore = calculateCustomRarityScore(results);
      storyPrompt = generateCustomStoryPrompt(results, themeName, fallbackDescription, rarityScore);
    } else {
      // Original theme-specific configurations
      themeConfig = getThemeConfig(themeId || 'mystical-academy');
      rarityScore = calculateRarityScore(results, themeId);
      storyPrompt = generateStoryPrompt(results, themeName, rarityScore, themeId);
    }
    
    // Call OpenAI API
    const systemMessage = `You are a master storyteller who specializes in creating immersive, personalized narratives. ${isActuallyCustom ? 
      `You're working with a custom user-created story concept: "${themeName}". Create a story that feels authentic to this unique world and concept.` :
      `You're working with the ${themeConfig.universe} universe. Create immersive stories that feel authentic to ${themeConfig.worldDescription}.`
    }
    
    **CRITICAL LANGUAGE REQUIREMENT**: Automatically detect the language used in the user's sequence choices and story content. Generate your entire response (narrative, character analysis, all text) in the SAME LANGUAGE as the user's content. If my sequence choices are in English, write the story in English. If my sequence choices are in another language, write in that language.
    
    IMPORTANT: Format your response exactly like this:
    
    **STORY:**
    [Write a compelling narrative (3-4 paragraphs) that weaves the choices into a coherent journey]
    
    **CHARACTER:**
    [Character archetype analysis that connects to real-world examples when relevant - write this in the same language as the story above]
    
    ${isActuallyCustom ? 
      `Focus on the unique themes and elements that make this custom sequence special. Draw connections between the choices to create meaningful narrative progression.` :
      themeConfig.specialInstructions
    }`;


    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: storyPrompt
        }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.8'),
    });

    const generatedContent = completion.choices[0]?.message?.content || 'Story generation failed';
    
    // Parse the AI response to extract story and character analysis
    const { story, characterArchetype } = parseAIResponse(generatedContent);

    const rarityData = getRarityPercentage(rarityScore);
    
    return NextResponse.json({
      story,
      rarityScore,
      rarityPercentage: rarityData.percentage,
      rarityTier: rarityData.tier,
      characterArchetype,
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
    // Get all segments for this result (multi-spin or single)
    const allSegments = result.multiSpinResults && result.multiSpinResults.length > 1 
      ? result.multiSpinResults.map(spin => spin.segment)
      : [result.spinResult.segment];

    // Process each segment for base rarity and theme bonuses
    for (const segment of allSegments) {
      // Base rarity points
      const rarityPoints = {
        common: 1,
        uncommon: 3,
        rare: 8,
        legendary: 20
      };
      
      totalRarityPoints += rarityPoints[segment.rarity || 'common'];
      
      // Theme-specific bonus points for each segment
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

function getPersonalizedArchetype(results: SequenceResult[], themeName: string, themeId?: string): string {
  const totalResults = results.length;
  const resultMap = results.reduce((acc, r) => {
    acc[r.stepId] = r.spinResult.segment.id;
    return acc;
  }, {} as Record<string, string>);
  
  // Football/Sports career example
  if (themeName.toLowerCase().includes('football') || themeName.toLowerCase().includes('soccer')) {
    const hasLeadership = results.some(r => r.spinResult.segment.text.toLowerCase().includes('captain') || r.spinResult.segment.text.toLowerCase().includes('leader'));
    const hasSkill = results.some(r => r.spinResult.segment.text.toLowerCase().includes('skill') || r.spinResult.segment.text.toLowerCase().includes('talented'));
    
    if (hasLeadership && hasSkill) {
      return 'The Complete Player - Combines technical skill with natural leadership';
    } else if (hasLeadership) {
      return 'The Captain - Natural leader who inspires teammates';
    } else if (hasSkill) {
      return 'The Technical Master - Pure talent and skill-focused player';
    }
    return 'The Unique Footballer - Your own distinctive playing style';
  }
  
  // Business/Entrepreneur theme
  if (themeName.toLowerCase().includes('business') || themeName.toLowerCase().includes('entrepreneur')) {
    const hasRisk = results.some(r => (r.spinResult.segment.weight || 50) < 30);
    const hasInnovation = results.some(r => r.spinResult.segment.text.toLowerCase().includes('innovation') || r.spinResult.segment.text.toLowerCase().includes('new'));
    
    if (hasRisk && hasInnovation) {
      return 'The Visionary Disruptor - Bold innovator who takes calculated risks';
    } else if (hasRisk) {
      return 'The Risk-Taking Executive - Thrives on high-stakes decisions';
    }
    return 'The Strategic Builder - Methodical approach to growth';
  }
  
  // Fantasy/Adventure themes
  if (themeId === 'mystical-academy' || themeName.toLowerCase().includes('magic')) {
    const house = resultMap.house;
    if (house === 'courage-house') return 'The Brave Pathfinder - Courage-driven magical journey';
    if (house === 'wisdom-house') return 'The Scholarly Innovator - Knowledge-seeking mage';
    if (house === 'ambition-house') return 'The Ambitious Achiever - Power-focused magical path';
    if (house === 'loyalty-house') return 'The Loyal Protector - Community-centered magical journey';
  }
  
  if (themeId === 'survival-tournament') {
    const hasVictory = Object.values(resultMap).some(v => v.includes('victory'));
    
    if (hasVictory) {
      return 'The Resilient Victor - Overcame impossible odds through determination';
    }
    return 'The Fallen Hero - Sacrificed everything for the cause';
  }
  
  // Generic analysis based on choice patterns
  const hasHighRiskChoices = results.some(r => (r.spinResult.segment.weight || 50) < 25);
  const hasConsistentTheme = totalResults >= 3;
  
  if (hasHighRiskChoices && hasConsistentTheme) {
    return `The Bold Explorer - Unique ${themeName} character who chose the unlikely path`;
  }
  
  if (totalResults >= 5) {
    return `The Epic Journey Maker - Complex ${themeName} character with a rich story`;
  }
  
  return `The ${themeName} Pioneer - A unique path through your custom world`;
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
  const resultsList = results.map(r => {
    const stepTitle = r.stepId.replace(/-/g, ' ');
    if (r.multiSpinResults && r.multiSpinResults.length > 1) {
      // Multi-spin step: show all results
      const allSpins = r.multiSpinResults.map((spin, index) => `Spin ${index + 1}: ${spin.segment.text}`).join(', ');
      return `${stepTitle}: [Multi-Spin] ${allSpins}`;
    } else {
      // Single spin step
      return `${stepTitle}: ${r.spinResult.segment.text}`;
    }
  }).join('\n');
  
  if (themeId === 'survival-tournament') {
    return `Generate an epic survival tournament competitor story for this ${themeName} character with rarity score ${rarityScore}/100:

COMPETITOR JOURNEY:
${resultsList}

**IMPORTANT**: Detect the language used in the sequence choices above and write your ENTIRE response in that same language. 

Format your response exactly like this:

**STORY:**
[A compelling 3-4 paragraph narrative that follows their journey from Region to Arena to (potential) rebellion. Explain the rarity (what makes this combination special in the Empire's history)]

**CHARACTER:**
[Character analysis: What real-world leader, athlete, or historical figure does this path most resemble? Focus on personality traits, leadership style, and decision-making patterns rather than appearance - write this in the same language as the story above]

If they died in the Arena, focus on their heroic sacrifice and how it inspired the rebellion.
If they survived, show their transformation from competitor to rebel leader.
Include specific details about their Region skills, Arena survival tactics, and impact on the Empire's future.
Make the reader feel the stakes, the brutality, but also the hope that drives the revolution.`;
  }
  
  // Default Mystical Academy prompt  
  return `Generate a magical story for this ${themeName} character with rarity score ${rarityScore}/100:

RESULTS:
${resultsList}

**IMPORTANT**: Detect the language used in the sequence choices above and write your ENTIRE response in that same language. If my sequence choices are in English, write the story in English. If my sequence choices are in another language, write in that language.

Format your response exactly like this:

**STORY:**
[A compelling 3-4 paragraph narrative that weaves these results into an engaging magical journey. Explain the rarity (what makes this combination special/unique)]

**CHARACTER:**
[Character analysis: What type of person does this magical journey create? Reference real-world examples of leaders, innovators, or historical figures with similar traits and decision-making patterns - write this in the same language as the story above]

Focus on storytelling that brings these random results to life as a coherent, magical journey. Make the reader feel like this is THEIR unique mage story.`;
}

// Custom sequence functions
function getCustomThemeConfig(themeName: string, description?: string): ThemeConfig {
  return {
    universe: themeName,
    worldDescription: description || `the ${themeName.toLowerCase()} universe`,
    specialInstructions: `Create an authentic narrative that reflects the unique concept of "${themeName}". Focus on making the story feel personal and meaningful to the user's creative vision.`
  };
}

function calculateCustomRarityScore(results: SequenceResult[]): number {
  let totalRarityPoints = 0;
  
  // Base calculation for custom sequences
  for (const result of results) {
    // Handle multi-spin results if they exist
    if (result.multiSpinResults && result.multiSpinResults.length > 1) {
      // Calculate rarity for all spins in multi-spin sequence
      for (const spinResult of result.multiSpinResults) {
        const segment = spinResult.segment;
        const weightFactor = 100 - (segment.weight || 50); // Lower weight = higher rarity
        
        // Convert weight to rarity points (0-100 weight becomes 0-15 points)
        const weightRarityPoints = Math.round(weightFactor * 0.15);
        totalRarityPoints += weightRarityPoints;
        
        // Bonus for user-defined rarity levels
        const rarityPoints = {
          common: 1,
          uncommon: 3,
          rare: 8,
          legendary: 20
        };
        
        totalRarityPoints += rarityPoints[segment.rarity || 'common'];
      }
    } else {
      // Single spin result
      const segment = result.spinResult.segment;
      const weightFactor = 100 - (segment.weight || 50); // Lower weight = higher rarity
      
      // Convert weight to rarity points (0-100 weight becomes 0-15 points)
      const weightRarityPoints = Math.round(weightFactor * 0.15);
      totalRarityPoints += weightRarityPoints;
      
      // Bonus for user-defined rarity levels
      const rarityPoints = {
        common: 1,
        uncommon: 3,
        rare: 8,
        legendary: 20
      };
      
      totalRarityPoints += rarityPoints[segment.rarity || 'common'];
    }
  }
  
  // Bonus for sequence length (longer sequences are rarer)
  const lengthBonus = Math.min(results.length * 2, 20);
  totalRarityPoints += lengthBonus;
  
  // Add variability for path uniqueness
  const pathVariability = Math.min(results.length * 3, 25);
  totalRarityPoints += pathVariability;
  
  return Math.min(totalRarityPoints, 100);
}

function generateCustomStoryPrompt(
  results: SequenceResult[], 
  themeName: string, 
  description: string = '', 
  rarityScore: number
): string {
  const resultsList = results.map((r, index) => {
    const stepTitle = r.stepId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (r.multiSpinResults && r.multiSpinResults.length > 1) {
      // Multi-spin step: show all results
      const allSpins = r.multiSpinResults.map((spin, spinIndex) => `Spin ${spinIndex + 1}: ${spin.segment.text}`).join(', ');
      return `Step ${index + 1} - ${stepTitle}: [Multi-Spin] ${allSpins}`;
    } else {
      // Single spin step
      return `Step ${index + 1} - ${stepTitle}: ${r.spinResult.segment.text}`;
    }
  }).join('\n');
  
  return `Generate a personalized story for this "${themeName}" journey with rarity score ${rarityScore}/100:

SEQUENCE CONCEPT: ${description || `A custom ${themeName} experience`}

PLAYER CHOICES:
${resultsList}

**IMPORTANT**: Detect the language used in the sequence choices above and write your ENTIRE response in that same language. If my sequence choices are in English, write the story in English. If my sequence choices are in another language, write in that language.

Format your response exactly like this:

**STORY:**
[A compelling 3-4 paragraph narrative that connects these choices into a meaningful journey. Explain why this particular combination is special or rare (${rarityScore}/100 rarity)]

**CHARACTER:**
[Character analysis: What type of person does this journey create? If relevant to the theme (e.g., sports, leadership, business), reference real-world figures with similar traits or decision-making patterns - write this in the same language as the story above]

Focus on storytelling that transforms these individual choices into a coherent, engaging narrative. The reader should feel like this story is uniquely theirs, born from their specific decisions. Connect the choices in unexpected ways and highlight the narrative threads that make this combination special.

Make it immersive and authentic to the "${themeName}" concept while celebrating the uniqueness of this particular path through the sequence.`;
}

// Parse AI response to extract story and character analysis
function parseAIResponse(content: string): { story: string; characterArchetype: string } {
  try {
    // Look for **STORY:** and **CHARACTER:** sections
    const storyMatch = content.match(/\*\*STORY:\*\*\s*([\s\S]*?)(?=\*\*CHARACTER:\*\*|$)/i);
    const characterMatch = content.match(/\*\*CHARACTER:\*\*\s*([\s\S]*?)$/i);
    
    if (storyMatch && characterMatch) {
      return {
        story: storyMatch[1].trim(),
        characterArchetype: characterMatch[1].trim()
      };
    }
    
    // Fallback: if structured format not found, try to split by common patterns
    const sections = content.split(/(?:character analysis|character archetype|análisis de personaje|análisis del personaje)/i);
    if (sections.length >= 2) {
      return {
        story: sections[0].trim(),
        characterArchetype: sections[1].trim()
      };
    }
    
    // Final fallback: return the whole content as story with generic character
    return {
      story: content,
      characterArchetype: 'A unique character shaped by their distinctive journey'
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      story: content,
      characterArchetype: 'A unique character shaped by their distinctive journey'
    };
  }
}

