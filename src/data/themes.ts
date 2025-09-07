import { SequenceTheme } from '@/types/sequence';
import { WheelConfig } from '@/types/wheel';
import { BranchingConditions, createBranch } from '@/utils/branchingUtils';

// Arcane University Theme - Graduate Magical Studies
const mysticalAcademyTheme: SequenceTheme = {
  id: 'mystical-academy',
  name: 'Arcane University: Your Scholarly Path',
  description: 'Discover your complete magical education from aptitude assessment to your ultimate specialization',
  color: '#8B4513',
  startStepId: 'origin', // Define the starting step
  steps: [
    {
      id: 'origin',
      title: 'Your Origin',
      description: 'Where does your magical blood come from?',
      wheelConfig: {
        segments: [
          { id: 'common-born', text: 'Common-Born', color: '#E8C547', rarity: 'common', weight: 28 },
          { id: 'mixed-heritage', text: 'Mixed Heritage', color: '#7FB069', rarity: 'common', weight: 32 },
          { id: 'ancient-lineage', text: 'Ancient Lineage', color: '#4A90A4', rarity: 'uncommon', weight: 18 },
          { id: 'wildcard-origin', text: 'Wildcard Origin', color: '#B85450', rarity: 'uncommon', weight: 12 },
          { id: 'lost-bloodline', text: 'Lost Bloodline', color: '#8A4FFF', rarity: 'rare', weight: 6 },
          { id: 'first-generation', text: 'First Generation', color: '#FF6B9D', rarity: 'uncommon', weight: 4 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'house', // Linear progression to house selection
    },
    {
      id: 'house',
      title: 'Your Academic Specialization',
      description: 'Based on your aptitude assessment, which school of magical study suits you best?',
      wheelConfig: {
        segments: [
          { id: 'elemental-school', text: 'School of Elemental Magic', color: '#D3A625', rarity: 'common', weight: 25 },
          { id: 'research-school', text: 'School of Magical Research', color: '#2A623D', rarity: 'common', weight: 25 },
          { id: 'healing-school', text: 'School of Healing Arts', color: '#F0C75E', rarity: 'common', weight: 25 },
          { id: 'theoretical-school', text: 'School of Theoretical Magic', color: '#226B74', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      // Branching logic: Different magical specializations based on school
      branches: [
        createBranch('light-magic', [
          BranchingConditions.oneOf('house', ['elemental-school', 'healing-school'])
        ]),
        createBranch('dark-magic', [
          BranchingConditions.oneOf('house', ['research-school', 'theoretical-school'])
        ])
      ],
      defaultNextStep: 'wand', // Fallback to original path
    },
    
    // Branching Paths: Different Magic Specializations
    {
      id: 'light-magic',
      title: 'Light Magic Specialization',
      description: 'Learn the protective and healing arts...',
      wheelConfig: {
        segments: [
          { id: 'healing', text: 'Healing Magic', color: '#E6E6FA', rarity: 'common', weight: 30 },
          { id: 'protection', text: 'Protection Charms', color: '#4682B4', rarity: 'common', weight: 30 },
          { id: 'transfiguration', text: 'Transfiguration', color: '#32CD32', rarity: 'uncommon', weight: 25 },
          { id: 'patronus', text: 'Patronus Magic', color: '#FFD700', rarity: 'rare', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'wand', // Merge back to main path
    },
    
    {
      id: 'dark-magic',
      title: 'Advanced Magic Specialization', 
      description: 'Master the complex and forbidden arts...',
      wheelConfig: {
        segments: [
          { id: 'legilimency', text: 'Legilimency', color: '#4B0082', rarity: 'rare', weight: 20 },
          { id: 'occlumency', text: 'Occlumency', color: '#800080', rarity: 'rare', weight: 20 },
          { id: 'advanced-potions', text: 'Advanced Potions', color: '#2F4F2F', rarity: 'uncommon', weight: 30 },
          { id: 'ancient-runes', text: 'Ancient Runes', color: '#8B4513', rarity: 'uncommon', weight: 25 },
          { id: 'dark-arts', text: 'Dark Arts Defense', color: '#DC143C', rarity: 'legendary', weight: 5 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'wand', // Merge back to main path
    },
    
    {
      id: 'wand',
      title: 'Your Wand',
      description: 'The mystical focus chooses the mage, remember...',
      wheelConfig: {
        segments: [
          // Legendary combinations (rarest, most powerful)
          { id: 'crystal-phoenix', text: 'Crystal Staff & Phoenix Essence', color: '#8B0000', rarity: 'legendary', weight: 5 },
          { id: 'moonstone-phoenix', text: 'Moonstone Wand & Phoenix Essence', color: '#2F2F2F', rarity: 'legendary', weight: 3 },
          { id: 'obsidian-phoenix', text: 'Obsidian Rod & Phoenix Essence', color: '#556B2F', rarity: 'legendary', weight: 4 },
          
          // Rare combinations (special properties)
          { id: 'ruby-dragon', text: 'Ruby Focus & Dragon Core', color: '#DC143C', rarity: 'rare', weight: 8 },
          { id: 'amber-dragon', text: 'Amber Wand & Dragon Core', color: '#8B4513', rarity: 'rare', weight: 9 },
          { id: 'emerald-dragon', text: 'Emerald Staff & Dragon Core', color: '#2F4F2F', rarity: 'rare', weight: 7 },
          { id: 'onyx-dragon', text: 'Onyx Rod & Dragon Core', color: '#000000', rarity: 'rare', weight: 6 },
          
          // Uncommon combinations (solid performance)
          { id: 'topaz-phoenix', text: 'Topaz Wand & Phoenix Essence', color: '#D2691E', rarity: 'uncommon', weight: 12 },
          { id: 'garnet-dragon', text: 'Garnet Staff & Dragon Core', color: '#CD853F', rarity: 'uncommon', weight: 13 },
          { id: 'jade-spirit', text: 'Jade Focus & Spirit Energy', color: '#8B7355', rarity: 'uncommon', weight: 11 },
          { id: 'sapphire-dragon', text: 'Sapphire Rod & Dragon Core', color: '#A0522D', rarity: 'uncommon', weight: 10 },
          
          // Common combinations (reliable, widespread)
          { id: 'quartz-spirit', text: 'Quartz Wand & Spirit Energy', color: '#D2B48C', rarity: 'common', weight: 18 },
          { id: 'silver-spirit', text: 'Silver Staff & Spirit Energy', color: '#DEB887', rarity: 'common', weight: 19 },
          { id: 'copper-spirit', text: 'Copper Focus & Spirit Energy', color: '#F5DEB3', rarity: 'common', weight: 17 },
          { id: 'bronze-spirit', text: 'Bronze Rod & Spirit Energy', color: '#9ACD32', rarity: 'common', weight: 16 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'school-performance',
    },
    
    // NEW: School Performance - How did you do at the Academy?
    {
      id: 'school-performance',
      title: 'Your Academy Achievement',
      description: 'How did you distinguish yourself at the Academy?',
      wheelConfig: {
        segments: [
          { id: 'flight-captain', text: 'Skyball Captain', color: '#DAA520', rarity: 'rare', weight: 12 },
          { id: 'prefect', text: 'House Prefect', color: '#4169E1', rarity: 'uncommon', weight: 18 },
          { id: 'head-student', text: 'Academy Leader', color: '#FFD700', rarity: 'legendary', weight: 6 },
          { id: 'top-grades', text: 'Outstanding Student', color: '#9932CC', rarity: 'uncommon', weight: 16 },
          { id: 'flight-star', text: 'Skyball Star Player', color: '#FF6347', rarity: 'uncommon', weight: 15 },
          { id: 'dueling-champion', text: 'Spell-Duel Champion', color: '#8B0000', rarity: 'rare', weight: 10 },
          { id: 'popular-student', text: 'Most Popular Student', color: '#FF69B4', rarity: 'common', weight: 20 },
          { id: 'rule-breaker', text: 'Notorious Rule-Breaker', color: '#2F4F2F', rarity: 'uncommon', weight: 13 },
          { id: 'quiet-genius', text: 'Quiet Genius', color: '#4682B4', rarity: 'common', weight: 17 },
          { id: 'class-clown', text: 'Class Prankster', color: '#FFA500', rarity: 'common', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'pet',
    },
    {
      id: 'pet',
      title: 'Your Magical Companion',
      description: 'Choose your faithful partner for the magical journey',
      wheelConfig: {
        segments: [
          // Common Academy familiars
          { id: 'snowy-owl', text: 'Wise Snowy Owl', color: '#F8F8FF', rarity: 'common', weight: 18 },
          { id: 'brown-owl', text: 'Clever Brown Owl', color: '#8B7355', rarity: 'common', weight: 16 },
          { id: 'tabby-cat', text: 'Mystical Tabby Cat', color: '#CD853F', rarity: 'common', weight: 17 },
          { id: 'black-cat', text: 'Shadow Cat', color: '#2F2F2F', rarity: 'common', weight: 15 },
          { id: 'common-toad', text: 'Oracle Toad', color: '#6B8E23', rarity: 'uncommon', weight: 12 },
          
          // Uncommon familiars
          { id: 'rat', text: 'Clever Rat Companion', color: '#A0522D', rarity: 'uncommon', weight: 10 },
          { id: 'ferret', text: 'Swift Ferret', color: '#DEB887', rarity: 'uncommon', weight: 8 },
          
          // Rare/Special companions
          { id: 'snake', text: 'Mystic Serpent', color: '#228B22', rarity: 'rare', weight: 6 },
          { id: 'fluff-ball', text: 'Magical Fluff Creature', color: '#FF69B4', rarity: 'rare', weight: 5 },
          { id: 'tree-sprite', text: 'Forest Sprite', color: '#8FBC8F', rarity: 'rare', weight: 4 },
          
          // Ultra-rare magical companions  
          { id: 'phoenix', text: 'Phoenix Chick', color: '#FF4500', rarity: 'legendary', weight: 2 },
          { id: 'shadow-horse', text: 'Shadow Pegasus Foal', color: '#2F2F2F', rarity: 'legendary', weight: 1 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'purpose',
    },
    
    // NEW: Life Purpose - The game-changing addition!
    {
      id: 'purpose',
      title: 'Your Magical Purpose',
      description: 'What drives you in the magical world?',
      wheelConfig: {
        segments: [
          { id: 'defeat-darkness', text: 'Defeat Dark Forces', color: '#8B0000', rarity: 'legendary', weight: 8 },
          { id: 'protect-muggles', text: 'Protect Muggles', color: '#4682B4', rarity: 'common', weight: 20 },
          { id: 'discover-magic', text: 'Discover New Magic', color: '#9932CC', rarity: 'uncommon', weight: 18 },
          { id: 'save-creatures', text: 'Save Magical Creatures', color: '#228B22', rarity: 'uncommon', weight: 18 },
          { id: 'become-guardian', text: 'Become a Guardian', color: '#B8860B', rarity: 'uncommon', weight: 16 },
          { id: 'teach-academy', text: 'Teach at the Academy', color: '#8B4513', rarity: 'uncommon', weight: 12 },
          { id: 'master-potions', text: 'Master All Potions', color: '#2F4F2F', rarity: 'rare', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      // Branching based on purpose - different career paths
      branches: [
        createBranch('hero-career', [
          BranchingConditions.oneOf('purpose', ['defeat-darkness', 'protect-muggles', 'become-guardian'])
        ]),
        createBranch('scholar-career', [
          BranchingConditions.oneOf('purpose', ['discover-magic', 'teach-academy', 'master-potions'])
        ]),
        createBranch('nature-career', [
          BranchingConditions.oneOf('purpose', ['save-creatures'])
        ])
      ],
      defaultNextStep: 'spell', // Fallback to spell selection
    },
    
    // CAREER PATH 1: Hero/Protector Track
    {
      id: 'hero-career',
      title: 'Your Heroic Career',
      description: 'Choose your path as a protector of the magical world',
      wheelConfig: {
        segments: [
          { id: 'guardian', text: 'Magic Guardian', color: '#B8860B', rarity: 'common', weight: 30 },
          { id: 'battle-mage', text: 'Elite Battle Mage', color: '#8B0000', rarity: 'uncommon', weight: 20 },
          { id: 'academy-security', text: 'Academy Security', color: '#4682B4', rarity: 'common', weight: 25 },
          { id: 'dragon-keeper', text: 'Dragon Keeper', color: '#DC143C', rarity: 'rare', weight: 15 },
          { id: 'curse-breaker', text: 'Curse Breaker', color: '#FFD700', rarity: 'rare', weight: 10 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'spell',
    },
    
    // CAREER PATH 2: Scholar/Academic Track  
    {
      id: 'scholar-career',
      title: 'Your Academic Career',
      description: 'Dedicate your life to magical knowledge and teaching',
      wheelConfig: {
        segments: [
          { id: 'potions-master', text: 'Potions Master', color: '#2F4F2F', rarity: 'rare', weight: 15 },
          { id: 'herbology-professor', text: 'Herbology Professor', color: '#6B8E23', rarity: 'uncommon', weight: 20 },
          { id: 'charms-professor', text: 'Charms Professor', color: '#4169E1', rarity: 'uncommon', weight: 20 },
          { id: 'transfiguration-master', text: 'Transfiguration Master', color: '#32CD32', rarity: 'rare', weight: 15 },
          { id: 'magical-researcher', text: 'Magical Researcher', color: '#9932CC', rarity: 'uncommon', weight: 20 },
          { id: 'unspeakable', text: 'Unspeakable', color: '#4B0082', rarity: 'legendary', weight: 10 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'spell',
    },
    
    // CAREER PATH 3: Nature/Creature Track
    {
      id: 'nature-career', 
      title: 'Your Magical Creature Career',
      description: 'Work with the magical creatures of the world',
      wheelConfig: {
        segments: [
          { id: 'magizoologist', text: 'Magizoologist', color: '#8FBC8F', rarity: 'uncommon', weight: 25 },
          { id: 'dragon-trainer', text: 'Dragon Trainer', color: '#DC143C', rarity: 'rare', weight: 15 },
          { id: 'unicorn-researcher', text: 'Unicorn Researcher', color: '#E6E6FA', rarity: 'rare', weight: 12 },
          { id: 'creature-healer', text: 'Creature Healer', color: '#90EE90', rarity: 'uncommon', weight: 20 },
          { id: 'forest-keeper', text: 'Forest Keeper', color: '#228B22', rarity: 'uncommon', weight: 20 },
          { id: 'phoenix-whisperer', text: 'Phoenix Whisperer', color: '#FFD700', rarity: 'legendary', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      defaultNextStep: 'spell',
    },
    
    {
      id: 'spell',
      title: 'Your Signature Spell',
      description: 'What magic defines your legacy?',
      wheelConfig: {
        segments: [
          { id: 'disarm-spell', text: 'Mystic Disarm', color: '#FF6347', rarity: 'uncommon', weight: 18 },
          { id: 'light-spell', text: 'Eternal Light', color: '#FFD700', rarity: 'common', weight: 20 },
          { id: 'unlock-spell', text: 'Universal Key', color: '#4169E1', rarity: 'common', weight: 18 },
          { id: 'guardian-spirit', text: 'Guardian Spirit', color: '#E6E6FA', rarity: 'legendary', weight: 5 },
          { id: 'stun-spell', text: 'Lightning Stun', color: '#DC143C', rarity: 'uncommon', weight: 15 },
          { id: 'summon-spell', text: 'Mystic Summon', color: '#32CD32', rarity: 'common', weight: 16 },
          { id: 'shield-spell', text: 'Arcane Shield', color: '#4682B4', rarity: 'uncommon', weight: 12 },
          { id: 'void-spell', text: 'Void Strike', color: '#228B22', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      // No defaultNextStep - this is the end of the sequence
    },
  ],
  narrativeTemplate: "You are a {origin} scholar specializing in {house}, mastering your {wand} focus with your loyal {pet} by your side. At the University, you were known as a {school-performance}. Your purpose is to {purpose}, working as a {career}, with {spell} as your signature research.",
  narrativeTemplates: {
    // Easter Egg: The Chosen One Path
    'chosen-one': "🔥 THE LEGENDARY RESEARCHER 🔥\n\nYou are a {origin} scholar from {house}, wielding the legendary {wand} focus - one of the most powerful research tools ever created. At the University, you distinguished yourself as a {school-performance}, showing early signs of greatness. Your {pet} has been your faithful companion through countless discoveries. Driven to {purpose}, you've become the most renowned {hero-career} of your generation. Your breakthrough with {spell} has revolutionized the magical world itself. History will remember you as the one who changed everything.",
    
    // Easter Egg: The Dark Lord Path
    'dark-lord': "💀 THE FORBIDDEN RESEARCHER 💀\n\nBorn a {origin} scholar, you specialized in {house} where your ambition knew no bounds. Your {wand} focus trembles with forbidden power, while your {pet} serves as your most loyal assistant. Your purpose to {purpose} has twisted into something far more sinister. As a master of the {dark-magic}, you've become the most feared {scholar-career} in academic history. Your signature research {spell} strikes terror into the hearts of your peers. The magical world whispers your name in fear.",
    
    // Easter Egg: The Grand Protector Path
    'grand-protector': "✨ THE GRAND PROFESSOR ✨\n\nA wise {origin} scholar from {house}, you wield your {wand} focus not for glory, but for the protection of all. Your {pet} has been witness to decades of your wisdom. Your calling to {purpose} has made you the greatest {scholar-career} of your time. Through your mastery of {light-magic} and your signature {spell}, you've become the mentor that the magical world turns to in its darkest hours. Love and wisdom guide every lesson you teach.",
    
    // Standard Path Templates
    'hero-path': "⚔️ You are a brave {origin} scholar from {house}. With your {wand} focus and {pet} companion, you've answered the call to {purpose} by becoming an elite {hero-career}. Your mastery of {spell} makes you a legendary protector of the magical world, feared by dark researchers and celebrated by the innocent.",
    
    'scholar-path': "📚 You are a brilliant {origin} scholar from {house}, driven by an insatiable desire to {purpose}. As a renowned {scholar-career}, you wield your {wand} focus in the pursuit of forbidden knowledge, with your {pet} as your devoted research companion. Your groundbreaking work with {spell} has revolutionized magical understanding for generations.",
    
    'nature-path': "🌿 You are a gentle {origin} scholar from {house} who has dedicated their life to {purpose}. Working as a legendary {nature-career}, you use your {wand} focus to heal and protect the magical creatures of the world. Your {pet} was the first to recognize your gift, and your signature {spell} allows you to speak the ancient language of the wild.",
    
    'light-path': "🌟 You are a {origin} scholar from {house}, blessed with the rare gift of {light-magic}. With your {wand} focus and {pet} companion, you've devoted your life to {purpose}. Your mastery of {spell} brings hope and healing wherever darkness threatens to consume the magical world.",
    
    'dark-path': "🐍 You are a {origin} scholar from {house}, who has delved deep into the forbidden art of {dark-magic}. Your {wand} focus pulses with dangerous power, while your {pet} serves as both companion and co-conspirator. Driven to {purpose}, your mastery of {spell} makes even the bravest scholars step aside when you pass.",
    
    'default': "You are a {origin} scholar specializing in {house}, wielding a {wand} focus with your loyal {pet} by your side. Your purpose is to {purpose}, and {spell} is your signature research."
  },
};

// Battle Royale Championship Theme - Underground Death Match Tournament
const battleRoyaleChampionshipTheme: SequenceTheme = {
  id: 'battle-royale-championship',
  name: 'Battle Royale Championship: Fight for Freedom',
  description: 'From desperate contestant to ultimate survivor - compete in the deadliest underground tournament for the ultimate prize: your freedom',
  color: '#8B0000', // Dark red for danger
  startStepId: 'region',
  steps: [
    // Wheel 1: Region Origin
    {
      id: 'region',
      title: 'Your Region Origin',
      description: 'Where you\'re from determines your skills, resources, and survival chances',
      wheelConfig: {
        segments: [
          { id: 'region-1', text: 'Luxury Region', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'region-2', text: 'Industrial Region', color: '#808080', rarity: 'uncommon', weight: 12 },
          { id: 'region-3', text: 'Tech Region', color: '#4169E1', rarity: 'common', weight: 8 },
          { id: 'region-4', text: 'Coastal Region', color: '#0080FF', rarity: 'uncommon', weight: 10 },
          { id: 'region-5', text: 'Energy Region', color: '#FFFF00', rarity: 'common', weight: 7 },
          { id: 'region-6', text: 'Transport Region', color: '#A0522D', rarity: 'common', weight: 7 },
          { id: 'region-7', text: 'Forest Region', color: '#228B22', rarity: 'common', weight: 9 },
          { id: 'region-8', text: 'Manufacturing Region', color: '#800080', rarity: 'common', weight: 8 },
          { id: 'region-9', text: 'Agricultural Region', color: '#DAA520', rarity: 'common', weight: 7 },
          { id: 'region-10', text: 'Ranch Region', color: '#8B4513', rarity: 'common', weight: 8 },
          { id: 'region-11', text: 'Farming Region', color: '#6B8E23', rarity: 'common', weight: 8 },
          { id: 'region-12', text: 'Mining Region', color: '#2F2F2F', rarity: 'legendary', weight: 1 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      defaultNextStep: 'competitor-status',
    },

    // Wheel 2: Entry Method  
    {
      id: 'competitor-status',
      title: 'How You Entered',
      description: 'Your path into this underground death tournament determines your preparation and mindset',
      wheelConfig: {
        segments: [
          { id: 'elite-volunteer', text: 'Professional Fighter', color: '#B8860B', rarity: 'uncommon', weight: 35 },
          { id: 'volunteer-save', text: 'Taking Someone\'s Place', color: '#DC143C', rarity: 'rare', weight: 10 },
          { id: 'reluctant-volunteer', text: 'Desperate for Prize Money', color: '#8B4513', rarity: 'uncommon', weight: 8 },
          { id: 'selected-first', text: 'Recruited by Organizers', color: '#4682B4', rarity: 'common', weight: 40 },
          { id: 'selected-multiple', text: 'Returning Contestant', color: '#8B0000', rarity: 'common', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      // All entry methods go to the same next step
      defaultNextStep: 'training-score',
    },

    // Wheel 3: Combat Assessment
    {
      id: 'training-score', 
      title: 'Your Combat Assessment',
      description: 'Official evaluation determines betting odds and initial threat level',
      wheelConfig: {
        segments: [
          { id: 'score-12', text: 'Score 12', color: '#FF0000', rarity: 'legendary', weight: 1 },
          { id: 'score-11', text: 'Score 11', color: '#FF4500', rarity: 'legendary', weight: 1 },
          { id: 'score-10', text: 'Score 10', color: '#FFD700', rarity: 'rare', weight: 4 },
          { id: 'score-9', text: 'Score 9', color: '#FFA500', rarity: 'rare', weight: 4 },
          { id: 'score-8', text: 'Score 8', color: '#FFFF00', rarity: 'uncommon', weight: 7 },
          { id: 'score-7', text: 'Score 7', color: '#ADFF2F', rarity: 'uncommon', weight: 8 },
          { id: 'score-6', text: 'Score 6', color: '#32CD32', rarity: 'common', weight: 17 },
          { id: 'score-5', text: 'Score 5', color: '#90EE90', rarity: 'common', weight: 18 },
          { id: 'score-4', text: 'Score 4', color: '#87CEEB', rarity: 'common', weight: 15 },
          { id: 'score-3', text: 'Score 3', color: '#4682B4', rarity: 'common', weight: 15 },
          { id: 'score-2', text: 'Score 2', color: '#6A5ACD', rarity: 'uncommon', weight: 5 },
          { id: 'score-1', text: 'Score 1', color: '#8B4513', rarity: 'uncommon', weight: 5 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      defaultNextStep: 'battle-environment',
    },

    // Wheel 4: Battle Zone Environment
    {
      id: 'battle-environment',
      title: 'Your Battle Zone', 
      description: 'The battleground chosen by the tournament organizers',
      wheelConfig: {
        segments: [
          { id: 'dense-forest', text: 'Dense Forest', color: '#228B22', rarity: 'common', weight: 20 },
          { id: 'desert-wasteland', text: 'Desert Wasteland', color: '#DAA520', rarity: 'common', weight: 15 },
          { id: 'frozen-tundra', text: 'Frozen Tundra', color: '#87CEEB', rarity: 'uncommon', weight: 12 },
          { id: 'tropical-island', text: 'Tropical Island', color: '#20B2AA', rarity: 'common', weight: 18 },
          { id: 'mountain-peaks', text: 'Mountain Peaks', color: '#A0522D', rarity: 'uncommon', weight: 10 },
          { id: 'urban-ruins', text: 'Urban Ruins', color: '#696969', rarity: 'common', weight: 15 },
          { id: 'underground-maze', text: 'Underground Maze', color: '#2F2F2F', rarity: 'rare', weight: 8 },
          { id: 'volcanic-hellscape', text: 'Volcanic Hellscape', color: '#FF4500', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      defaultNextStep: 'alliance-strategy',
    },

    // Wheel 5: Alliance Strategy
    {
      id: 'alliance-strategy',
      title: 'Your Alliance Strategy',
      description: 'Who you trust determines your mid-tournament survival',
      wheelConfig: {
        segments: [
          { id: 'elite-pack', text: 'Join Elite Pack', color: '#B8860B', rarity: 'common', weight: 25 },
          { id: 'region-alliance', text: 'Form Region Alliance', color: '#4682B4', rarity: 'uncommon', weight: 15 },
          { id: 'unexpected-alliance', text: 'Unexpected Alliance', color: '#9370DB', rarity: 'common', weight: 20 },
          { id: 'protect-younger', text: 'Protect Younger Competitor', color: '#FFB6C1', rarity: 'uncommon', weight: 10 },
          { id: 'solo-survivor', text: 'Solo Survivor', color: '#2F4F2F', rarity: 'common', weight: 20 },
          { id: 'secret-romance', text: 'Secret Romance', color: '#FF69B4', rarity: 'rare', weight: 8 },
          { id: 'betrayal-plot', text: 'Betrayal Plot', color: '#8B0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      defaultNextStep: 'opening-bloodbath',
    },

    // Wheel 6: Cornucopia Bloodbath (BINARY)
    {
      id: 'opening-bloodbath',
      title: 'Opening Bloodbath',
      description: 'The 60-second massacre that claims half the competitors',
      wheelConfig: {
        segments: [
          { id: 'survive-bloodbath', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 75 },
          { id: 'die-bloodbath', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        // Death branch - end sequence
        createBranch('bloodbath-death', [
          BranchingConditions.equals('opening-bloodbath', 'die-bloodbath')
        ]),
        // Survival continues to next challenge
      ],
      defaultNextStep: 'first-night-survival',
    },

    // DEATH ENDING: Bloodbath
    {
      id: 'bloodbath-death',
      title: 'Your Story Ends', 
      description: 'The bloodbath claims another victim',
      wheelConfig: {
        segments: [
          { id: 'quick-death', text: 'Quick Death in Chaos', color: '#8B0000', rarity: 'common', weight: 50 },
          { id: 'heroic-death', text: 'Died Protecting Someone', color: '#FFD700', rarity: 'uncommon', weight: 30 },
          { id: 'tragic-death', text: 'Fell Reaching for Supplies', color: '#4682B4', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      // No next step - this ends the sequence
    },

    // Wheel 7: First Night Survival (BINARY)  
    {
      id: 'first-night-survival',
      title: 'First Night Survival',
      description: 'Exposure, dehydration, and basic survival threaten the remaining contestants',
      wheelConfig: {
        segments: [
          { id: 'survive-night', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 80 },
          { id: 'die-exposure', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        createBranch('exposure-death', [
          BranchingConditions.equals('first-night-survival', 'die-exposure')
        ]),
      ],
      defaultNextStep: 'engineered-threat-encounter',
    },

    // DEATH ENDING: Exposure
    {
      id: 'exposure-death',
      title: 'Death by Exposure',
      description: 'The harsh conditions claim another life',
      wheelConfig: {
        segments: [
          { id: 'hypothermia', text: 'Died from Cold', color: '#87CEEB', rarity: 'common', weight: 40 },
          { id: 'dehydration', text: 'Died from Thirst', color: '#DAA520', rarity: 'common', weight: 35 },
          { id: 'starvation', text: 'Died from Hunger', color: '#8B4513', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
    },

    // Wheel 8: Engineered Threat Encounter (BINARY - conditional on forest zones)
    {
      id: 'engineered-threat-encounter',
      title: 'Engineered Threat Encounter',
      description: 'Deadly mechanical drones designed to hunt contestants',
      wheelConfig: {
        segments: [
          { id: 'survive-trackers', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 70 },
          { id: 'die-trackers', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 30 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        createBranch('tracker-death', [
          BranchingConditions.equals('engineered-threat-encounter', 'die-trackers')
        ]),
        // Skip this wheel if not in forest/tropical arena
        createBranch('battle-disaster-survival', [
          BranchingConditions.oneOf('battle-environment', ['urban-ruins', 'underground-maze', 'volcanic-hellscape', 'desert-wasteland', 'frozen-tundra', 'mountain-peaks'])
        ])
      ],
      defaultNextStep: 'battle-disaster-survival',
    },

    // DEATH ENDING: Mechanical Hunters
    {
      id: 'tracker-death',
      title: 'Death by Mechanical Hunters',
      description: 'The tournament organizers\' deadly drones claim another victim',
      wheelConfig: {
        segments: [
          { id: 'drone-hunted', text: 'Hunted by Combat Drones', color: '#FF69B4', rarity: 'common', weight: 50 },
          { id: 'laser-death', text: 'Killed by Laser Grid', color: '#228B22', rarity: 'common', weight: 30 },
          { id: 'explosive-death', text: 'Caught in Explosive Trap', color: '#FFD700', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
    },

    // Wheel 9: Battle Zone Disaster Survival (BINARY)
    {
      id: 'battle-disaster-survival',
      title: 'Battle Zone Disaster Survival',
      description: 'Official manipulation: fire, floods, earthquakes, or toxic gas',
      wheelConfig: {
        segments: [
          { id: 'survive-disaster', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 65 },
          { id: 'die-disaster', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 35 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        createBranch('disaster-death', [
          BranchingConditions.equals('battle-disaster-survival', 'die-disaster')
        ]),
      ],
      defaultNextStep: 'robot-attack',
    },

    // DEATH ENDING: Battle Zone Disaster
    {
      id: 'disaster-death',
      title: 'Death by Zone Manipulation',
      description: 'The Officials\' cruelty claims another life',
      wheelConfig: {
        segments: [
          { id: 'fire-death', text: 'Consumed by Fire', color: '#FF4500', rarity: 'common', weight: 30 },
          { id: 'flood-death', text: 'Drowned in Flash Flood', color: '#0080FF', rarity: 'common', weight: 25 },
          { id: 'earthquake-death', text: 'Crushed by Earthquake', color: '#A0522D', rarity: 'common', weight: 25 },
          { id: 'poison-death', text: 'Killed by Toxic Gas', color: '#228B22', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
    },

    // Wheel 10: Mechanical Beast Attack (BINARY)
    {
      id: 'robot-attack',
      title: 'Robotic Beast Attack',
      description: 'Tournament organizers release mechanical predators into the zone',
      wheelConfig: {
        segments: [
          { id: 'survive-robots', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 60 },
          { id: 'die-robots', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 40 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        createBranch('robot-death', [
          BranchingConditions.equals('robot-attack', 'die-robots')
        ]),
      ],
      defaultNextStep: 'alliance-betrayal-test',
    },

    // DEATH ENDING: Mechanical Beast Attack
    {
      id: 'robot-death',
      title: 'Death by Robotic Predators',
      description: 'The tournament organizers\' mechanical beasts prove unstoppable',
      wheelConfig: {
        segments: [
          { id: 'wolf-robots', text: 'Killed by Robot Wolves', color: '#2F2F2F', rarity: 'common', weight: 40 },
          { id: 'hunter-drones', text: 'Hunted by Aerial Drones', color: '#8B0000', rarity: 'common', weight: 30 },
          { id: 'spider-bots', text: 'Poisoned by Spider Bots', color: '#228B22', rarity: 'common', weight: 30 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
    },

    // Wheel 11: Alliance Betrayal Test (BINARY - only if in alliance)
    {
      id: 'alliance-betrayal-test',
      title: 'Alliance Betrayal Test',
      description: 'Your alliance turns on you or asks for ultimate sacrifice',
      wheelConfig: {
        segments: [
          { id: 'survive-betrayal', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 55 },
          { id: 'die-betrayal', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 45 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      branches: [
        createBranch('betrayal-death', [
          BranchingConditions.equals('alliance-betrayal-test', 'die-betrayal')
        ]),
        // Skip this wheel if solo survivor
        createBranch('final-showdown', [
          BranchingConditions.equals('alliance-strategy', 'solo-survivor')
        ])
      ],
      defaultNextStep: 'final-showdown',
    },

    // DEATH ENDING: Betrayal
    {
      id: 'betrayal-death',
      title: 'Death by Betrayal',
      description: 'Trust becomes your final weakness',
      wheelConfig: {
        segments: [
          { id: 'ally-murder', text: 'Killed by Ally', color: '#8B0000', rarity: 'common', weight: 50 },
          { id: 'sacrificial-death', text: 'Died Protecting Ally', color: '#FFD700', rarity: 'uncommon', weight: 30 },
          { id: 'abandoned-death', text: 'Abandoned to Die', color: '#4682B4', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
    },

    // Wheel 12: Final Showdown (VICTORY or death)
    {
      id: 'final-showdown',
      title: 'Final Showdown', 
      description: 'Last 2-3 competitors remaining - victory or death',
      wheelConfig: {
        segments: [
          { id: 'brutal-victory', text: 'Brutal Victory', color: '#8B0000', rarity: 'uncommon', weight: 30 },
          { id: 'strategic-victory', text: 'Strategic Victory', color: '#4169E1', rarity: 'uncommon', weight: 25 },
          { id: 'sacrifice-victory', text: 'Sacrifice Victory', color: '#FFD700', rarity: 'rare', weight: 20 },
          { id: 'joint-victory', text: 'Joint Victory', color: '#FF69B4', rarity: 'rare', weight: 15 },
          { id: 'mercy-victory', text: 'Mercy Victory', color: '#90EE90', rarity: 'rare', weight: 8 },
          { id: 'rule-change-victory', text: 'Rule Change Exploitation', color: '#9370DB', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      defaultNextStep: 'rebellion-role',
    },

    // Wheel 13: Your Legacy (final wheel for survivors)
    {
      id: 'rebellion-role',
      title: 'Your Prize and Legacy',
      description: 'Having won the ultimate tournament, what do you do with your freedom and fortune?',
      wheelConfig: {
        segments: [
          { id: 'wealthy-champion', text: 'Wealthy Champion', color: '#FFD700', rarity: 'legendary', weight: 25 },
          { id: 'underground-hero', text: 'Underground Hero', color: '#2F4F2F', rarity: 'rare', weight: 20 },
          { id: 'freedom-fighter', text: 'Freedom Fighter', color: '#228B22', rarity: 'rare', weight: 18 },
          { id: 'mentor-trainer', text: 'Mentor & Trainer', color: '#4682B4', rarity: 'uncommon', weight: 15 },
          { id: 'tournament-exposer', text: 'Tournament Exposer', color: '#800080', rarity: 'rare', weight: 12 },
          { id: 'media-celebrity', text: 'Media Celebrity', color: '#FF6347', rarity: 'uncommon', weight: 8 },
          { id: 'organizer-hunter', text: 'Organizer Hunter', color: '#8B0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'battle-royale-championship',
      },
      // No defaultNextStep - this is the final wheel
    },
  ],
  
  narrativeTemplate: "You were a competitor from {region} who entered the underground death tournament as a {competitor-status}, earning a combat assessment of {training-score} in the {battle-environment} battle zone. Following a {alliance-strategy} strategy, you survived the initial massacre and fought through every deadly challenge the organizers threw at you. Your {final-showdown} led to your new life as a {rebellion-role}, using your prize money and fame to make your mark on the world.",
  
  narrativeTemplates: {
    // Death storylines
    'bloodbath-victim': "💀 THE BLOODBATH VICTIM 💀\n\nYou were a {competitor-status} from {region} with a combat assessment of {training-score}. Your journey ended in the first 60 seconds of the tournament - {bloodbath-death}. But even in death, your courage inspired others to question the brutal system. Your region remembers you as someone who faced impossible odds with dignity.",
    
    'exposure-victim': "❄️ CLAIMED BY THE ELEMENTS ❄️\n\nA {competitor-status} from {region}, you survived the initial massacre only to fall to the {battle-environment}'s harsh conditions. You {exposure-death}, but your determination to survive inspired others. Your family back home knows you fought until your last breath, and your memory lives on in those who knew your spirit.",
    
    'tracker-victim': "🤖 FALLEN TO MECHANICAL HUNTERS 🤖\n\nFrom {region} with a score of {training-score}, you made it through multiple battle zone challenges before encountering the organizers' deadliest trap. You {tracker-death} in the combat area, but your survival skills kept you alive longer than most. Others will remember how the tournament's twisted technology claimed a true fighter.",
    
    'disaster-victim': "🌋 TOURNAMENT MANIPULATION VICTIM 🌋\n\nA brave {competitor-status} from {region}, you proved your worth by surviving the initial massacre and early challenges. When the organizers intervened with environmental hazards, you {disaster-death}, showing their true cruelty. Your death exposed their manipulation and became a symbol of the tournament's brutality.",
    
    'robot-victim': "🤖 KILLED BY MECHANICAL PREDATORS 🤖\n\nYou made it further than most - a {competitor-status} from {region} who survived every human threat in the battle zone. But the organizers' final robotic weapons proved too much, and you were {robot-death}. Your courage in facing these mechanical monsters showed everyone what true bravery looks like.",
    
    'betrayal-victim': "💔 BETRAYED IN THE FINAL MOMENTS 💔\n\nA {competitor-status} from {region}, you survived every battle zone trap through your {alliance-strategy} strategy. In the end, you were {betrayal-death}, proving how the tournament's pressure corrupts even the closest bonds. Your loyalty and sacrifice became a lesson in the cost of trust.",
    
    // Victory storylines  
    'brutal-survivor': "⚔️ THE BRUTAL SURVIVOR ⚔️\n\nFrom {region} with a combat assessment of {training-score}, you fought through every death trap with ruthless determination. Your {brutal-victory} came at a terrible cost - the lives you took haunt your dreams. But as a {rebellion-role}, you channeled that pain into something meaningful. The tournament made you a killer; freedom made you choose who to become.",
    
    'strategic-mastermind': "🧠 THE STRATEGIC MASTERMIND 🧠\n\nA brilliant {competitor-status} from {region}, you proved that mind conquers muscle. Through careful planning and your {strategic-victory}, you outmaneuvered every threat in the {battle-environment}. As a {rebellion-role}, your tactical genius became your greatest asset in your new life.",
    
    'unlikely-hero': "🏹 THE UNLIKELY HERO 🏹\n\nYou were just a {competitor-status} from {region} - no one expected you to survive. But through your {sacrifice-victory} and pure determination, you became something more. As a {rebellion-role}, you proved that heroes aren't born from privilege - they're forged in the fires of impossible odds.",
    
    'star-crossed': "💕 THE STAR-CROSSED SURVIVORS 💕\n\nTwo hearts from {region} who found love in the darkest place. Your {joint-victory} gave the world something beautiful - proof that humanity endures. Together as {rebellion-role}, you became the symbol that love conquers even the cruelest circumstances.",
    
    'perfect-champion': "🔥 THE PERFECT CHAMPION 🔥\n\nFrom {region}, you entered the tournament to save someone you loved and scored an incredible {training-score}. Your {joint-victory} after exploiting the organizers' rules broke their system entirely. As a {rebellion-role}, you became the symbol that showed the world what true strength looks like. You are the champion who burned down the corrupt system.",
    
    'default': "You were a {competitor-status} from {region} who survived the tournament and became a {rebellion-role}."
  }
};

// Detective Mystery Theme - Complete Crime Story Arc
const detectiveMysteryTheme: SequenceTheme = {
  id: 'detective-mystery',
  name: 'Detective Mystery: Justice Served',
  description: 'Solve crimes, uncover suspects, catch criminals, and see justice served - experience the full detective story from crime scene to courtroom',
  color: '#2F4F4F',
  startStepId: 'city',
  steps: [
    // Step 1: Choose Your City
    {
      id: 'city',
      title: 'Your Detective City',
      description: 'Where does your detective story begin?',
      wheelConfig: {
        segments: [
          { id: 'neo-tokyo', text: 'Neo-Tokyo', color: '#FF1493', rarity: 'uncommon', weight: 10 },
          { id: 'victorian-london', text: 'Victorian London', color: '#8B4513', rarity: 'rare', weight: 6 },
          { id: 'modern-new-york', text: 'Modern New York', color: '#4169E1', rarity: 'common', weight: 12 },
          { id: 'coastal-town', text: 'Small Coastal Town', color: '#20B2AA', rarity: 'common', weight: 11 },
          { id: 'las-vegas', text: 'Las Vegas', color: '#FFD700', rarity: 'uncommon', weight: 8 },
          { id: 'new-orleans', text: 'New Orleans', color: '#9370DB', rarity: 'uncommon', weight: 10 },
          { id: 'chicago', text: 'Chicago', color: '#DC143C', rarity: 'common', weight: 11 },
          { id: 'miami', text: 'Miami', color: '#FF69B4', rarity: 'uncommon', weight: 9 },
          { id: 'detroit', text: 'Detroit', color: '#2F4F4F', rarity: 'common', weight: 10 },
          { id: 'seattle', text: 'Seattle', color: '#4682B4', rarity: 'common', weight: 9 },
          { id: 'mountain-town', text: 'Remote Mountain Town', color: '#8B4513', rarity: 'uncommon', weight: 8 },
          { id: 'desert-city', text: 'Desert Border City', color: '#CD853F', rarity: 'uncommon', weight: 7 },
          { id: 'industrial-city', text: 'Industrial Rust Belt City', color: '#696969', rarity: 'common', weight: 9 },
          { id: 'college-town', text: 'University College Town', color: '#228B22', rarity: 'uncommon', weight: 8 },
          { id: 'resort-destination', text: 'Tourist Resort Destination', color: '#FF6347', rarity: 'uncommon', weight: 7 },
          { id: 'farming-community', text: 'Rural Farming Community', color: '#9ACD32', rarity: 'common', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'crime-discovery',
    },

    // Step 2: The Crime Discovery
    {
      id: 'crime-discovery',
      title: 'The Crime Scene',
      description: 'What horrific scene greets you this morning?',
      wheelConfig: {
        segments: [
          { id: 'locked-mansion', text: 'Locked Mansion Murder', color: '#8B0000', rarity: 'uncommon', weight: 12 },
          { id: 'serial-killer', text: 'Serial Killer\'s Latest', color: '#DC143C', rarity: 'rare', weight: 8 },
          { id: 'art-heist', text: 'High-Stakes Art Heist', color: '#B8860B', rarity: 'uncommon', weight: 10 },
          { id: 'corporate-murder', text: 'Corporate Executive Found Dead', color: '#2F4F2F', rarity: 'common', weight: 12 },
          { id: 'missing-child', text: 'Missing Child Case', color: '#FF69B4', rarity: 'common', weight: 12 },
          { id: 'cold-case', text: 'Cold Case Reopened', color: '#4682B4', rarity: 'uncommon', weight: 10 },
          { id: 'bank-heist', text: 'Bank Heist Gone Wrong', color: '#FFD700', rarity: 'uncommon', weight: 10 },
          { id: 'witness-protection', text: 'Witness Protection Murder', color: '#2F4F4F', rarity: 'rare', weight: 6 },
          { id: 'political-assassination', text: 'Political Assassination', color: '#800080', rarity: 'rare', weight: 6 },
          { id: 'art-forgery-ring', text: 'International Art Forgery Ring', color: '#9370DB', rarity: 'rare', weight: 5 },
          { id: 'human-trafficking', text: 'Human Trafficking Network', color: '#8B0000', rarity: 'uncommon', weight: 8 },
          { id: 'cybercrime', text: 'High-Tech Cybercrime', color: '#4169E1', rarity: 'uncommon', weight: 9 },
          { id: 'domestic-terrorism', text: 'Domestic Terrorism Plot', color: '#DC143C', rarity: 'rare', weight: 4 },
          { id: 'celebrity-stalker', text: 'Celebrity Stalker Case', color: '#FF1493', rarity: 'uncommon', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'detective-specialty',
    },

    // Step 3: Detective Specialty
    {
      id: 'detective-specialty',
      title: 'Your Investigative Expertise',
      description: 'What\'s your detective superpower?',
      wheelConfig: {
        segments: [
          { id: 'forensic-genius', text: 'Forensic Genius', color: '#E6E6FA', rarity: 'uncommon', weight: 12 },
          { id: 'psychology-master', text: 'Psychology Master', color: '#9370DB', rarity: 'uncommon', weight: 11 },
          { id: 'tech-detective', text: 'Tech Detective', color: '#4169E1', rarity: 'rare', weight: 8 },
          { id: 'street-veteran', text: 'Street Veteran', color: '#A0522D', rarity: 'common', weight: 14 },
          { id: 'by-the-book', text: 'By-the-Book Professional', color: '#228B22', rarity: 'common', weight: 13 },
          { id: 'undercover-specialist', text: 'Undercover Specialist', color: '#2F2F2F', rarity: 'rare', weight: 8 },
          { id: 'homicide-specialist', text: 'Homicide Specialist', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'cold-case-expert', text: 'Cold Case Expert', color: '#4682B4', rarity: 'uncommon', weight: 9 },
          { id: 'financial-crimes', text: 'Financial Crimes Expert', color: '#FFD700', rarity: 'uncommon', weight: 8 },
          { id: 'gang-specialist', text: 'Gang Task Force Specialist', color: '#DC143C', rarity: 'uncommon', weight: 7 },
          { id: 'behavioral-analyst', text: 'Behavioral Analyst', color: '#800080', rarity: 'rare', weight: 6 },
          { id: 'narcotics-detective', text: 'Narcotics Detective', color: '#228B22', rarity: 'common', weight: 9 },
          { id: 'cybercrime-expert', text: 'Cybercrime Expert', color: '#00CED1', rarity: 'rare', weight: 5 },
          { id: 'rookie-prodigy', text: 'Rookie Prodigy', color: '#FF69B4', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'initial-evidence',
    },

    // Step 4: Initial Evidence Collection
    {
      id: 'initial-evidence',
      title: 'Initial Evidence Discovery',
      description: 'Your first sweep of the crime scene reveals crucial evidence...',
      wheelConfig: {
        segments: [
          { id: 'dna-evidence', text: 'DNA Evidence Found', color: '#E6E6FA', rarity: 'common', weight: 15 },
          { id: 'fingerprints', text: 'Clear Fingerprints', color: '#4682B4', rarity: 'common', weight: 14 },
          { id: 'murder-weapon', text: 'Murder Weapon Discovered', color: '#8B0000', rarity: 'uncommon', weight: 12 },
          { id: 'digital-traces', text: 'Digital Footprints', color: '#4169E1', rarity: 'uncommon', weight: 11 },
          { id: 'witness-statement', text: 'Key Witness Statement', color: '#32CD32', rarity: 'common', weight: 13 },
          { id: 'security-footage', text: 'Security Camera Footage', color: '#2F2F2F', rarity: 'uncommon', weight: 10 },
          { id: 'financial-records', text: 'Suspicious Financial Records', color: '#FFD700', rarity: 'uncommon', weight: 9 },
          { id: 'threatening-letters', text: 'Threatening Letters/Messages', color: '#DC143C', rarity: 'common', weight: 12 },
          { id: 'personal-belongings', text: 'Victim\'s Personal Items', color: '#9370DB', rarity: 'common', weight: 11 },
          { id: 'no-evidence', text: 'Scene Suspiciously Clean', color: '#696969', rarity: 'rare', weight: 6 },
          { id: 'planted-evidence', text: 'Evidence Seems Planted', color: '#FF4500', rarity: 'rare', weight: 5 },
          { id: 'multiple-scenes', text: 'Multiple Crime Scenes Found', color: '#8B008B', rarity: 'rare', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'first-lead-investigation',
    },

    // Step 5: First Lead Investigation
    {
      id: 'first-lead-investigation',
      title: 'Following Your First Lead',
      description: 'The evidence points to a specific direction. Your investigation reveals...',
      wheelConfig: {
        segments: [
          { id: 'secret-affair', text: 'Victim\'s Secret Affair', color: '#FF1493', rarity: 'common', weight: 14 },
          { id: 'financial-motive', text: 'Major Financial Motive', color: '#228B22', rarity: 'common', weight: 15 },
          { id: 'blackmail-scheme', text: 'Elaborate Blackmail Scheme', color: '#800080', rarity: 'uncommon', weight: 12 },
          { id: 'professional-hit', text: 'Professional Assassination', color: '#2F2F2F', rarity: 'rare', weight: 8 },
          { id: 'family-secrets', text: 'Dark Family Secrets', color: '#8B0000', rarity: 'uncommon', weight: 11 },
          { id: 'business-rivalry', text: 'Deadly Business Rivalry', color: '#4682B4', rarity: 'common', weight: 13 },
          { id: 'witness-intimidation', text: 'Witness Intimidation Pattern', color: '#DC143C', rarity: 'uncommon', weight: 10 },
          { id: 'drug-connection', text: 'Drug Trade Connection', color: '#228B22', rarity: 'uncommon', weight: 9 },
          { id: 'political-conspiracy', text: 'Political Conspiracy', color: '#4B0082', rarity: 'rare', weight: 6 },
          { id: 'cult-involvement', text: 'Religious Cult Involvement', color: '#8B008B', rarity: 'rare', weight: 5 },
          { id: 'identity-theft', text: 'Stolen Identity Discovery', color: '#FF4500', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'investigation-obstacle',
    },

    // Step 6: Investigation Obstacle
    {
      id: 'investigation-obstacle',
      title: 'Major Investigation Obstacle',
      description: 'Just when you think you\'re making progress, you encounter...',
      wheelConfig: {
        segments: [
          { id: 'corrupt-officials', text: 'Corrupt Officials Block You', color: '#8B0000', rarity: 'uncommon', weight: 14 },
          { id: 'evidence-disappears', text: 'Key Evidence Disappears', color: '#2F2F2F', rarity: 'uncommon', weight: 13 },
          { id: 'witness-murdered', text: 'Key Witness Murdered', color: '#DC143C', rarity: 'rare', weight: 10 },
          { id: 'false-confession', text: 'Someone Confesses Falsely', color: '#9370DB', rarity: 'uncommon', weight: 12 },
          { id: 'media-interference', text: 'Media Circus Interference', color: '#FF4500', rarity: 'common', weight: 15 },
          { id: 'jurisdiction-battle', text: 'Jurisdiction Battle', color: '#4682B4', rarity: 'common', weight: 14 },
          { id: 'superior-pressure', text: 'Pressure from Superiors', color: '#800080', rarity: 'common', weight: 13 },
          { id: 'victim-family-lies', text: 'Victim\'s Family Lies', color: '#B8860B', rarity: 'uncommon', weight: 11 },
          { id: 'federal-takeover', text: 'Federal Agency Takeover', color: '#191970', rarity: 'rare', weight: 7 },
          { id: 'personal-threat', text: 'Personal Death Threat', color: '#8B0000', rarity: 'rare', weight: 6 },
          { id: 'lawyer-obstruction', text: 'High-Powered Lawyer Obstruction', color: '#2F4F4F', rarity: 'uncommon', weight: 9 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'suspect-count-determiner',
    },

    // Step 7A: Suspect Count Determiner (System-Generated)
    {
      id: 'suspect-count-determiner',
      title: 'Suspect Count Determiner',
      description: 'How many potential suspects emerge from your initial investigation?',
      isDeterminer: true,
      targetStepId: 'potential-suspects',
      wheelConfig: {
        segments: [
          { id: '1-spin', text: '1', color: '#FF6B6B', weight: 20, rarity: 'common' },
          { id: '2-spins', text: '2', color: '#4ECDC4', weight: 25, rarity: 'common' },
          { id: '3-spins', text: '3', color: '#45B7D1', weight: 25, rarity: 'common' },
          { id: '4-spins', text: '4', color: '#96CEB4', weight: 20, rarity: 'uncommon' },
          { id: '5-spins', text: '5', color: '#FECA57', weight: 10, rarity: 'rare' },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery'
      },
      defaultNextStep: 'potential-suspects',
    },

    // Step 4B: Potential Suspects (Multi-Spin Dynamic)
    {
      id: 'potential-suspects',
      title: 'Potential Suspects',
      description: 'Each person of interest in your investigation becomes a lead to follow',
      multiSpin: {
        enabled: true,
        mode: 'dynamic',
        determinerStepId: 'suspect-count-determiner',
        aggregateResults: true
      },
      wheelConfig: {
        segments: [
          // Family & Personal Connections
          { id: 'grieving-spouse', text: 'The Grieving Spouse', color: '#4682B4', rarity: 'common', weight: 15 },
          { id: 'estranged-child', text: 'Estranged Adult Child', color: '#8B0000', rarity: 'common', weight: 14 },
          { id: 'jealous-sibling', text: 'Jealous Sibling', color: '#DC143C', rarity: 'common', weight: 13 },
          { id: 'best-friend', text: 'Longtime Best Friend', color: '#FF69B4', rarity: 'common', weight: 12 },
          { id: 'secret-lover', text: 'Secret Lover', color: '#FF1493', rarity: 'uncommon', weight: 10 },
          
          // Professional Connections
          { id: 'business-partner', text: 'Business Partner', color: '#B8860B', rarity: 'common', weight: 14 },
          { id: 'former-employee', text: 'Disgruntled Ex-Employee', color: '#2F4F2F', rarity: 'common', weight: 13 },
          { id: 'rival-competitor', text: 'Business Rival', color: '#800080', rarity: 'uncommon', weight: 11 },
          { id: 'crooked-lawyer', text: 'Shady Lawyer', color: '#556B2F', rarity: 'uncommon', weight: 9 },
          { id: 'corrupt-accountant', text: 'Corrupt Accountant', color: '#8B4513', rarity: 'uncommon', weight: 8 },
          
          // Criminal Connections
          { id: 'loan-shark', text: 'Loan Shark Enforcer', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'drug-dealer', text: 'Local Drug Dealer', color: '#228B22', rarity: 'uncommon', weight: 9 },
          { id: 'gang-member', text: 'Gang Associate', color: '#4B0082', rarity: 'rare', weight: 7 },
          { id: 'hitman', text: 'Professional Hitman', color: '#2F2F2F', rarity: 'rare', weight: 6 },
          
          // Mysterious & Unusual
          { id: 'mysterious-stranger', text: 'Mysterious Stranger', color: '#9370DB', rarity: 'uncommon', weight: 11 },
          { id: 'obsessed-stalker', text: 'Obsessed Stalker', color: '#DC143C', rarity: 'rare', weight: 8 },
          { id: 'cult-member', text: 'Cult Member', color: '#8B008B', rarity: 'rare', weight: 6 },
          { id: 'serial-killer', text: 'Serial Killer', color: '#000000', rarity: 'legendary', weight: 4 },
          
          // Authority Figures
          { id: 'corrupt-cop', text: 'Corrupt Police Officer', color: '#191970', rarity: 'rare', weight: 7 },
          { id: 'dirty-politician', text: 'Dirty Politicians', color: '#800000', rarity: 'rare', weight: 6 },
          { id: 'judge-connection', text: 'Connected Judge', color: '#2F4F4F', rarity: 'legendary', weight: 3 },
          
          // Unexpected Suspects
          { id: 'victim-double', text: 'Victim\'s Body Double', color: '#FFD700', rarity: 'legendary', weight: 2 },
          { id: 'identical-twin', text: 'Secret Identical Twin', color: '#FF4500', rarity: 'legendary', weight: 2 },
          { id: 'witness', text: 'Key Witness', color: '#32CD32', rarity: 'uncommon', weight: 10 },
          
          // Additional Suspects - Professional/Medical  
          { id: 'corrupt-judge', text: 'Corrupt Judge', color: '#2F4F2F', rarity: 'rare', weight: 4 },
          { id: 'undercover-agent', text: 'Undercover Federal Agent', color: '#191970', rarity: 'rare', weight: 5 },
          { id: 'victim-therapist', text: 'Victim\'s Therapist', color: '#9370DB', rarity: 'uncommon', weight: 7 },
          { id: 'blackmail-victim', text: 'Blackmail Victim', color: '#800080', rarity: 'uncommon', weight: 8 },
          { id: 'witness-protection-person', text: 'Person in Witness Protection', color: '#4682B4', rarity: 'rare', weight: 6 },
          { id: 'foreign-operative', text: 'Foreign Intelligence Operative', color: '#8B008B', rarity: 'rare', weight: 4 },
          { id: 'plastic-surgeon', text: 'Plastic Surgeon', color: '#FF69B4', rarity: 'uncommon', weight: 6 },
          { id: 'insurance-investigator', text: 'Insurance Investigator', color: '#4169E1', rarity: 'uncommon', weight: 7 },
          { id: 'victim-doppelganger', text: 'Victim\'s Doppelganger', color: '#FF4500', rarity: 'legendary', weight: 3 },
          { id: 'amnesia-suspect', text: 'Suspect with Amnesia', color: '#9370DB', rarity: 'rare', weight: 5 },
          { id: 'online-stalker', text: 'Anonymous Online Stalker', color: '#2F2F2F', rarity: 'uncommon', weight: 8 },
          { id: 'victim-clone', text: 'Victim\'s Genetic Clone', color: '#FF0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'investigation-method',
    },

    // Step 5: Investigation Method
    {
      id: 'investigation-method',
      title: 'Your Investigation Approach',
      description: 'How do you pursue the truth?',
      wheelConfig: {
        segments: [
          { id: 'follow-money', text: 'Follow the Money', color: '#FFD700', rarity: 'common', weight: 12 },
          { id: 'psychological-pressure', text: 'Psychological Pressure', color: '#9370DB', rarity: 'uncommon', weight: 10 },
          { id: 'surveillance', text: 'Surveillance Operation', color: '#2F2F2F', rarity: 'uncommon', weight: 11 },
          { id: 'forensic-analysis', text: 'Forensic Deep Dive', color: '#E6E6FA', rarity: 'uncommon', weight: 12 },
          { id: 'witness-protection', text: 'Witness Protection', color: '#4682B4', rarity: 'rare', weight: 8 },
          { id: 'undercover-infiltration', text: 'Undercover Infiltration', color: '#8B0000', rarity: 'rare', weight: 10 },
          { id: 'data-mining', text: 'Digital Data Mining', color: '#4169E1', rarity: 'uncommon', weight: 9 },
          { id: 'informant-network', text: 'Informant Network', color: '#A0522D', rarity: 'uncommon', weight: 9 },
          { id: 'psychological-profiling', text: 'Psychological Profiling', color: '#800080', rarity: 'uncommon', weight: 8 },
          { id: 'crime-scene-reconstruction', text: 'Crime Scene Reconstruction', color: '#228B22', rarity: 'rare', weight: 7 },
          { id: 'social-media-investigation', text: 'Social Media Investigation', color: '#FF1493', rarity: 'common', weight: 10 },
          { id: 'financial-forensics', text: 'Financial Forensics', color: '#B8860B', rarity: 'uncommon', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'mid-investigation-revelation',
    },

    // Step 9: Mid-Investigation Revelation
    {
      id: 'mid-investigation-revelation',
      title: 'Mid-Investigation Breakthrough',
      description: 'Halfway through your investigation, a crucial discovery changes everything...',
      wheelConfig: {
        segments: [
          { id: 'second-murder', text: 'Second Murder Occurs', color: '#8B0000', rarity: 'uncommon', weight: 14 },
          { id: 'victim-alive-revelation', text: 'Victim Still Alive Discovery', color: '#228B22', rarity: 'rare', weight: 8 },
          { id: 'evidence-planted', text: 'Evidence Was Planted', color: '#FF4500', rarity: 'uncommon', weight: 12 },
          { id: 'witness-recants', text: 'Key Witness Recants Testimony', color: '#9370DB', rarity: 'common', weight: 15 },
          { id: 'new-suspect-emerges', text: 'Completely New Suspect Emerges', color: '#4169E1', rarity: 'common', weight: 16 },
          { id: 'suicide-revelation', text: 'Victim\'s Suicide Note Found', color: '#2F4F2F', rarity: 'uncommon', weight: 11 },
          { id: 'coverup-discovered', text: 'Massive Cover-Up Discovered', color: '#800080', rarity: 'rare', weight: 9 },
          { id: 'wrong-identity', text: 'Victim\'s True Identity Revealed', color: '#DC143C', rarity: 'uncommon', weight: 10 },
          { id: 'faked-death', text: 'Death Was Faked', color: '#FFD700', rarity: 'rare', weight: 7 },
          { id: 'conspiracy-uncovered', text: 'Criminal Conspiracy Uncovered', color: '#4B0082', rarity: 'rare', weight: 6 },
          { id: 'informant-betrayal', text: 'Trusted Informant\'s Betrayal', color: '#8B4513', rarity: 'uncommon', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'breakthrough-evidence',
    },

    // Step 10: Breakthrough Evidence Discovery
    {
      id: 'breakthrough-evidence',
      title: 'The Breakthrough Evidence',
      description: 'Finally, you discover the evidence that will crack the case wide open...',
      wheelConfig: {
        segments: [
          { id: 'dna-match', text: 'DNA Match in Database', color: '#E6E6FA', rarity: 'common', weight: 16 },
          { id: 'hidden-camera', text: 'Hidden Camera Footage', color: '#2F2F2F', rarity: 'uncommon', weight: 13 },
          { id: 'confession-recording', text: 'Secret Confession Recording', color: '#DC143C', rarity: 'uncommon', weight: 12 },
          { id: 'financial-smoking-gun', text: 'Financial Smoking Gun', color: '#FFD700', rarity: 'common', weight: 15 },
          { id: 'murder-weapon-found', text: 'Murder Weapon Finally Found', color: '#8B0000', rarity: 'uncommon', weight: 11 },
          { id: 'eyewitness-comes-forward', text: 'Eyewitness Finally Comes Forward', color: '#32CD32', rarity: 'common', weight: 14 },
          { id: 'digital-evidence', text: 'Incriminating Digital Evidence', color: '#4169E1', rarity: 'uncommon', weight: 10 },
          { id: 'accomplice-confession', text: 'Accomplice Confesses', color: '#9370DB', rarity: 'rare', weight: 8 },
          { id: 'victim-diary', text: 'Victim\'s Secret Diary', color: '#FF69B4', rarity: 'uncommon', weight: 9 },
          { id: 'forensic-breakthrough', text: 'Forensic Science Breakthrough', color: '#228B22', rarity: 'rare', weight: 6 },
          { id: 'insider-tip', text: 'Anonymous Insider Tip', color: '#800080', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'plot-twist',
    },

    // Step 11: Plot Twist
    {
      id: 'plot-twist',
      title: 'The Shocking Revelation',
      description: 'What revelation changes everything?',
      wheelConfig: {
        segments: [
          { id: 'wrong-victim', text: 'Wrong Victim', color: '#FF4500', rarity: 'uncommon', weight: 18 },
          { id: 'inside-job', text: 'Inside Job', color: '#8B0000', rarity: 'rare', weight: 12 },
          { id: 'false-memory', text: 'False Memory', color: '#9370DB', rarity: 'rare', weight: 10 },
          { id: 'twin-switch', text: 'Twin Switch', color: '#4169E1', rarity: 'legendary', weight: 8 },
          { id: 'victim-alive', text: 'Victim Still Alive', color: '#228B22', rarity: 'rare', weight: 14 },
          { id: 'time-paradox', text: 'Time Travel Paradox', color: '#800080', rarity: 'legendary', weight: 3 },
          { id: 'multiple-personalities', text: 'Multiple Personality Disorder', color: '#FF1493', rarity: 'rare', weight: 7 },
          { id: 'suicide-staged', text: 'Suicide Staged as Murder', color: '#2F4F2F', rarity: 'uncommon', weight: 10 },
          { id: 'witness-protection-blown', text: 'Witness Protection Cover Blown', color: '#4682B4', rarity: 'uncommon', weight: 9 },
          { id: 'serial-killer-copycat', text: 'Serial Killer Copycat', color: '#DC143C', rarity: 'uncommon', weight: 8 },
          { id: 'government-conspiracy', text: 'Government Black Ops Cover-Up', color: '#191970', rarity: 'rare', weight: 6 },
          { id: 'medical-experiment', text: 'Illegal Medical Experiment', color: '#8B008B', rarity: 'rare', weight: 5 },
          { id: 'victim-is-killer', text: 'Victim is the Real Killer', color: '#FF0000', rarity: 'legendary', weight: 4 },
          { id: 'international-spy', text: 'International Spy Network', color: '#4B0082', rarity: 'rare', weight: 6 },
          { id: 'cult-sacrifice', text: 'Ritual Cult Sacrifice', color: '#8B0000', rarity: 'rare', weight: 5 },
          { id: 'virtual-reality', text: 'Virtual Reality Simulation', color: '#00CED1', rarity: 'legendary', weight: 3 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'real-culprit',
    },

    // Step 7: Real Culprit
    {
      id: 'real-culprit',
      title: 'The Real Mastermind',
      description: 'Who was behind it all along?',
      wheelConfig: {
        segments: [
          { id: 'innocent-bystander', text: 'The Innocent Bystander', color: '#4682B4', rarity: 'uncommon', weight: 12 },
          { id: 'victims-child', text: 'Victim\'s Own Child', color: '#8B0000', rarity: 'rare', weight: 10 },
          { id: 'dirty-partner', text: 'Your Original Partner', color: '#2F2F2F', rarity: 'rare', weight: 10 },
          { id: 'corrupt-official', text: 'Mayor/Judge/Chief', color: '#800080', rarity: 'legendary', weight: 6 },
          { id: 'professional-hitman', text: 'Professional Hitman', color: '#DC143C', rarity: 'uncommon', weight: 14 },
          { id: 'jealous-ex', text: 'Jealous Ex-Lover', color: '#FF69B4', rarity: 'common', weight: 18 },
          { id: 'business-rival', text: 'Ruthless Business Rival', color: '#B8860B', rarity: 'common', weight: 16 },
          { id: 'serial-killer', text: 'Hidden Serial Killer', color: '#800000', rarity: 'rare', weight: 8 },
          { id: 'undercover-agent', text: 'Double Agent', color: '#2E8B57', rarity: 'rare', weight: 9 },
          { id: 'family-member', text: 'Victim\'s Sibling', color: '#CD5C5C', rarity: 'uncommon', weight: 13 },
          { id: 'cult-leader', text: 'Cult Leader', color: '#4B0082', rarity: 'legendary', weight: 5 },
          { id: 'blackmail-victim', text: 'Blackmail Victim', color: '#696969', rarity: 'uncommon', weight: 15 },
          { id: 'medical-examiner', text: 'The Medical Examiner', color: '#708090', rarity: 'rare', weight: 7 },
          { id: 'defense-attorney', text: 'Defense Attorney', color: '#556B2F', rarity: 'uncommon', weight: 11 },
          { id: 'crime-boss', text: 'Crime Boss', color: '#000000', rarity: 'legendary', weight: 4 },
          { id: 'vigilante', text: 'Vigilante Killer', color: '#8B4513', rarity: 'rare', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'confrontation',
    },

    // Step 8: Confrontation
    {
      id: 'confrontation',
      title: 'The Final Confrontation',
      description: 'How do you face the suspect?',
      wheelConfig: {
        segments: [
          { id: 'high-speed-chase', text: 'High-Speed Chase', color: '#FF4500', rarity: 'uncommon', weight: 12 },
          { id: 'rooftop-standoff', text: 'Rooftop Standoff', color: '#4169E1', rarity: 'uncommon', weight: 10 },
          { id: 'warehouse-trap', text: 'Warehouse Trap', color: '#2F2F2F', rarity: 'uncommon', weight: 10 },
          { id: 'courtroom-confession', text: 'Public Confession', color: '#B8860B', rarity: 'rare', weight: 8 },
          { id: 'quiet-arrest', text: 'Quiet Arrest', color: '#228B22', rarity: 'common', weight: 14 },
          { id: 'hostage-situation', text: 'Hostage Situation', color: '#8B0000', rarity: 'rare', weight: 9 },
          { id: 'abandoned-factory', text: 'Abandoned Factory Showdown', color: '#696969', rarity: 'uncommon', weight: 9 },
          { id: 'courthouse-escape', text: 'Courthouse Escape Attempt', color: '#4682B4', rarity: 'uncommon', weight: 8 },
          { id: 'underground-tunnel', text: 'Underground Tunnel Chase', color: '#8B4513', rarity: 'uncommon', weight: 7 },
          { id: 'helicopter-pursuit', text: 'Helicopter Pursuit', color: '#FF69B4', rarity: 'rare', weight: 6 },
          { id: 'cruise-ship', text: 'Cruise Ship Confrontation', color: '#20B2AA', rarity: 'rare', weight: 5 },
          { id: 'hospital-standoff', text: 'Hospital Emergency Standoff', color: '#DC143C', rarity: 'uncommon', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'trial-outcome',
    },

    // Step 9: Trial Outcome
    {
      id: 'trial-outcome',
      title: 'The Jury\'s Decision',
      description: 'What does justice decide?',
      wheelConfig: {
        segments: [
          { id: 'life-sentence', text: 'Life Without Parole', color: '#2F2F2F', rarity: 'common', weight: 25 },
          { id: 'death-penalty', text: 'Death Penalty', color: '#8B0000', rarity: 'uncommon', weight: 15 },
          { id: 'twenty-five-to-life', text: '25-to-Life', color: '#4682B4', rarity: 'common', weight: 22 },
          { id: 'insanity-verdict', text: 'Guilty But Insane', color: '#9370DB', rarity: 'uncommon', weight: 16 },
          { id: 'shocking-acquittal', text: 'Shocking Acquittal', color: '#DC143C', rarity: 'rare', weight: 10 },
          { id: 'plea-bargain', text: 'Plea Bargain', color: '#B8860B', rarity: 'uncommon', weight: 12 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'aftermath',
    },

    // Step 10: Aftermath
    {
      id: 'aftermath',
      title: 'Your Story\'s End',
      description: 'How does your detective story conclude?',
      wheelConfig: {
        segments: [
          { id: 'hero-detective', text: 'Hero Detective', color: '#FFD700', rarity: 'common', weight: 22 },
          { id: 'haunted-by-case', text: 'Haunted by Case', color: '#2F2F2F', rarity: 'common', weight: 20 },
          { id: 'corruption-exposed', text: 'Corruption Exposed', color: '#FF4500', rarity: 'rare', weight: 15 },
          { id: 'cold-case-unit', text: 'Cold Case Unit', color: '#4682B4', rarity: 'uncommon', weight: 18 },
          { id: 'private-practice', text: 'Private Practice', color: '#228B22', rarity: 'common', weight: 17 },
          { id: 'family-revenge', text: 'Victim\'s Family Revenge', color: '#8B0000', rarity: 'rare', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'professional-consequences',
    },

    // Step 13: Professional Consequences
    {
      id: 'professional-consequences',
      title: 'Professional Consequences',
      description: 'How did this case impact your detective career?',
      wheelConfig: {
        segments: [
          { id: 'promoted-captain', text: 'Promoted to Captain', color: '#FFD700', rarity: 'uncommon', weight: 12 },
          { id: 'commendation', text: 'Official Commendation', color: '#32CD32', rarity: 'common', weight: 16 },
          { id: 'transferred-away', text: 'Quietly Transferred', color: '#4682B4', rarity: 'common', weight: 14 },
          { id: 'early-retirement', text: 'Forced Early Retirement', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'book-deal', text: 'Bestselling Book Deal', color: '#9370DB', rarity: 'rare', weight: 8 },
          { id: 'consulting-career', text: 'Private Consulting Career', color: '#228B22', rarity: 'uncommon', weight: 11 },
          { id: 'demoted-rank', text: 'Demoted in Rank', color: '#DC143C', rarity: 'uncommon', weight: 9 },
          { id: 'internal-investigation', text: 'Under Internal Investigation', color: '#2F2F2F', rarity: 'uncommon', weight: 8 },
          { id: 'media-celebrity', text: 'Media Celebrity Status', color: '#FF69B4', rarity: 'rare', weight: 6 },
          { id: 'ptsd-leave', text: 'PTSD Medical Leave', color: '#800080', rarity: 'uncommon', weight: 9 },
          { id: 'teaching-academy', text: 'Teaching at Police Academy', color: '#4169E1', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      // Final step - no defaultNextStep
    },
  ],

  narrativeTemplate: "In {city}, you investigated a {crime-discovery} using your expertise as a {detective-specialty}. Initial evidence revealed {initial-evidence}, leading to {first-lead-investigation}. Despite facing {investigation-obstacle}, your {investigation-method} approach uncovered {mid-investigation-revelation}. The breakthrough came with {breakthrough-evidence}, followed by a shocking {plot-twist}. The real mastermind was {real-culprit}, leading to a dramatic {confrontation}. The trial resulted in {trial-outcome}, your story ended with {aftermath}, and the case's impact resulted in {professional-consequences}.",

  narrativeTemplates: {
    // Legendary Case: The Perfect Detective
    'perfect-detective': "🔍 THE PERFECT DETECTIVE 🔍\n\nIn {city}, you faced the impossible - a {crime-discovery} that seemed unsolvable. As a brilliant {detective-specialty}, you methodically investigated every lead, from multiple suspects including {potential-suspects} to uncovering the {plot-twist} that revealed {real-culprit} as the mastermind. Your {confrontation} became legendary, the {trial-outcome} brought perfect justice, and you became a {hero-detective} whose methods are still taught at police academies worldwide.",

    // Dark Path: The Haunted Investigator  
    'haunted-detective': "👻 THE HAUNTED DETECTIVE 👻\n\nThe {crime-discovery} in {city} changed you forever. Your {detective-specialty} skills led you through a maze of suspects, investigating everyone from {potential-suspects}, but the {plot-twist} revealing {real-culprit} shattered your faith in justice. Even after the {confrontation} and {trial-outcome}, you remain {haunted-by-case}, carrying the weight of what you've seen in the darkest corners of human nature.",

    // Corruption Path: The System Fighter
    'corruption-fighter': "⚖️ THE CORRUPTION FIGHTER ⚖️\n\nIn {city}, your investigation of a {crime-discovery} uncovered more than just a crime - it exposed a web of corruption reaching the highest levels. Your {detective-specialty} training led you to investigate suspects like {potential-suspects}, but your {investigation-method} revealed that {real-culprit} was just a pawn. The {confrontation} was dangerous, but the {trial-outcome} led to massive reforms. You became the detective who {corruption-exposed}, reshaping law enforcement forever.",

    // Hero Path: The People's Champion
    'peoples-champion': "👮 THE PEOPLE'S CHAMPION 👮\n\nStarting as a {detective-specialty} in {city}, you turned a simple {crime-discovery} into a career-defining moment. Your thorough investigation of suspects like {potential-suspects} eventually led you to discover {real-culprit} was the true villain, your {confrontation} became the stuff of legends. The {trial-outcome} brought justice, and as a {hero-detective}, you became the symbol of what law enforcement should be.",

    // Tragic Path: The Broken Detective
    'broken-detective': "💔 THE BROKEN DETECTIVE 💔\n\nIn {city}, the {crime-discovery} seemed routine until the {plot-twist} revealed truths you weren't prepared for. Your {detective-specialty} skills led you to investigate multiple suspects including {potential-suspects}, but couldn't protect you from the psychological damage when {real-culprit}'s true nature was exposed. Despite the {confrontation} and {trial-outcome}, you're {haunted-by-case}, forever changed by a case that revealed the depths of human evil.",

    // Victory Path: The Master Investigator
    'master-investigator': "🏆 THE MASTER INVESTIGATOR 🏆\n\nYour reputation as a {detective-specialty} in {city} was built on cases like the {crime-discovery}. While others focused on obvious suspects, your methodical approach investigated everyone from {potential-suspects}, and your {investigation-method} uncovered the {plot-twist} that led directly to {real-culprit}. The {confrontation} showcased your skills, the {trial-outcome} delivered justice, and you ended as a {hero-detective} whose methods revolutionized police work.",

    // Tech Detective: Digital Age Crime Fighter
    'tech-crime-specialist': "💻 THE DIGITAL DETECTIVE 💻\n\nIn the digital age of {city}, your {crime-discovery} required cutting-edge investigative techniques. Your {detective-specialty} skills, combined with {investigation-method}, uncovered digital evidence others missed. When {mid-investigation-revelation} changed everything, your {breakthrough-evidence} proved that modern crimes require modern solutions. Your {professional-consequences} established you as the future of law enforcement.",

    // Psychological Thriller: Mind Games Detective  
    'psychological-thriller': "🧠 THE MIND GAMES MASTER 🧠\n\nThe {crime-discovery} in {city} wasn't just about evidence - it was a psychological chess match. Your {detective-specialty} background allowed you to see patterns others missed. Despite facing {investigation-obstacle}, you navigated through {mid-investigation-revelation} and uncovered the {plot-twist} that revealed {real-culprit} had been playing mind games all along. Your {confrontation} became a battle of wits that ended with {professional-consequences}.",

    // Complex Investigation: The Methodical Master
    'methodical-investigator': "🔬 THE METHODICAL MASTER 🔬\n\nYour investigation of the {crime-discovery} in {city} showcased textbook detective work. Starting with {initial-evidence} and following {first-lead-investigation}, you methodically overcame {investigation-obstacle} through pure determination. When {mid-investigation-revelation} threatened to derail everything, your {breakthrough-evidence} proved that patience and persistence solve cases. The {confrontation} with {real-culprit} vindicated your approach, resulting in {professional-consequences}.",

    'default': "In {city}, you investigated a {crime-discovery} as a {detective-specialty}. Despite {investigation-obstacle}, your {investigation-method} approach and {breakthrough-evidence} led you to discover {real-culprit} was the true culprit after a {plot-twist}. The {confrontation} resulted in {trial-outcome} and {professional-consequences}."
  }
};

// Underground Racing Circuit Theme - Street to Legend Journey
const undergroundRacingTheme: SequenceTheme = {
  id: 'underground-racing',
  name: 'Underground Racing: Street Legend',
  description: 'From street rookie to racing legend - build your crew, dominate the underground scene, and choose your legacy',
  color: '#FF4500',
  startStepId: 'racing-origin',
  steps: [
    // Step 1: Racing Origin
    {
      id: 'racing-origin',
      title: 'Your Racing Origin',
      description: 'How did you get into underground racing?',
      wheelConfig: {
        segments: [
          { id: 'rich-kid-rebel', text: 'Rich Kid Rebel', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'mechanics-apprentice', text: 'Mechanic\'s Apprentice', color: '#2F4F2F', rarity: 'common', weight: 20 },
          { id: 'street-survivor', text: 'Street Survivor', color: '#8B0000', rarity: 'common', weight: 18 },
          { id: 'former-pro-racer', text: 'Former Pro Racer', color: '#4169E1', rarity: 'rare', weight: 12 },
          { id: 'military-veteran', text: 'Military Veteran', color: '#556B2F', rarity: 'uncommon', weight: 16 },
          { id: 'college-dropout', text: 'College Dropout', color: '#9370DB', rarity: 'common', weight: 19 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'first-ride',
    },

    // Step 2: First Ride
    {
      id: 'first-ride',
      title: 'Your First Ride',
      description: 'What wheels get you started in the underground?',
      wheelConfig: {
        segments: [
          { id: 'classic-muscle', text: 'Classic Muscle Car', color: '#DC143C', rarity: 'uncommon', weight: 18 },
          { id: 'import-tuner', text: 'Import Tuner', color: '#FF6347', rarity: 'common', weight: 22 },
          { id: 'european-exotic', text: 'European Exotic', color: '#B8860B', rarity: 'rare', weight: 10 },
          { id: 'modified-pickup', text: 'Modified Pickup', color: '#A0522D', rarity: 'uncommon', weight: 15 },
          { id: 'vintage-sports', text: 'Vintage Sports Car', color: '#4682B4', rarity: 'uncommon', weight: 16 },
          { id: 'stolen-supercar', text: 'Stolen Supercar', color: '#8B0000', rarity: 'legendary', weight: 19 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'racing-specialty',
    },

    // Step 3: Racing Specialty
    {
      id: 'racing-specialty',
      title: 'Your Racing Specialty',
      description: 'What type of racing defines your reputation?',
      wheelConfig: {
        segments: [
          { id: 'street-sprint', text: 'Street Sprint King', color: '#FFD700', rarity: 'common', weight: 18 },
          { id: 'drift-master', text: 'Drift Master', color: '#FF1493', rarity: 'uncommon', weight: 16 },
          { id: 'circuit-dominator', text: 'Circuit Dominator', color: '#4169E1', rarity: 'common', weight: 20 },
          { id: 'canyon-carver', text: 'Canyon Carver', color: '#8B4513', rarity: 'rare', weight: 12 },
          { id: 'urban-navigator', text: 'Urban Navigator', color: '#2F2F2F', rarity: 'common', weight: 19 },
          { id: 'offroad-warrior', text: 'Off-Road Warrior', color: '#DAA520', rarity: 'uncommon', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'crew-formation',
    },

    // Step 4: Crew Formation
    {
      id: 'crew-formation',
      title: 'Your Crew Formation',
      description: 'Who joins your racing crew?',
      wheelConfig: {
        segments: [
          { id: 'mechanic-genius', text: 'The Mechanic Genius', color: '#2F4F2F', rarity: 'rare', weight: 14 },
          { id: 'former-cop', text: 'The Former Cop', color: '#4169E1', rarity: 'rare', weight: 12 },
          { id: 'the-hacker', text: 'The Hacker', color: '#9370DB', rarity: 'uncommon', weight: 16 },
          { id: 'street-informant', text: 'The Street Informant', color: '#A0522D', rarity: 'common', weight: 20 },
          { id: 'rich-sponsor', text: 'The Rich Sponsor', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'loyal-friend', text: 'The Loyal Best Friend', color: '#FF69B4', rarity: 'common', weight: 23 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'first-victory',
    },

    // Step 5: First Major Victory 
    {
      id: 'first-victory',
      title: 'Your First Major Victory',
      description: 'How do you make your mark in the underground?',
      wheelConfig: {
        segments: [
          { id: 'beat-champion', text: 'Beat the Local Champion', color: '#FFD700', rarity: 'uncommon', weight: 18 },
          { id: 'outrun-police', text: 'Outrun Police Pursuit', color: '#4169E1', rarity: 'uncommon', weight: 16 },
          { id: 'win-tournament', text: 'Win Underground Tournament', color: '#32CD32', rarity: 'common', weight: 20 },
          { id: 'heist-getaway', text: 'Perfect Heist Getaway', color: '#8B0000', rarity: 'rare', weight: 12 },
          { id: 'viral-video', text: 'Viral Racing Video', color: '#FF1493', rarity: 'common', weight: 19 },
          { id: 'rescue-rival', text: 'Rescue Rival from Crash', color: '#FF6347', rarity: 'uncommon', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'primary-sponsor',
    },

    // Step 6: Primary Sponsor (with multi-spin)
    {
      id: 'primary-sponsor',
      title: 'Your Primary Sponsor',
      description: 'Who becomes your main financial backer?',
      multiSpin: {
        enabled: true,
        mode: 'fixed',
        fixedCount: 3,
        aggregateResults: true
      },
      wheelConfig: {
        segments: [
          { id: 'performance-parts', text: 'Performance Parts Company', color: '#2F4F2F', rarity: 'common', weight: 18 },
          { id: 'energy-drink', text: 'Energy Drink Brand', color: '#32CD32', rarity: 'common', weight: 16 },
          { id: 'betting-ring', text: 'Underground Betting Ring', color: '#8B0000', rarity: 'rare', weight: 12 },
          { id: 'luxury-watch', text: 'Luxury Watch Brand', color: '#FFD700', rarity: 'uncommon', weight: 14 },
          { id: 'custom-shop', text: 'Custom Shop Owner', color: '#4682B4', rarity: 'common', weight: 15 },
          { id: 'crypto-mogul', text: 'Cryptocurrency Mogul', color: '#9370DB', rarity: 'rare', weight: 10 },
          { id: 'street-gang', text: 'Street Gang Alliance', color: '#8B0000', rarity: 'rare', weight: 8 },
          { id: 'underground-kingpin', text: 'Underground Kingpin', color: '#DC143C', rarity: 'legendary', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'biggest-challenge',
    },


    // Step 7: Biggest Challenge
    {
      id: 'biggest-challenge',
      title: 'Your Biggest Racing Challenge',
      description: 'What ultimate test defines your career?',
      wheelConfig: {
        segments: [
          { id: 'cross-country', text: 'Cross-Country Cannonball', color: '#DAA520', rarity: 'rare', weight: 15 },
          { id: 'rival-showdown', text: 'Rival Crew Showdown', color: '#8B0000', rarity: 'uncommon', weight: 18 },
          { id: 'police-hunt', text: 'Police Task Force Hunt', color: '#4169E1', rarity: 'common', weight: 20 },
          { id: 'international-gp', text: 'International Underground GP', color: '#FFD700', rarity: 'rare', weight: 12 },
          { id: 'mountain-pass', text: 'Deadly Mountain Pass', color: '#8B4513', rarity: 'uncommon', weight: 16 },
          { id: 'corporate-sabotage', text: 'Corporate Sabotage Mission', color: '#2F2F2F', rarity: 'rare', weight: 19 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'heat-level',
    },

    // Step 8: Heat Level
    {
      id: 'heat-level',
      title: 'The Heat Closes In',
      description: 'How do the authorities respond to your success?',
      wheelConfig: {
        segments: [
          { id: 'fbi-investigation', text: 'FBI Investigation', color: '#8B0000', rarity: 'rare', weight: 12 },
          { id: 'media-exposure', text: 'Media Exposure', color: '#FF6347', rarity: 'uncommon', weight: 16 },
          { id: 'police-infiltration', text: 'Police Infiltration', color: '#4169E1', rarity: 'uncommon', weight: 18 },
          { id: 'crew-betrayal', text: 'Rival Crew Betrayal', color: '#9370DB', rarity: 'common', weight: 20 },
          { id: 'family-targeted', text: 'Family Targeted', color: '#DC143C', rarity: 'rare', weight: 14 },
          { id: 'clean-record', text: 'Clean Record Maintained', color: '#32CD32', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      defaultNextStep: 'racing-legacy',
    },

    // Step 9: Racing Legacy
    {
      id: 'racing-legacy',
      title: 'Your Racing Legacy',
      description: 'How does your underground racing story end?',
      wheelConfig: {
        segments: [
          { id: 'retired-undefeated', text: 'Retired Undefeated', color: '#FFD700', rarity: 'rare', weight: 15 },
          { id: 'gone-legitimate', text: 'Gone Legitimate Pro', color: '#32CD32', rarity: 'common', weight: 20 },
          { id: 'international-fugitive', text: 'International Fugitive', color: '#8B0000', rarity: 'uncommon', weight: 16 },
          { id: 'underground-kingpin', text: 'Underground Kingpin', color: '#2F2F2F', rarity: 'rare', weight: 12 },
          { id: 'killed-racing', text: 'Killed in Final Race', color: '#DC143C', rarity: 'legendary', weight: 8 },
          { id: 'prison-sentence', text: 'Prison Sentence', color: '#4682B4', rarity: 'uncommon', weight: 29 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'underground-racing',
      },
      // Final step - no defaultNextStep
    },
  ],

  narrativeTemplate: "You started as a {racing-origin} with your {first-ride}, specializing in {racing-specialty} racing. With {crew-formation} by your side, you made your mark through a {first-victory}. You secured backing from {primary-sponsor}, leading to your biggest challenge: {biggest-challenge}. Despite {heat-level}, your racing story ended with {racing-legacy}.",

  narrativeTemplates: {
    // Legendary Path: The Perfect Racer
    'perfect-racer': "🏁 THE PERFECT RACER 🏁\n\nStarting as a {racing-origin} behind the wheel of a {first-ride}, you became the ultimate {racing-specialty}. With {crew-formation} as your trusted ally, your {first-victory} launched you into legend status. Your reputation attracted multiple sponsors, but it was {biggest-challenge} that truly tested your limits. Even as {heat-level} threatened everything, you achieved the impossible: {racing-legacy}. The streets still echo with stories of your perfect racing career.",

    // Criminal Path: The Underground King
    'underground-king': "👑 THE UNDERGROUND KING 👑\n\nFrom humble beginnings as a {racing-origin} with a {first-ride}, you carved out your empire through {racing-specialty} dominance. Your {crew-formation} became your lieutenants as your {first-victory} marked the beginning of your rise to power. Corporate backing and {biggest-challenge} expanded your influence until {heat-level} forced you to consolidate control. Your {racing-legacy} represents the ultimate underground success story - feared, respected, and untouchable.",

    // Hero Path: The People's Champion
    'peoples-champion': "⚡ THE PEOPLE'S CHAMPION ⚡\n\nYou began as a {racing-origin} with nothing but a {first-ride} and a dream. Your {racing-specialty} skills caught the attention of {crew-formation}, who believed in your potential. After your legendary {first-victory}, sponsors flocked to support your clean racing style. Facing {biggest-challenge} with integrity, you handled {heat-level} by staying true to your principles, ultimately achieving {racing-legacy} as a role model for future street racers.",

    // Tragic Path: The Fallen Legend
    'fallen-legend': "💔 THE FALLEN LEGEND 💔\n\nOnce a promising {racing-origin} with a beautiful {first-ride}, you dominated the {racing-specialty} scene with {crew-formation} watching your back. Your {first-victory} seemed like the beginning of something special, but the pressure of sponsorship and {biggest-challenge} began taking its toll. When {heat-level} reached its peak, everything you built came crashing down, leading to {racing-legacy}. The streets remember what you could have been.",

    // Speed Path: The Velocity Demon
    'velocity-demon': "🚀 THE VELOCITY DEMON 🚀\n\nAs a {racing-origin} with an obsession for speed, you pushed your {first-ride} beyond all limits. Your {racing-specialty} reputation was built on pure adrenaline, with {crew-formation} struggling to keep up with your reckless ambition. The {first-victory} only fueled your hunger for more, leading to dangerous sponsorship deals and {biggest-challenge} that should have killed you. Despite {heat-level} and the constant risk, you achieved {racing-legacy} by never backing down from any race.",

    'default': "You were a {racing-origin} racer who specialized in {racing-specialty}, formed a crew with {crew-formation}, achieved {first-victory}, and ultimately reached {racing-legacy} in the underground racing world."
  }
};

// World Cup Manager Theme - Complete Tournament Journey
const worldCupManagerTheme: SequenceTheme = {
  id: 'world-cup-manager',
  name: 'World Cup Manager: Road to Glory',
  description: 'From career backstory to tournament legend - manage your national team through the ultimate football tournament and write your legacy',
  color: '#228B22',
  startStepId: 'previous-stint',
  steps: [
    // Step 1: Previous Managerial Stint
    {
      id: 'previous-stint',
      title: 'Your Previous Managerial Stint',
      description: 'The phone call that changed everything came at 3 AM. But your path to this moment started years ago...',
      wheelConfig: {
        segments: [
          { id: 'premier-champion', text: 'Premier League Champion', color: '#FFD700', rarity: 'legendary', weight: 6 },
          { id: 'relegated-manager', text: 'Relegated Manager', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'scandal-departure', text: 'Scandal-Hit Departure', color: '#2F4F4F', rarity: 'rare', weight: 8 },
          { id: 'european-giant', text: 'European Giant Coach', color: '#4169E1', rarity: 'rare', weight: 10 },
          { id: 'championship-hero', text: 'Championship Hero', color: '#32CD32', rarity: 'common', weight: 12 },
          { id: 'youtube-analyst', text: 'Never Managed Professional', color: '#FF69B4', rarity: 'uncommon', weight: 8 },
          { id: 'academy-director', text: 'Youth Academy Director', color: '#90EE90', rarity: 'common', weight: 10 },
          { id: 'lower-league-legend', text: 'Lower League Legend', color: '#DDA0DD', rarity: 'common', weight: 10 },
          { id: 'assistant-coach-promoted', text: 'Promoted Assistant Coach', color: '#87CEEB', rarity: 'common', weight: 9 },
          { id: 'interim-manager', text: 'Long-Term Interim Manager', color: '#F0E68C', rarity: 'uncommon', weight: 8 },
          { id: 'foreign-success', text: 'Foreign League Success', color: '#FFB6C1', rarity: 'uncommon', weight: 7 },
          { id: 'cup-specialist', text: 'Cup Competition Specialist', color: '#20B2AA', rarity: 'uncommon', weight: 7 },
          { id: 'player-turned-coach', text: 'Recently Retired Player', color: '#FFA500', rarity: 'common', weight: 8 },
          { id: 'tactical-innovator', text: 'Tactical Revolutionary', color: '#9370DB', rarity: 'rare', weight: 6 },
          { id: 'miracle-worker', text: 'Miracle Worker (Saved Club)', color: '#32CD32', rarity: 'rare', weight: 5 },
          { id: 'journeyman-coach', text: 'Experienced Journeyman', color: '#CD853F', rarity: 'common', weight: 8 },
          { id: 'media-darling', text: 'Media Personality Coach', color: '#FF1493', rarity: 'uncommon', weight: 6 },
          { id: 'data-analytics-guru', text: 'Data Analytics Pioneer', color: '#00CED1', rarity: 'rare', weight: 4 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'country-selection',
    },

    // Step 2: Country Selection (32 Countries - Full World Cup Representation)
    {
      id: 'country-selection',
      title: 'Country You\'re Managing',
      description: 'The federation president slides the contract across the table. The badge on the folder shows...',
      wheelConfig: {
        segments: [
          // Tier 1 - Tournament Favorites (25% chance)
          { id: 'brazil', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 4 },
          { id: 'argentina', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'legendary', weight: 4 },
          { id: 'france', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 4 },
          { id: 'germany', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'legendary', weight: 4 },
          { id: 'spain', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'rare', weight: 4 },
          { id: 'england', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'rare', weight: 4 },
          { id: 'netherlands', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'rare', weight: 3 },
          { id: 'italy', text: 'Italy 🇮🇹', color: '#228B22', rarity: 'rare', weight: 2 },
          
          // Tier 2 - Solid Contenders (40% chance)
          { id: 'portugal', text: 'Portugal 🇵🇹', color: '#006400', rarity: 'uncommon', weight: 5 },
          { id: 'croatia', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'uncommon', weight: 5 },
          { id: 'belgium', text: 'Belgium 🇧🇪', color: '#FFD700', rarity: 'uncommon', weight: 5 },
          { id: 'uruguay', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'uncommon', weight: 5 },
          { id: 'mexico', text: 'Mexico 🇲🇽', color: '#228B22', rarity: 'uncommon', weight: 4 },
          { id: 'colombia', text: 'Colombia 🇨🇴', color: '#FFD700', rarity: 'uncommon', weight: 4 },
          { id: 'denmark', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'switzerland', text: 'Switzerland 🇨🇭', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'poland', text: 'Poland 🇵🇱', color: '#FFFFFF', rarity: 'common', weight: 4 },
          
          // Tier 3 - Underdogs with Dreams (35% chance)
          { id: 'morocco', text: 'Morocco 🇲🇦', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'senegal', text: 'Senegal 🇸🇳', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'japan', text: 'Japan 🇯🇵', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'south-korea', text: 'South Korea 🇰🇷', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'australia', text: 'Australia 🇦🇺', color: '#FFD700', rarity: 'common', weight: 4 },
          { id: 'usa', text: 'USA 🇺🇸', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'canada', text: 'Canada 🇨🇦', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'wales', text: 'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿', color: '#228B22', rarity: 'common', weight: 3 },
          { id: 'ecuador', text: 'Ecuador 🇪🇨', color: '#FFD700', rarity: 'common', weight: 3 },
          { id: 'iran', text: 'Iran 🇮🇷', color: '#228B22', rarity: 'common', weight: 3 },
          { id: 'saudi-arabia', text: 'Saudi Arabia 🇸🇦', color: '#228B22', rarity: 'common', weight: 3 },
          { id: 'tunisia', text: 'Tunisia 🇹🇳', color: '#DC143C', rarity: 'common', weight: 3 },
          { id: 'costa-rica', text: 'Costa Rica 🇨🇷', color: '#4169E1', rarity: 'common', weight: 3 },
          { id: 'ghana', text: 'Ghana 🇬🇭', color: '#FFD700', rarity: 'common', weight: 3 },
          { id: 'cameroon', text: 'Cameroon 🇨🇲', color: '#228B22', rarity: 'common', weight: 3 },
          { id: 'serbia', text: 'Serbia 🇷🇸', color: '#DC143C', rarity: 'common', weight: 3 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'coaching-philosophy',
    },

    // Step 3: Coaching Philosophy
    {
      id: 'coaching-philosophy',
      title: 'Your Coaching Philosophy',
      description: 'In the press conference, they ask about your tactical approach. You confidently explain...',
      wheelConfig: {
        segments: [
          { id: 'tiki-taka', text: 'Tiki-Taka Possession', color: '#DC143C', rarity: 'uncommon', weight: 12 },
          { id: 'gegenpressing', text: 'Gegenpressing Intensity', color: '#FFD700', rarity: 'uncommon', weight: 12 },
          { id: 'defensive-masterclass', text: 'Defensive Masterclass', color: '#2F4F4F', rarity: 'uncommon', weight: 12 },
          { id: 'counter-attacking', text: 'Counter-Attacking Precision', color: '#4169E1', rarity: 'common', weight: 15 },
          { id: 'total-football', text: 'Total Football Evolution', color: '#FF4500', rarity: 'rare', weight: 10 },
          { id: 'long-ball-chaos', text: 'Long Ball Chaos', color: '#32CD32', rarity: 'common', weight: 12 },
          { id: 'inverted-fullbacks', text: 'Inverted Fullback System', color: '#9370DB', rarity: 'rare', weight: 8 },
          { id: 'false-nine', text: 'False 9 Revolution', color: '#FF69B4', rarity: 'uncommon', weight: 10 },
          { id: 'wingback-dominance', text: 'Wing-Back Dominance', color: '#228B22', rarity: 'uncommon', weight: 10 },
          { id: 'pressing-triggers', text: 'Pressing Triggers Master', color: '#B8860B', rarity: 'uncommon', weight: 9 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'team-strength',
    },

    // Step 4: Team's Greatest Strength
    {
      id: 'team-strength',
      title: 'Your Team\'s Greatest Strength',
      description: 'In the dressing room, you look at your squad and smile. Your secret weapon is...',
      wheelConfig: {
        segments: [
          { id: 'world-class-striker', text: 'World-Class Striker', color: '#FFD700', rarity: 'rare', weight: 10 },
          { id: 'impenetrable-defense', text: 'Impenetrable Defense', color: '#2F4F4F', rarity: 'uncommon', weight: 10 },
          { id: 'creative-midfield', text: 'Creative Midfield Genius', color: '#9370DB', rarity: 'uncommon', weight: 10 },
          { id: 'team-spirit', text: 'Unbreakable Team Spirit', color: '#32CD32', rarity: 'common', weight: 12 },
          { id: 'lightning-pace', text: 'Lightning Pace on Wings', color: '#FF69B4', rarity: 'common', weight: 10 },
          { id: 'set-piece-specialists', text: 'Set Piece Specialists', color: '#4169E1', rarity: 'uncommon', weight: 8 },
          { id: 'goalkeeping-excellence', text: 'World-Class Goalkeeper', color: '#228B22', rarity: 'rare', weight: 8 },
          { id: 'tactical-discipline', text: 'Perfect Tactical Discipline', color: '#4B0082', rarity: 'uncommon', weight: 8 },
          { id: 'physical-dominance', text: 'Superior Physical Strength', color: '#8B4513', rarity: 'common', weight: 10 },
          { id: 'counter-attack-speed', text: 'Lightning Counter-Attacks', color: '#FF4500', rarity: 'uncommon', weight: 7 },
          { id: 'veteran-leadership', text: 'Experienced Leadership', color: '#B8860B', rarity: 'common', weight: 6 },
          { id: 'penalty-specialists', text: 'Penalty Conversion Masters', color: '#DC143C', rarity: 'uncommon', weight: 7 },
          { id: 'pressing-intensity', text: 'Relentless High Pressing', color: '#FF6347', rarity: 'uncommon', weight: 7 },
          { id: 'technical-ball-control', text: 'Superior Ball Control', color: '#DA70D6', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'weakness-count-determiner',
    },

    // Step 5A: Team Weakness Count Determiner (System-Generated)
    {
      id: 'weakness-count-determiner',
      title: 'Squad Problems Determiner',
      description: 'How many problems are haunting your squad before the tournament?',
      isDeterminer: true,
      targetStepId: 'team-weaknesses',
      wheelConfig: {
        segments: [
          { id: '1-spin', text: '1', color: '#32CD32', weight: 30, rarity: 'common' },
          { id: '2-spins', text: '2', color: '#FFD700', weight: 40, rarity: 'common' },
          { id: '3-spins', text: '3', color: '#DC143C', weight: 30, rarity: 'uncommon' },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager'
      },
      defaultNextStep: 'team-weaknesses',
    },

    // Step 5B: Team Weaknesses (Multi-Spin Dynamic)
    {
      id: 'team-weaknesses',
      title: 'Your Team\'s Biggest Weaknesses',
      description: 'Even the best teams have problems. During the final squad meeting, the issues become clear...',
      multiSpin: {
        enabled: true,
        mode: 'dynamic',
        determinerStepId: 'weakness-count-determiner',
        aggregateResults: true
      },
      wheelConfig: {
        segments: [
          { id: 'injury-prone-stars', text: 'Injury-Prone Star Players', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'lack-squad-depth', text: 'Lack of Squad Depth', color: '#2F4F4F', rarity: 'common', weight: 12 },
          { id: 'temperamental-players', text: 'Temperamental Personalities', color: '#DC143C', rarity: 'uncommon', weight: 10 },
          { id: 'poor-set-pieces', text: 'Poor Set Piece Defense', color: '#4169E1', rarity: 'common', weight: 12 },
          { id: 'inexperienced-keeper', text: 'Inexperienced Goalkeeper', color: '#FF69B4', rarity: 'uncommon', weight: 10 },
          { id: 'aging-superstars', text: 'Aging Superstars', color: '#B8860B', rarity: 'common', weight: 12 },
          { id: 'language-barriers', text: 'Language Barriers', color: '#9370DB', rarity: 'uncommon', weight: 8 },
          { id: 'media-pressure', text: 'Excessive Media Pressure', color: '#FF4500', rarity: 'common', weight: 10 },
          { id: 'fitness-issues', text: 'Poor Squad Fitness Levels', color: '#228B22', rarity: 'common', weight: 8 },
          { id: 'tactical-inflexibility', text: 'Tactical Inflexibility', color: '#4B0082', rarity: 'uncommon', weight: 8 },
          { id: 'penalty-weakness', text: 'Penalty Shootout Anxiety', color: '#800080', rarity: 'rare', weight: 6 },
          { id: 'altitude-problems', text: 'Altitude Adaptation Issues', color: '#CD853F', rarity: 'uncommon', weight: 6 },
          { id: 'dressing-room-cliques', text: 'Dressing Room Cliques', color: '#DC143C', rarity: 'rare', weight: 8 },
          { id: 'defensive-frailty', text: 'Defensive Set-Piece Frailty', color: '#8B0000', rarity: 'common', weight: 9 },
          { id: 'lack-pace', text: 'Lack of Pace in Defense', color: '#696969', rarity: 'common', weight: 8 },
          { id: 'mental-fragility', text: 'Mental Fragility Under Pressure', color: '#800080', rarity: 'uncommon', weight: 7 },
          { id: 'over-reliance-star', text: 'Over-Reliance on One Star', color: '#FFD700', rarity: 'uncommon', weight: 7 },
          { id: 'poor-finishing', text: 'Clinical Finishing Problems', color: '#DC143C', rarity: 'common', weight: 8 },
          { id: 'discipline-issues', text: 'Poor Disciplinary Record', color: '#FF0000', rarity: 'uncommon', weight: 6 },
          { id: 'climate-adjustment', text: 'Climate Adjustment Issues', color: '#87CEEB', rarity: 'uncommon', weight: 6 },
          { id: 'youth-inexperience', text: 'Too Many Inexperienced Youth', color: '#FF69B4', rarity: 'common', weight: 7 },
          { id: 'counter-attack-vulnerable', text: 'Vulnerable to Counter-Attacks', color: '#FF4500', rarity: 'common', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'tournament-prediction',
    },

    // Step 6: Pre-Tournament Prediction
    {
      id: 'tournament-prediction',
      title: 'Your Pre-Tournament Prediction',
      description: 'In your final interview before the tournament, you boldly predict...',
      wheelConfig: {
        segments: [
          { id: 'win-whole-thing', text: 'We\'ll Win the Whole Thing', color: '#FFD700', rarity: 'rare', weight: 8 },
          { id: 'semi-finals-target', text: 'Semi-Finals is Our Target', color: '#32CD32', rarity: 'uncommon', weight: 12 },
          { id: 'quarter-finals-success', text: 'Quarter-Finals Would Be Success', color: '#4169E1', rarity: 'common', weight: 14 },
          { id: 'escape-group', text: 'Just Escape the Group', color: '#FF69B4', rarity: 'common', weight: 16 },
          { id: 'here-to-learn', text: 'We\'re Here to Learn', color: '#9370DB', rarity: 'common', weight: 14 },
          { id: 'one-game-time', text: 'One Game at a Time', color: '#2F4F4F', rarity: 'uncommon', weight: 10 },
          { id: 'surprise-everyone', text: 'We\'ll Surprise Everyone', color: '#FF6347', rarity: 'uncommon', weight: 9 },
          { id: 'final-appearance', text: 'We Can Reach the Final', color: '#DAA520', rarity: 'rare', weight: 6 },
          { id: 'respectful-showing', text: 'Show We Belong Here', color: '#20B2AA', rarity: 'common', weight: 12 },
          { id: 'tactical-revolution', text: 'Change How Football is Played', color: '#9370DB', rarity: 'legendary', weight: 4 },
          { id: 'youth-breakthrough', text: 'Launch the Next Generation', color: '#FFB6C1', rarity: 'uncommon', weight: 8 },
          { id: 'fearless-approach', text: 'Fear Nobody, Respect Everyone', color: '#DC143C', rarity: 'uncommon', weight: 9 },
          { id: 'maximum-effort', text: 'Give Everything, Leave Nothing', color: '#228B22', rarity: 'common', weight: 10 },
          { id: 'historic-achievement', text: 'Make History for Our Nation', color: '#B8860B', rarity: 'rare', weight: 5 },
          { id: 'enjoy-the-journey', text: 'Enjoy This Once-in-a-Lifetime', color: '#87CEEB', rarity: 'common', weight: 8 },
          { id: 'prove-the-doubters-wrong', text: 'Prove All the Doubters Wrong', color: '#FF4500', rarity: 'uncommon', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'pre-tournament-drama',
    },

    // Step 7: Pre-Tournament Drama
    {
      id: 'pre-tournament-drama',
      title: 'Pre-Tournament Crisis',
      description: 'Two weeks before the tournament starts, unexpected drama hits your squad...',
      wheelConfig: {
        segments: [
          { id: 'star-injury-scare', text: 'Star Player Injury Scare', color: '#8B0000', rarity: 'common', weight: 10 },
          { id: 'captain-leadership-dispute', text: 'Captain Leadership Dispute', color: '#DC143C', rarity: 'uncommon', weight: 9 },
          { id: 'political-controversy', text: 'Political Statement Controversy', color: '#2F4F4F', rarity: 'uncommon', weight: 8 },
          { id: 'young-player-breakthrough', text: 'Young Player Breakthrough', color: '#32CD32', rarity: 'uncommon', weight: 9 },
          { id: 'media-scandal', text: 'Media Scandal Erupts', color: '#FF4500', rarity: 'rare', weight: 6 },
          { id: 'tactical-leak', text: 'Tactical Plans Leaked', color: '#9370DB', rarity: 'rare', weight: 6 },
          { id: 'squad-harmony-perfect', text: 'Perfect Squad Harmony', color: '#FFD700', rarity: 'rare', weight: 6 },
          { id: 'veteran-comeback', text: 'Veteran\'s Surprise Comeback', color: '#4169E1', rarity: 'uncommon', weight: 8 },
          { id: 'formation-revolution', text: 'Formation Revolution', color: '#FF69B4', rarity: 'uncommon', weight: 7 },
          { id: 'social-media-storm', text: 'Social Media Storm', color: '#87CEEB', rarity: 'common', weight: 8 },
          { id: 'contract-holdout', text: 'Key Player Contract Holdout', color: '#4682B4', rarity: 'common', weight: 8 },
          { id: 'fan-protest-disruption', text: 'Fan Protest Disruption', color: '#FF6347', rarity: 'rare', weight: 5 },
          { id: 'doping-allegations', text: 'Doping Test Controversy', color: '#800080', rarity: 'rare', weight: 4 },
          { id: 'goalkeeper-competition', text: 'Goalkeeper Competition Drama', color: '#228B22', rarity: 'common', weight: 7 },
          { id: 'family-crisis', text: 'Star Player Family Crisis', color: '#CD5C5C', rarity: 'uncommon', weight: 7 },
          { id: 'training-ground-fight', text: 'Training Ground Altercation', color: '#8B4513', rarity: 'rare', weight: 5 },
          { id: 'agent-interference', text: 'Agent Causing Disruption', color: '#696969', rarity: 'common', weight: 6 },
          { id: 'foreign-club-pressure', text: 'Club vs Country Tension', color: '#708090', rarity: 'uncommon', weight: 6 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'team-chemistry',
    },

    // Step 8: Team Chemistry Assessment
    {
      id: 'team-chemistry',
      title: 'Squad Chemistry Assessment',
      description: 'After the pre-tournament drama, you assess the mood in the dressing room...',
      wheelConfig: {
        segments: [
          { id: 'unbreakable-bond', text: 'Unbreakable Brotherhood', color: '#FFD700', rarity: 'legendary', weight: 8 },
          { id: 'strong-unity', text: 'Strong Unity', color: '#32CD32', rarity: 'uncommon', weight: 18 },
          { id: 'professional-respect', text: 'Professional Respect', color: '#4169E1', rarity: 'common', weight: 25 },
          { id: 'underlying-tensions', text: 'Underlying Tensions', color: '#FF4500', rarity: 'common', weight: 20 },
          { id: 'divided-camp', text: 'Divided Training Camp', color: '#8B0000', rarity: 'uncommon', weight: 15 },
          { id: 'fragile-confidence', text: 'Fragile Confidence', color: '#9370DB', rarity: 'uncommon', weight: 14 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'group-opponents',
    },

    // Step 9: Group Stage Opponents (Multi-Spin Fixed)
    {
      id: 'group-opponents',
      title: 'Group Stage Opponents',
      description: 'The group stage draw is complete. You\'ll face these three nations in the opening round...',
      multiSpin: {
        enabled: true,
        mode: 'fixed',
        fixedCount: 3,
        aggregateResults: true
      },
      wheelConfig: {
        segments: [
          // All World Cup nations as potential group opponents
          { id: 'opp-brazil', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 3 },
          { id: 'opp-argentina', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'legendary', weight: 3 },
          { id: 'opp-france', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 3 },
          { id: 'opp-germany', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'legendary', weight: 3 },
          { id: 'opp-spain', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'rare', weight: 3 },
          { id: 'opp-england', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'rare', weight: 3 },
          { id: 'opp-netherlands', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'rare', weight: 3 },
          { id: 'opp-italy', text: 'Italy 🇮🇹', color: '#228B22', rarity: 'rare', weight: 3 },
          { id: 'opp-portugal', text: 'Portugal 🇵🇹', color: '#006400', rarity: 'uncommon', weight: 4 },
          { id: 'opp-croatia', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'uncommon', weight: 4 },
          { id: 'opp-belgium', text: 'Belgium 🇧🇪', color: '#FFD700', rarity: 'uncommon', weight: 4 },
          { id: 'opp-uruguay', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'uncommon', weight: 4 },
          { id: 'opp-mexico', text: 'Mexico 🇲🇽', color: '#228B22', rarity: 'uncommon', weight: 4 },
          { id: 'opp-colombia', text: 'Colombia 🇨🇴', color: '#FFD700', rarity: 'uncommon', weight: 4 },
          { id: 'opp-denmark', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-switzerland', text: 'Switzerland 🇨🇭', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-poland', text: 'Poland 🇵🇱', color: '#FFFFFF', rarity: 'common', weight: 4 },
          { id: 'opp-morocco', text: 'Morocco 🇲🇦', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-senegal', text: 'Senegal 🇸🇳', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-japan', text: 'Japan 🇯🇵', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-south-korea', text: 'South Korea 🇰🇷', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'opp-australia', text: 'Australia 🇦🇺', color: '#FFD700', rarity: 'common', weight: 4 },
          { id: 'opp-usa', text: 'USA 🇺🇸', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'opp-canada', text: 'Canada 🇨🇦', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-wales', text: 'Wales 🏴󠁧󠁢󠁷󠁬󠁳󠁿', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-russia', text: 'Russia 🇷🇺', color: '#FFFFFF', rarity: 'uncommon', weight: 3 },
          { id: 'opp-ukraine', text: 'Ukraine 🇺🇦', color: '#4169E1', rarity: 'uncommon', weight: 3 },
          { id: 'opp-ghana', text: 'Ghana 🇬🇭', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-nigeria', text: 'Nigeria 🇳🇬', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-cameroon', text: 'Cameroon 🇨🇲', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-tunisia', text: 'Tunisia 🇹🇳', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-algeria', text: 'Algeria 🇩🇿', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-egypt', text: 'Egypt 🇪🇬', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-iran', text: 'Iran 🇮🇷', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-saudi-arabia', text: 'Saudi Arabia 🇸🇦', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'opp-qatar', text: 'Qatar 🇶🇦', color: '#8B0000', rarity: 'common', weight: 4 },
          { id: 'opp-ecuador', text: 'Ecuador 🇪🇨', color: '#FFD700', rarity: 'common', weight: 4 },
          { id: 'opp-peru', text: 'Peru 🇵🇪', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-chile', text: 'Chile 🇨🇱', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'opp-costa-rica', text: 'Costa Rica 🇨🇷', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'opp-panama', text: 'Panama 🇵🇦', color: '#4169E1', rarity: 'common', weight: 3 },
          { id: 'opp-honduras', text: 'Honduras 🇭🇳', color: '#4169E1', rarity: 'common', weight: 3 },
          { id: 'opp-new-zealand', text: 'New Zealand 🇳🇿', color: '#000000', rarity: 'common', weight: 3 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'group-performance',
    },

    // Step 8: Group Stage Performance
    {
      id: 'group-performance',
      title: 'Group Stage Performance',
      description: 'After 3 matches, the final group table shows...',
      wheelConfig: {
        segments: [
          { id: 'first-nine-points', text: 'First Place + 9 Points', color: '#FFD700', rarity: 'legendary', weight: 8 },
          { id: 'first-seven-points', text: 'First Place + 7 Points', color: '#32CD32', rarity: 'rare', weight: 12 },
          { id: 'second-six-points', text: 'Second Place + 6 Points', color: '#4169E1', rarity: 'uncommon', weight: 18 },
          { id: 'second-four-points', text: 'Second Place + 4 Points', color: '#FF69B4', rarity: 'common', weight: 22 },
          { id: 'third-four-points', text: 'Third Place + 4 Points', color: '#8B0000', rarity: 'common', weight: 20 },
          { id: 'fourth-one-point', text: 'Fourth Place + 1 Point', color: '#2F4F4F', rarity: 'uncommon', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      // Branching based on qualification
      branches: [
        createBranch('group-stage-moment', [
          BranchingConditions.oneOf('group-performance', ['first-nine-points', 'first-seven-points', 'second-six-points', 'second-four-points'])
        ]),
        createBranch('tournament-ending', [
          BranchingConditions.oneOf('group-performance', ['third-four-points', 'fourth-one-point'])
        ])
      ],
      defaultNextStep: 'tournament-ending',
    },

    // Step 10A: Group Stage Critical Moment (If Qualified)
    {
      id: 'group-stage-moment',
      title: 'Group Stage Critical Moment',
      description: 'During the group stage, one moment defined your team\'s tournament...',
      wheelConfig: {
        segments: [
          { id: 'last-minute-qualifying-goal', text: 'Last-Minute Qualifying Goal', color: '#32CD32', rarity: 'rare', weight: 12 },
          { id: 'var-controversy-favor', text: 'VAR Decision Goes Your Way', color: '#FFD700', rarity: 'uncommon', weight: 10 },
          { id: 'var-controversy-against', text: 'VAR Controversy Against You', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'goalkeeper-heroics', text: 'Goalkeeper Heroics Save Tournament', color: '#4169E1', rarity: 'uncommon', weight: 12 },
          { id: 'injury-crisis', text: 'Key Player Injury Crisis', color: '#DC143C', rarity: 'common', weight: 14 },
          { id: 'youth-player-explosion', text: 'Youth Player Overnight Sensation', color: '#FF69B4', rarity: 'rare', weight: 8 },
          { id: 'weather-chaos-game', text: 'Extreme Weather Chaos', color: '#87CEEB', rarity: 'uncommon', weight: 10 },
          { id: 'crowd-incident-delay', text: 'Stadium Crowd Incident', color: '#FF4500', rarity: 'rare', weight: 6 },
          { id: 'tactical-masterstroke', text: 'Tactical Substitution Genius', color: '#9370DB', rarity: 'uncommon', weight: 10 },
          { id: 'disciplinary-red-cards', text: 'Multiple Red Card Drama', color: '#8B0000', rarity: 'rare', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'round-sixteen-opponent',
    },

    // Step 11A: Round of 16 Opponent Draw (If Qualified)
    {
      id: 'round-sixteen-opponent',
      title: 'Round of 16 Opponent',
      description: 'The knockout stage draw is complete. In the Round of 16, you face...',
      wheelConfig: {
        segments: [
          { id: 'brazil-ro16', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 6 },
          { id: 'france-ro16', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 6 },
          { id: 'spain-ro16', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'rare', weight: 7 },
          { id: 'germany-ro16', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'rare', weight: 7 },
          { id: 'argentina-ro16', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'rare', weight: 7 },
          { id: 'england-ro16', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'rare', weight: 7 },
          { id: 'netherlands-ro16', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'uncommon', weight: 8 },
          { id: 'portugal-ro16', text: 'Portugal 🇵🇹', color: '#006400', rarity: 'uncommon', weight: 8 },
          { id: 'croatia-ro16', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'uncommon', weight: 8 },
          { id: 'belgium-ro16', text: 'Belgium 🇧🇪', color: '#FFD700', rarity: 'uncommon', weight: 8 },
          { id: 'mexico-ro16', text: 'Mexico 🇲🇽', color: '#228B22', rarity: 'common', weight: 10 },
          { id: 'uruguay-ro16', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'uncommon', weight: 7 },
          { id: 'colombia-ro16', text: 'Colombia 🇨🇴', color: '#FFD700', rarity: 'uncommon', weight: 7 },
          { id: 'denmark-ro16', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'common', weight: 6 },
          { id: 'switzerland-ro16', text: 'Switzerland 🇨🇭', color: '#DC143C', rarity: 'common', weight: 6 },
          { id: 'poland-ro16', text: 'Poland 🇵🇱', color: '#FFFFFF', rarity: 'common', weight: 6 },
          { id: 'japan-ro16', text: 'Japan 🇯🇵', color: '#DC143C', rarity: 'common', weight: 5 },
          { id: 'south-korea-ro16', text: 'South Korea 🇰🇷', color: '#4169E1', rarity: 'common', weight: 4 },
          { id: 'morocco-ro16', text: 'Morocco 🇲🇦', color: '#DC143C', rarity: 'common', weight: 4 },
          { id: 'senegal-ro16', text: 'Senegal 🇸🇳', color: '#228B22', rarity: 'common', weight: 4 },
          { id: 'australia-ro16', text: 'Australia 🇦🇺', color: '#FFD700', rarity: 'common', weight: 3 },
          { id: 'usa-ro16', text: 'USA 🇺🇸', color: '#4169E1', rarity: 'common', weight: 3 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'round-sixteen-result',
    },

    // Step 9B: Round of 16 Result
    {
      id: 'round-sixteen-result',
      title: 'Round of 16 Result',
      description: 'The knockout stage is sudden death. 90 minutes to dreams or devastation...',
      wheelConfig: {
        segments: [
          { id: 'dominant-4-0-win', text: 'Dominant 4-0 Demolition', color: '#32CD32', rarity: 'legendary', weight: 8 },
          { id: 'comfortable-3-1', text: 'Comfortable 3-1 Victory', color: '#32CD32', rarity: 'uncommon', weight: 16 },
          { id: 'professional-2-0', text: 'Professional 2-0 Win', color: '#228B22', rarity: 'common', weight: 18 },
          { id: 'dramatic-extra-time', text: 'Dramatic 2-1 After Extra Time', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'last-minute-winner', text: 'Last-Minute 1-0 Winner', color: '#4169E1', rarity: 'uncommon', weight: 12 },
          { id: 'penalty-shootout-win', text: 'Penalty Shootout Heroes', color: '#9370DB', rarity: 'rare', weight: 10 },
          { id: 'comeback-victory', text: '0-2 Down, Won 3-2', color: '#FFD700', rarity: 'legendary', weight: 6 },
          { id: 'penalty-heartbreak', text: 'Penalty Shootout Heartbreak', color: '#8B0000', rarity: 'common', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      // Branching based on advancement
      branches: [
        createBranch('quarter-final-opponent', [
          BranchingConditions.oneOf('round-sixteen-result', ['dominant-4-0-win', 'comfortable-3-1', 'professional-2-0', 'dramatic-extra-time', 'last-minute-winner', 'penalty-shootout-win', 'comeback-victory'])
        ]),
        createBranch('tournament-ending', [
          BranchingConditions.oneOf('round-sixteen-result', ['penalty-heartbreak'])
        ])
      ],
      defaultNextStep: 'tournament-ending',
    },

    // Step 10A: Quarter-Final Opponent Draw (If Advanced)
    {
      id: 'quarter-final-opponent',
      title: 'Quarter-Final Opponent',
      description: 'Only 8 teams remain. The quarter-final draw reveals your opponent...',
      wheelConfig: {
        segments: [
          { id: 'brazil-qf', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 8 },
          { id: 'france-qf', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 8 },
          { id: 'spain-qf', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'legendary', weight: 8 },
          { id: 'argentina-qf', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'rare', weight: 12 },
          { id: 'germany-qf', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'rare', weight: 12 },
          { id: 'england-qf', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'rare', weight: 12 },
          { id: 'netherlands-qf', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'uncommon', weight: 15 },
          { id: 'portugal-qf', text: 'Portugal 🇵🇹', color: '#006400', rarity: 'uncommon', weight: 15 },
          { id: 'croatia-qf', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'common', weight: 10 },
          { id: 'uruguay-qf', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'uncommon', weight: 8 },
          { id: 'mexico-qf', text: 'Mexico 🇲🇽', color: '#228B22', rarity: 'common', weight: 6 },
          { id: 'denmark-qf', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'common', weight: 5 },
          { id: 'switzerland-qf', text: 'Switzerland 🇨🇭', color: '#DC143C', rarity: 'common', weight: 5 },
          { id: 'colombia-qf', text: 'Colombia 🇨🇴', color: '#FFD700', rarity: 'uncommon', weight: 4 },
          { id: 'japan-qf', text: 'Japan 🇯🇵', color: '#DC143C', rarity: 'rare', weight: 3 },
          { id: 'morocco-qf', text: 'Morocco 🇲🇦', color: '#DC143C', rarity: 'rare', weight: 3 },
          { id: 'senegal-qf', text: 'Senegal 🇸🇳', color: '#228B22', rarity: 'rare', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'quarter-final-result',
    },

    // Step 10B: Quarter-Final Result
    {
      id: 'quarter-final-result',
      title: 'Quarter-Final Result',
      description: 'Only 8 teams remain. The dream is so close you can taste it...',
      wheelConfig: {
        segments: [
          { id: 'clinical-3-0-win', text: 'Clinical 3-0 Masterclass', color: '#32CD32', rarity: 'legendary', weight: 10 },
          { id: 'hard-fought-2-1', text: 'Hard-Fought 2-1 Victory', color: '#228B22', rarity: 'uncommon', weight: 18 },
          { id: 'defensive-1-0', text: 'Defensive 1-0 Grind', color: '#2F4F4F', rarity: 'common', weight: 20 },
          { id: 'extra-time-thriller', text: 'Extra-Time Thriller Win', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'penalty-drama-win', text: 'Penalty Shootout Victory', color: '#9370DB', rarity: 'rare', weight: 12 },
          { id: 'upset-victory', text: 'Massive Upset Victory', color: '#FF4500', rarity: 'legendary', weight: 8 },
          { id: 'narrow-defeat', text: 'Heartbreaking 1-2 Loss', color: '#8B0000', rarity: 'common', weight: 17 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      // Branching based on advancement
      branches: [
        createBranch('semi-final-opponent', [
          BranchingConditions.oneOf('quarter-final-result', ['clinical-3-0-win', 'hard-fought-2-1', 'defensive-1-0', 'extra-time-thriller', 'penalty-drama-win', 'upset-victory'])
        ]),
        createBranch('tournament-ending', [
          BranchingConditions.oneOf('quarter-final-result', ['narrow-defeat'])
        ])
      ],
      defaultNextStep: 'tournament-ending',
    },

    // Step 11A: Semi-Final Opponent Draw (If Advanced)
    {
      id: 'semi-final-opponent',
      title: 'Semi-Final Opponent',
      description: 'Only 4 teams left. The semi-final draw reveals your path to history...',
      wheelConfig: {
        segments: [
          { id: 'brazil-sf', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 18 },
          { id: 'france-sf', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 18 },
          { id: 'spain-sf', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'legendary', weight: 16 },
          { id: 'argentina-sf', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'rare', weight: 15 },
          { id: 'germany-sf', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'rare', weight: 15 },
          { id: 'england-sf', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'uncommon', weight: 12 },
          { id: 'netherlands-sf', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'uncommon', weight: 8 },
          { id: 'portugal-sf', text: 'Portugal 🇵🇹', color: '#006400', rarity: 'uncommon', weight: 8 },
          { id: 'croatia-sf', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'common', weight: 6 },
          { id: 'uruguay-sf', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'common', weight: 4 },
          { id: 'denmark-sf', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'rare', weight: 3 },
          { id: 'morocco-sf', text: 'Morocco 🇲🇦', color: '#DC143C', rarity: 'rare', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'semi-final-result',
    },

    // Step 11B: Semi-Final Result
    {
      id: 'semi-final-result',
      title: 'Semi-Final Result',
      description: 'Only 4 teams left. History beckons...',
      wheelConfig: {
        segments: [
          { id: 'dominant-semi-win', text: 'Dominant 3-0 Victory', color: '#32CD32', rarity: 'legendary', weight: 12 },
          { id: 'tactical-semi-win', text: 'Tactical 1-0 Masterpiece', color: '#2F4F4F', rarity: 'uncommon', weight: 18 },
          { id: 'thriller-semi-win', text: 'Epic 4-3 Thriller Win', color: '#FFD700', rarity: 'rare', weight: 15 },
          { id: 'comeback-semi-win', text: 'Incredible Comeback Win', color: '#FF4500', rarity: 'legendary', weight: 10 },
          { id: 'penalty-semi-win', text: 'Penalty Shootout Victory', color: '#9370DB', rarity: 'rare', weight: 15 },
          { id: 'crushing-semi-loss', text: 'Crushing 0-3 Defeat', color: '#8B0000', rarity: 'common', weight: 15 },
          { id: 'narrow-semi-loss', text: 'Heartbreaking 1-2 Loss', color: '#DC143C', rarity: 'common', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      // Branching based on advancement
      branches: [
        createBranch('final-opponent', [
          BranchingConditions.oneOf('semi-final-result', ['dominant-semi-win', 'tactical-semi-win', 'thriller-semi-win', 'comeback-semi-win', 'penalty-semi-win'])
        ]),
        createBranch('third-place-playoff', [
          BranchingConditions.oneOf('semi-final-result', ['crushing-semi-loss', 'narrow-semi-loss'])
        ])
      ],
      defaultNextStep: 'third-place-playoff',
    },

    // Step 12A: Third Place Playoff (If Lost Semi-Final)
    {
      id: 'third-place-playoff',
      title: 'Third Place Playoff',
      description: 'One final chance for glory. The bronze medal match awaits...',
      wheelConfig: {
        segments: [
          { id: 'third-place-win', text: 'Third Place Victory 🥉', color: '#CD7F32', rarity: 'uncommon', weight: 50 },
          { id: 'fourth-place-loss', text: 'Fourth Place Finish', color: '#8B4513', rarity: 'common', weight: 50 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'defining-moment',
    },

    // Step 12B: Final Opponent Draw (If Won Semi-Final)
    {
      id: 'final-opponent',
      title: 'World Cup Final Opponent',
      description: 'The ultimate stage. In the World Cup Final, you face...',
      wheelConfig: {
        segments: [
          { id: 'brazil-final', text: 'Brazil 🇧🇷', color: '#228B22', rarity: 'legendary', weight: 16 },
          { id: 'france-final', text: 'France 🇫🇷', color: '#4169E1', rarity: 'legendary', weight: 16 },
          { id: 'spain-final', text: 'Spain 🇪🇸', color: '#DC143C', rarity: 'legendary', weight: 16 },
          { id: 'argentina-final', text: 'Argentina 🇦🇷', color: '#87CEEB', rarity: 'rare', weight: 14 },
          { id: 'germany-final', text: 'Germany 🇩🇪', color: '#FFD700', rarity: 'rare', weight: 14 },
          { id: 'england-final', text: 'England 🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', rarity: 'uncommon', weight: 10 },
          { id: 'italy-final', text: 'Italy 🇮🇹', color: '#006400', rarity: 'uncommon', weight: 9 },
          { id: 'netherlands-final', text: 'Netherlands 🇳🇱', color: '#FF4500', rarity: 'uncommon', weight: 8 },
          { id: 'portugal-final', text: 'Portugal 🇵🇹', color: '#228B22', rarity: 'uncommon', weight: 8 },
          { id: 'belgium-final', text: 'Belgium 🇧🇪', color: '#FFD700', rarity: 'common', weight: 6 },
          { id: 'croatia-final', text: 'Croatia 🇭🇷', color: '#DC143C', rarity: 'common', weight: 5 },
          { id: 'uruguay-final', text: 'Uruguay 🇺🇾', color: '#87CEEB', rarity: 'common', weight: 4 },
          { id: 'colombia-final', text: 'Colombia 🇨🇴', color: '#FFD700', rarity: 'rare', weight: 3 },
          { id: 'mexico-final', text: 'Mexico 🇲🇽', color: '#006400', rarity: 'rare', weight: 3 },
          { id: 'denmark-final', text: 'Denmark 🇩🇰', color: '#DC143C', rarity: 'rare', weight: 2 },
          { id: 'morocco-final', text: 'Morocco 🇲🇦', color: '#8B4513', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'final-result',
    },

    // Step 12C: World Cup Final Result
    {
      id: 'final-result',
      title: 'World Cup Final Result',
      description: 'The ultimate stage. The final whistle blows and...',
      wheelConfig: {
        segments: [
          { id: 'champions-dominant', text: 'Champions! 4-1 Victory 🏆', color: '#FFD700', rarity: 'legendary', weight: 15 },
          { id: 'champions-tight', text: 'Champions! 2-1 Victory 🏆', color: '#DAA520', rarity: 'legendary', weight: 15 },
          { id: 'champions-extra-time', text: 'Champions! Extra-Time Win 🏆', color: '#B8860B', rarity: 'rare', weight: 12 },
          { id: 'champions-penalties', text: 'Champions! Penalty Victory 🏆', color: '#9370DB', rarity: 'rare', weight: 8 },
          { id: 'runners-up-close', text: 'Runners-Up - Lost 1-2 🥈', color: '#C0C0C0', rarity: 'uncommon', weight: 20 },
          { id: 'runners-up-penalties', text: 'Runners-Up - Lost Penalties 🥈', color: '#A9A9A9', rarity: 'common', weight: 18 },
          { id: 'runners-up-dominated', text: 'Runners-Up - Lost 0-3 🥈', color: '#808080', rarity: 'common', weight: 12 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'defining-moment',
    },

    // Step 11: Tournament Defining Moment (If Still Alive in Knockouts)
    {
      id: 'defining-moment',
      title: 'Your Tournament Defining Moment',
      description: 'Every World Cup has moments that become football folklore. Yours was...',
      wheelConfig: {
        segments: [
          { id: 'last-minute-winner', text: 'Last-Minute Winner vs Brazil', color: '#228B22', rarity: 'legendary', weight: 5 },
          { id: 'controversial-var', text: 'Controversial VAR Decision', color: '#8B0000', rarity: 'rare', weight: 7 },
          { id: 'star-injury-drama', text: 'Star Player Injury Drama', color: '#DC143C', rarity: 'uncommon', weight: 8 },
          { id: 'keeper-miracle', text: 'Goalkeeper Miracle Save', color: '#4169E1', rarity: 'uncommon', weight: 8 },
          { id: 'red-card-heroics', text: 'Red Card Controversy', color: '#FF0000', rarity: 'uncommon', weight: 8 },
          { id: 'penalty-redemption', text: 'Penalty Miss Redemption', color: '#FFD700', rarity: 'common', weight: 10 },
          { id: 'tactical-masterpiece', text: 'Tactical Masterpiece', color: '#9370DB', rarity: 'common', weight: 7 },
          { id: 'crowd-incident', text: 'Stadium Crowd Incident', color: '#FF4500', rarity: 'uncommon', weight: 7 },
          { id: 'weather-chaos', text: 'Extreme Weather Chaos', color: '#87CEEB', rarity: 'common', weight: 7 },
          { id: 'referee-blunder', text: 'Referee Blunder', color: '#2F4F4F', rarity: 'common', weight: 8 },
          { id: 'comeback-from-dead', text: '3-Goal Comeback', color: '#32CD32', rarity: 'legendary', weight: 4 },
          { id: 'youth-sensation', text: 'Teenage Sensation Emerges', color: '#FFB6C1', rarity: 'rare', weight: 5 },
          { id: 'captain-speech', text: 'Captain\'s Inspiring Speech', color: '#4169E1', rarity: 'uncommon', weight: 6 },
          { id: 'social-media-storm', text: 'Social Media Storm', color: '#FF69B4', rarity: 'common', weight: 6 },
          { id: 'drone-disruption', text: 'Match-Stopping Drone Incident', color: '#708090', rarity: 'rare', weight: 3 },
          { id: 'bench-celebration-chaos', text: 'Bench-Clearing Celebration', color: '#FFD700', rarity: 'uncommon', weight: 6 },
          { id: 'technology-failure', text: 'Stadium Technology Failure', color: '#A0522D', rarity: 'uncommon', weight: 5 },
          { id: 'player-protest-moment', text: 'Team Takes Political Stand', color: '#2F4F4F', rarity: 'rare', weight: 4 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'managerial-legacy',
    },

    // Step 12: Media Reaction (For Early Exits)
    {
      id: 'tournament-ending',
      title: 'Media Reaction',
      description: 'The final whistle has blown. The press conference is brutal, but the headlines tomorrow will be...',
      wheelConfig: {
        segments: [
          { id: 'media-hero', text: '"Tactical Genius" - Praised Universally', color: '#FFD700', rarity: 'legendary', weight: 12 },
          { id: 'moral-victory', text: '"Heroic Effort" - Respectful Coverage', color: '#32CD32', rarity: 'uncommon', weight: 18 },
          { id: 'mixed-reviews', text: '"Could Go Either Way" - Divided Opinion', color: '#4169E1', rarity: 'common', weight: 25 },
          { id: 'harsh-criticism', text: '"Disappointing" - Heavy Criticism', color: '#FF4500', rarity: 'common', weight: 20 },
          { id: 'media-scapegoat', text: '"Sack Him Now!" - Torn to Pieces', color: '#8B0000', rarity: 'uncommon', weight: 15 },
          { id: 'future-potential', text: '"Give Him Another Chance" - Cautious Support', color: '#9370DB', rarity: 'common', weight: 10 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      defaultNextStep: 'managerial-legacy',
    },

    // Step 13: Managerial Legacy (Final Step)
    {
      id: 'managerial-legacy',
      title: 'Your Managerial Legacy',
      description: 'Six months after the World Cup, when they write your story, they say...',
      wheelConfig: {
        segments: [
          { id: 'hall-of-fame', text: 'Hall of Fame Legend', color: '#FFD700', rarity: 'legendary', weight: 6 },
          { id: 'national-hero', text: 'National Hero Forever', color: '#32CD32', rarity: 'rare', weight: 10 },
          { id: 'tactical-revolutionary', text: 'Tactical Revolutionary', color: '#9370DB', rarity: 'rare', weight: 8 },
          { id: 'cult-hero', text: 'Cult Hero Status', color: '#FF69B4', rarity: 'uncommon', weight: 12 },
          { id: 'respectful-departure', text: 'Respectful Departure', color: '#4169E1', rarity: 'common', weight: 15 },
          { id: 'one-tournament-wonder', text: 'One Tournament Wonder', color: '#B8860B', rarity: 'common', weight: 16 },
          { id: 'media-scapegoat', text: 'Media Scapegoat', color: '#8B0000', rarity: 'uncommon', weight: 10 },
          { id: 'academy-founder', text: 'Coaching Academy Founder', color: '#228B22', rarity: 'uncommon', weight: 8 },
          { id: 'pundit-career', text: 'Successful TV Pundit', color: '#FF4500', rarity: 'common', weight: 10 },
          { id: 'club-comeback', text: 'Triumphant Club Return', color: '#4169E1', rarity: 'uncommon', weight: 8 },
          { id: 'federation-president', text: 'Federation president', color: '#87CEEB', rarity: 'rare', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'world-cup-manager',
      },
      // Final step - no defaultNextStep
    },
  ],

  narrativeTemplate: "From your {previous-stint} background, you took charge of {country-selection} with a {coaching-philosophy} approach. Your squad's {team-strength} was your foundation, though {team-weaknesses} created challenges. You boldly predicted {tournament-prediction}, but {pre-tournament-drama} tested your resolve. With {team-chemistry} in the squad, you faced {group-opponents} in the group stage. Your {group-performance} was marked by {group-stage-moment}, leading to {final-result}, ultimately defined by {defining-moment}. The media reaction was {tournament-ending}, setting the stage for your legacy: {managerial-legacy}.",

  narrativeTemplates: {
    // Miracle Run: Underdog Glory
    'miracle-run': "🌟 THE MIRACLE OF {country-selection} 🌟\n\nNobody gave you a chance. After your {previous-stint} career, taking {country-selection} with a {coaching-philosophy} approach seemed doomed. Your {team-weaknesses} were mocked by experts worldwide, despite your {team-strength}.\n\nBut football isn't played on paper. Through the group stage against {group-opponents}, you achieved {group-performance} when everyone predicted failure. Your {defining-moment} became the tournament's defining image.\n\nWhen you reached {final-result}, the impossible became inevitable. They called it the Miracle of {country-selection}. You called it believing in dreams. Your {managerial-legacy} proved that underdogs can soar.",

    // Redemption Story: Scandal to Glory
    'redemption-story': "⚡ THE REDEMPTION SONG ⚡\n\nThe {previous-stint} scandal nearly destroyed you. Critics said you'd never manage again, that {country-selection} taking a chance on you was desperate. Your {coaching-philosophy} was called outdated, your {team-weaknesses} seemed to mirror your damaged reputation.\n\nBut great stories aren't about perfection - they're about rising from ashes. Your {team-strength} became your foundation for rebuilding. Through {group-opponents} and beyond, every victory was proof that second chances can become first triumphs.\n\nYour {defining-moment} silenced the doubters. When you achieved {final-result}, you didn't just win for {country-selection} - you won for everyone who's been written off. Your {managerial-legacy} completed the redemption.",

    // Tactical Masterclass: Philosophy Vindicated
    'tactical-masterclass': "🧠 THE TACTICAL MASTERCLASS 🧠\n\nThey said your {coaching-philosophy} was outdated, that modern football had moved beyond such approaches. But with {country-selection}'s {team-strength}, you knew exactly how to weaponize your tactical beliefs.\n\nYour {team-weaknesses} only made the challenge more interesting - true masters adapt without compromising core principles. Against {group-opponents}, you showcased tactical evolution in real time.\n\nYour {defining-moment} became a coaching clinic watched by millions. Your {final-result} was validation of tactical courage over trendy conformity. Football schools will study your {country-selection} campaign for decades. Your {managerial-legacy} proved that principles, properly applied, never go out of style.",

    // Heartbreak Hero: Glorious Failure  
    'heartbreak-hero': "💔 THE HEARTBREAK HERO 💔\n\nSometimes the most beautiful stories don't have happy endings. Your {previous-stint} led you to {country-selection}, where your {coaching-philosophy} and {team-strength} created something magical despite {team-weaknesses}.\n\nThrough {group-opponents} and the knockout stages, you built dreams that captured the world's imagination. Your {defining-moment} will be replayed forever - not for victory, but for the pure poetry of effort.\n\nYour {final-result} broke hearts but built legends. True greatness isn't always measured in trophies - sometimes it's measured in how you make people believe in beauty again. Your {managerial-legacy} proves that some defeats are more glorious than victories.",

    // Perfect Campaign: Everything Aligned
    'perfect-campaign': "👑 THE PERFECT CAMPAIGN 👑\n\nStars aligned when your {previous-stint} experience met {country-selection}'s potential. Your {coaching-philosophy} perfectly matched the squad's {team-strength}, while your {team-weaknesses} became minor details in a masterpiece.\n\nFrom the opening match against {group-opponents} through {group-performance}, everything clicked. Your {defining-moment} wasn't dramatic because it didn't need to be - perfection speaks quietly.\n\nYour {final-result} was inevitable from day one, though only you truly believed it. Your {managerial-legacy} represents the ultimate synthesis of preparation, talent, and destiny. This is how football dreams are supposed to end.",

    // Dark Horse Journey: Unexpected Heroes
    'dark-horse-journey': "🐴 THE DARK HORSE RISES 🐴\n\nAfter your {previous-stint}, nobody expected {country-selection} to be anything special. Your {coaching-philosophy} was questioned, your {team-strength} undervalued. When {pre-tournament-drama} hit, critics wrote you off completely.\n\nBut {team-chemistry} carried you through. The {group-stage-moment} against {group-opponents} announced your arrival. Your {group-performance} shocked the world, and suddenly everyone was paying attention.\n\nYour {defining-moment} became the tournament's signature moment. When you achieved {final-result}, you proved that football's greatest stories come from the most unexpected places. Your {managerial-legacy} shows why the beautiful game never stops surprising us.",
    
    // Modern Football Masterclass: Technology Meets Tradition
    'modern-masterclass': "🚀 THE MODERN REVOLUTION 🚀\n\nYour {previous-stint} taught you that football is evolving rapidly. With {country-selection}, you embraced {coaching-philosophy} as the future of the sport. Your {team-strength} was perfectly suited for modern football's demands.\n\nWhen {pre-tournament-drama} tested your methods, {team-chemistry} showed that human connections still matter in the digital age. Your {group-stage-moment} against {group-opponents} showcased how technology and tradition can harmonize.\n\nYour {defining-moment} became a case study in modern football management. Whether you achieved {final-result} or not, your {managerial-legacy} proved that the best coaches adapt without losing their soul.",
    
    'default': "You managed {country-selection} in the World Cup, utilizing {coaching-philosophy} tactics. Despite {team-weaknesses}, your {team-strength} helped achieve {final-result}, creating {managerial-legacy}."
  }
};

// Export all themes
export const themes: SequenceTheme[] = [
  mysticalAcademyTheme,
  battleRoyaleChampionshipTheme,
  detectiveMysteryTheme,
  undergroundRacingTheme,
  worldCupManagerTheme,
];

export const getThemeById = (id: string): SequenceTheme | undefined => {
  return themes.find(theme => theme.id === id);
};