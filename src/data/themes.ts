import { SequenceTheme } from '@/types/sequence';
import { WheelConfig } from '@/types/wheel';
import { BranchingConditions, createBranch } from '@/utils/branchingUtils';

// Enhanced Mystical Academy Theme with Multiple Storylines
const mysticalAcademyTheme: SequenceTheme = {
  id: 'mystical-academy',
  name: 'Mystical Academy: Your Magical Destiny',
  description: 'Discover your complete magical journey from academy to your ultimate purpose',
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
      title: 'Your House',
      description: 'The Academy Council will decide your destiny...',
      wheelConfig: {
        segments: [
          { id: 'courage-house', text: 'House of Courage', color: '#D3A625', rarity: 'common', weight: 25 },
          { id: 'ambition-house', text: 'House of Ambition', color: '#2A623D', rarity: 'common', weight: 25 },
          { id: 'loyalty-house', text: 'House of Loyalty', color: '#F0C75E', rarity: 'common', weight: 25 },
          { id: 'wisdom-house', text: 'House of Wisdom', color: '#226B74', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'mystical-academy',
      },
      // Branching logic: Different magical specializations based on house
      branches: [
        createBranch('light-magic', [
          BranchingConditions.oneOf('house', ['courage-house', 'loyalty-house'])
        ]),
        createBranch('dark-magic', [
          BranchingConditions.oneOf('house', ['ambition-house', 'wisdom-house'])
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
  narrativeTemplate: "You are a {origin} mage sorted into {house}, wielding a {wand} focus with your loyal {pet} by your side. At the Academy, you were known as a {school-performance}. Your purpose is to {purpose}, working as a {career}, with {spell} as your signature spell.",
  narrativeTemplates: {
    // Easter Egg: The Chosen One Path
    'chosen-one': "🔥 THE CHOSEN ONE 🔥\n\nYou are a {origin} mage from {house}, wielding the legendary {wand} focus - one of the most powerful ever created. At the Academy, you distinguished yourself as a {school-performance}, showing early signs of greatness. Your {pet} has been your faithful companion through countless dangers. Driven to {purpose}, you've become the most powerful {hero-career} of your generation. Your mastery of {spell} has saved the magical world itself. History will remember you as the one who changed everything.",
    
    // Easter Egg: The Dark Lord Path
    'dark-lord': "💀 THE DARK LORD RISES 💀\n\nBorn a {origin} mage, you were sorted into {house} where your ambition knew no bounds. Your {wand} focus trembles with dark power, while your {pet} serves as your most loyal servant. Your purpose to {purpose} has twisted into something far more sinister. As a master of the {dark-magic}, you've become the most feared {scholar-career} in magical history. Your signature spell {spell} strikes terror into the hearts of your enemies. The magical world whispers your name in fear.",
    
    // Easter Egg: The Grand Protector Path
    'grand-protector': "✨ THE GRAND PROTECTOR ✨\n\nA wise {origin} mage from {house}, you wield your {wand} focus not for glory, but for the protection of all. Your {pet} has been witness to decades of your wisdom. Your calling to {purpose} has made you the greatest {scholar-career} of your time. Through your mastery of {light-magic} and your signature {spell}, you've become the guardian that the magical world turns to in its darkest hours. Love and wisdom guide your every action.",
    
    // Standard Path Templates
    'hero-path': "⚔️ You are a brave {origin} mage from {house}. With your {wand} focus and {pet} companion, you've answered the call to {purpose} by becoming an elite {hero-career}. Your mastery of {spell} makes you a legendary protector of the magical world, feared by dark mages and celebrated by the innocent.",
    
    'scholar-path': "📚 You are a brilliant {origin} mage from {house}, driven by an insatiable desire to {purpose}. As a renowned {scholar-career}, you wield your {wand} focus in the pursuit of forbidden knowledge, with your {pet} as your devoted research companion. Your groundbreaking work with {spell} has revolutionized magical understanding for generations.",
    
    'nature-path': "🌿 You are a gentle {origin} mage from {house} who has dedicated their life to {purpose}. Working as a legendary {nature-career}, you use your {wand} focus to heal and protect the magical creatures of the world. Your {pet} was the first to recognize your gift, and your signature {spell} allows you to speak the ancient language of the wild.",
    
    'light-path': "🌟 You are a {origin} mage from {house}, blessed with the rare gift of {light-magic}. With your {wand} focus and {pet} companion, you've devoted your life to {purpose}. Your mastery of {spell} brings hope and healing wherever darkness threatens to consume the magical world.",
    
    'dark-path': "🐍 You are a {origin} mage from {house}, who has delved deep into the forbidden art of {dark-magic}. Your {wand} focus pulses with dangerous power, while your {pet} serves as both companion and co-conspirator. Driven to {purpose}, your mastery of {spell} makes even the bravest mages step aside when you pass.",
    
    'default': "You are a {origin} mage sorted into {house}, wielding a {wand} focus with your loyal {pet} by your side. Your purpose is to {purpose}, and {spell} is your signature spell."
  },
};

// Survival Tournament Theme - The Arena Journey
const survivalTournamentTheme: SequenceTheme = {
  id: 'survival-tournament',
  name: 'Survival Tournament: Arena Champion',
  description: 'From Region citizen to Arena survivor to resistance hero - survive the Tournament and overthrow the Empire',
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
        theme: 'survival-tournament',
      },
      defaultNextStep: 'competitor-status',
    },

    // Wheel 2: Tribute Status  
    {
      id: 'competitor-status',
      title: 'Your Competitor Status',
      description: 'How you entered the Tournament determines your preparation and mindset',
      wheelConfig: {
        segments: [
          { id: 'elite-volunteer', text: 'Elite Volunteer', color: '#B8860B', rarity: 'uncommon', weight: 35 },
          { id: 'volunteer-save', text: 'Volunteer to Save Someone', color: '#DC143C', rarity: 'rare', weight: 10 },
          { id: 'reluctant-volunteer', text: 'Reluctant Volunteer', color: '#8B4513', rarity: 'uncommon', weight: 8 },
          { id: 'selected-first', text: 'Selected - First Time', color: '#4682B4', rarity: 'common', weight: 40 },
          { id: 'selected-multiple', text: 'Selected - Multiple Entries', color: '#8B0000', rarity: 'common', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      // Conditional logic for Elite volunteers
      branches: [
        createBranch('elite-training', [
          BranchingConditions.oneOf('region', ['region-1', 'region-2', 'region-4']),
          BranchingConditions.equals('competitor-status', 'elite-volunteer')
        ])
      ],
      defaultNextStep: 'training-score',
    },

    // Wheel 3: Training Score
    {
      id: 'training-score', 
      title: 'Your Pre-Tournament Training Score',
      description: 'Official assessment determines sponsor attention and target level',
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
        theme: 'survival-tournament',
      },
      defaultNextStep: 'arena-environment',
    },

    // Wheel 4: Arena Environment
    {
      id: 'arena-environment',
      title: 'Your Arena Environment', 
      description: 'The battleground that will test your district skills',
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
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
      },
      // No next step - this ends the sequence
    },

    // Wheel 7: First Night Survival (BINARY)  
    {
      id: 'first-night-survival',
      title: 'First Night Survival',
      description: 'Exposure, dehydration, and basic survival threaten the remaining tributes',
      wheelConfig: {
        segments: [
          { id: 'survive-night', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 80 },
          { id: 'die-exposure', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      branches: [
        createBranch('exposure-death', [
          BranchingConditions.equals('first-night-survival', 'die-exposure')
        ]),
      ],
      defaultNextStep: 'tracker-jacker-encounter',
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
        theme: 'survival-tournament',
      },
    },

    // Wheel 8: Tracker Jacker Encounter (BINARY - conditional on forest arenas)
    {
      id: 'tracker-jacker-encounter',
      title: 'Tracker Jacker Encounter',
      description: 'Genetically modified wasps with hallucinogenic venom',
      wheelConfig: {
        segments: [
          { id: 'survive-trackers', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 70 },
          { id: 'die-trackers', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 30 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      branches: [
        createBranch('tracker-death', [
          BranchingConditions.equals('tracker-jacker-encounter', 'die-trackers')
        ]),
        // Skip this wheel if not in forest/tropical arena
        createBranch('arena-disaster-survival', [
          BranchingConditions.oneOf('arena-environment', ['urban-ruins', 'underground-maze', 'volcanic-hellscape', 'desert-wasteland', 'frozen-tundra', 'mountain-peaks'])
        ])
      ],
      defaultNextStep: 'arena-disaster-survival',
    },

    // DEATH ENDING: Tracker Jackers
    {
      id: 'tracker-death',
      title: 'Death by Tracker Jackers',
      description: 'The Empire\'s twisted creatures claim another victim',
      wheelConfig: {
        segments: [
          { id: 'hallucination-death', text: 'Lost in Hallucinations', color: '#FF69B4', rarity: 'common', weight: 50 },
          { id: 'venom-death', text: 'Killed by Venom', color: '#228B22', rarity: 'common', weight: 30 },
          { id: 'swarm-death', text: 'Overwhelmed by Swarm', color: '#FFD700', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
    },

    // Wheel 9: Arena Disaster Survival (BINARY)
    {
      id: 'arena-disaster-survival',
      title: 'Arena Disaster Survival',
      description: 'Official manipulation: fire, floods, earthquakes, or toxic gas',
      wheelConfig: {
        segments: [
          { id: 'survive-disaster', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 65 },
          { id: 'die-disaster', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 35 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      branches: [
        createBranch('disaster-death', [
          BranchingConditions.equals('arena-disaster-survival', 'die-disaster')
        ]),
      ],
      defaultNextStep: 'mutt-attack',
    },

    // DEATH ENDING: Arena Disaster
    {
      id: 'disaster-death',
      title: 'Death by Arena Manipulation',
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
        theme: 'survival-tournament',
      },
    },

    // Wheel 10: Mutt Attack (BINARY)
    {
      id: 'mutt-attack',
      title: 'Beast Attack',
      description: 'Empire-engineered creatures designed to hunt and kill',
      wheelConfig: {
        segments: [
          { id: 'survive-mutts', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 60 },
          { id: 'die-mutts', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 40 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      branches: [
        createBranch('mutt-death', [
          BranchingConditions.equals('mutt-attack', 'die-mutts')
        ]),
      ],
      defaultNextStep: 'alliance-betrayal-test',
    },

    // DEATH ENDING: Mutt Attack
    {
      id: 'mutt-death',
      title: 'Death by Beasts',
      description: 'The Empire\'s deadliest creatures prove unstoppable',
      wheelConfig: {
        segments: [
          { id: 'wolf-beasts', text: 'Killed by Wolf Beasts', color: '#2F2F2F', rarity: 'common', weight: 40 },
          { id: 'tracker-beasts', text: 'Hunted by Tracker Beasts', color: '#8B0000', rarity: 'common', weight: 30 },
          { id: 'snake-beasts', text: 'Poisoned by Snake Beasts', color: '#228B22', rarity: 'common', weight: 30 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
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
        theme: 'survival-tournament',
      },
      defaultNextStep: 'rebellion-role',
    },

    // Wheel 13: Rebellion Role (final wheel for survivors)
    {
      id: 'rebellion-role',
      title: 'Your Resistance Role',
      description: 'Your part in overthrowing the Empire determines the world\'s future',
      wheelConfig: {
        segments: [
          { id: 'the-symbol', text: 'The Symbol of Hope', color: '#FFD700', rarity: 'legendary', weight: 25 },
          { id: 'underground-coordinator', text: 'Underground Coordinator', color: '#2F4F2F', rarity: 'rare', weight: 20 },
          { id: 'region-liberator', text: 'Region Liberator', color: '#228B22', rarity: 'rare', weight: 18 },
          { id: 'mentor-rebel', text: 'Mentor Rebel', color: '#4682B4', rarity: 'uncommon', weight: 15 },
          { id: 'empire-infiltrator', text: 'Empire Infiltrator', color: '#800080', rarity: 'rare', weight: 12 },
          { id: 'propaganda-star', text: 'Propaganda Star', color: '#FF6347', rarity: 'uncommon', weight: 8 },
          { id: 'emperor-assassin', text: 'Emperor Assassin', color: '#8B0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'survival-tournament',
      },
      // No defaultNextStep - this is the final wheel
    },
  ],
  
  narrativeTemplate: "You were a competitor from {region} who entered the Tournament as a {competitor-status}, earning a training score of {training-score} in the {arena-environment} arena. Following a {alliance-strategy} strategy, you survived the bloodbath and fought through every deadly challenge the Empire threw at you. Your {final-showdown} led to your role as {resistance-role} in the revolution that would ultimately bring down the Emperor's regime.",
  
  narrativeTemplates: {
    // Death storylines
    'bloodbath-victim': "💀 THE BLOODBATH VICTIM 💀\n\nYou were a {competitor-status} from {region} with a training score of {training-score}. Your journey ended in the first 60 seconds of the Tournament - {bloodbath-death}. But even in death, your sacrifice became part of the fire that would eventually burn down the Empire. Your region remembers you as a hero who faced impossible odds with courage.",
    
    'exposure-victim': "❄️ CLAIMED BY THE ELEMENTS ❄️\n\nA {competitor-status} from {region}, you survived the bloodbath only to fall to the {arena-environment}'s harsh conditions. You {exposure-death}, but your determination to survive inspired others. Your family back home knows you fought until your last breath, and your memory fuels the growing resistance.",
    
    'tracker-victim': "🐝 FALLEN TO THE EMPIRE'S CREATURES 🐝\n\nFrom {region} with a score of {training-score}, you made it through multiple Arena challenges before encountering the Empire's deadliest trap. You {tracker-death} in the forest, but your survival skills kept you alive longer than most. The resistance will remember how the Empire's twisted science claimed one of their best.",
    
    'disaster-victim': "🌋 OFFICIAL MANIPULATION VICTIM 🌋\n\nA brave {competitor-status} from {region}, you proved your worth by surviving the bloodbath and early challenges. When the Officials intervened, you {disaster-death}, showing the Empire's true cruelty. Your death exposed their manipulation and became a rallying cry for the revolution.",
    
    'mutt-victim': "🐺 KILLED BY EMPIRE MONSTERS 🐺\n\nYou made it further than most - a {competitor-status} from {region} who survived every human threat in the Arena. But the Empire's final weapons proved too much, and you were {mutt-death}. Your courage in facing these abominations showed the Empire what they were truly fighting against.",
    
    'betrayal-victim': "💔 BETRAYED IN THE FINAL MOMENTS 💔\n\nA {competitor-status} from {region}, you survived every Arena trap through your {alliance-strategy} strategy. In the end, you were {betrayal-death}, proving how the Empire corrupts everything it touches. Your loyalty and sacrifice became the foundation for the rebellion's unity.",
    
    // Victory storylines  
    'brutal-survivor': "⚔️ THE BRUTAL SURVIVOR ⚔️\n\nFrom {district} with a training score of {training-score}, you fought through every death trap with ruthless determination. Your {brutal-victory} came at a terrible cost - the lives you took haunt your dreams. But as {rebellion-role}, you channeled that pain into the fire that burned down Snow's empire. The Games made you a killer; the rebellion made you a liberator.",
    
    'strategic-mastermind': "🧠 THE STRATEGIC MASTERMIND 🧠\n\nA brilliant {tribute-status} from {district}, you proved that mind conquers muscle. Through careful planning and your {strategic-victory}, you outmaneuvered every threat in the {arena-environment}. As {rebellion-role}, your tactical genius became the backbone of the revolution's success.",
    
    'unlikely-hero': "🏹 THE UNLIKELY HERO 🏹\n\nYou were just a {tribute-status} from {district} - no one expected you to survive. But through your {sacrifice-victory} and pure determination, you became something more. As {rebellion-role}, you proved that heroes aren't born in Career districts - they're forged in the fires of impossible odds.",
    
    'star-crossed': "💕 THE STAR-CROSSED SURVIVORS 💕\n\nTwo hearts from {region} who found love in the darkest place. Your {joint-victory} gave the Empire something the Empire couldn't destroy - hope. Together as {rebellion-role}, you became the symbol that love conquers even the cruelest tyranny.",
    
    'mockingjay-perfect': "🔥 THE PERFECT MOCKINGJAY 🔥\n\nFrom the coal-stained district of {district}, you volunteered to save someone you loved and scored an impossible {training-score}. Your {joint-victory} after exploiting the Gamemakers' rules broke their system entirely. As {the-mockingjay}, you became the symbol that ignited the revolution and personally ensured President Snow's downfall. You are the girl on fire who burned down an empire.",
    
    'default': "You were a {tribute-status} from {district} who survived the Games and joined the rebellion as {rebellion-role}."
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
          { id: 'neo-tokyo', text: 'Neo-Tokyo', color: '#FF1493', rarity: 'uncommon', weight: 15 },
          { id: 'victorian-london', text: 'Victorian London', color: '#8B4513', rarity: 'rare', weight: 10 },
          { id: 'modern-new-york', text: 'Modern New York', color: '#4169E1', rarity: 'common', weight: 20 },
          { id: 'coastal-town', text: 'Small Coastal Town', color: '#20B2AA', rarity: 'common', weight: 18 },
          { id: 'las-vegas', text: 'Las Vegas', color: '#FFD700', rarity: 'uncommon', weight: 12 },
          { id: 'new-orleans', text: 'New Orleans', color: '#9370DB', rarity: 'uncommon', weight: 25 },
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
          { id: 'locked-mansion', text: 'Locked Mansion Murder', color: '#8B0000', rarity: 'uncommon', weight: 18 },
          { id: 'serial-killer', text: 'Serial Killer\'s Latest', color: '#DC143C', rarity: 'rare', weight: 12 },
          { id: 'art-heist', text: 'High-Stakes Heist', color: '#B8860B', rarity: 'uncommon', weight: 15 },
          { id: 'corporate-murder', text: 'Corporate Executive Found Dead', color: '#2F4F2F', rarity: 'common', weight: 20 },
          { id: 'missing-child', text: 'Missing Child Case', color: '#FF69B4', rarity: 'common', weight: 20 },
          { id: 'cold-case', text: 'Cold Case Reopened', color: '#4682B4', rarity: 'uncommon', weight: 15 },
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
          { id: 'forensic-genius', text: 'Forensic Genius', color: '#E6E6FA', rarity: 'uncommon', weight: 18 },
          { id: 'psychology-master', text: 'Psychology Master', color: '#9370DB', rarity: 'uncommon', weight: 16 },
          { id: 'tech-detective', text: 'Tech Detective', color: '#4169E1', rarity: 'rare', weight: 12 },
          { id: 'street-veteran', text: 'Street Veteran', color: '#A0522D', rarity: 'common', weight: 22 },
          { id: 'by-the-book', text: 'By-the-Book Professional', color: '#228B22', rarity: 'common', weight: 20 },
          { id: 'undercover-specialist', text: 'Undercover Specialist', color: '#2F2F2F', rarity: 'rare', weight: 12 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'first-suspect',
    },

    // Step 4: First Suspect
    {
      id: 'first-suspect',
      title: 'Your First Suspect',
      description: 'Who immediately catches your attention?',
      wheelConfig: {
        segments: [
          { id: 'grieving-family-member', text: 'The Grieving Family Member', color: '#4682B4', rarity: 'common', weight: 20 },
          { id: 'business-partner', text: 'Business Partner', color: '#B8860B', rarity: 'common', weight: 18 },
          { id: 'estranged-family', text: 'Estranged Family Member', color: '#8B0000', rarity: 'common', weight: 18 },
          { id: 'former-employee', text: 'Former Employee', color: '#2F4F2F', rarity: 'common', weight: 16 },
          { id: 'mysterious-stranger', text: 'Mysterious Stranger', color: '#800080', rarity: 'uncommon', weight: 14 },
          { id: 'best-friend', text: 'Best Friend', color: '#FF69B4', rarity: 'uncommon', weight: 14 },
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
          { id: 'follow-money', text: 'Follow the Money', color: '#FFD700', rarity: 'common', weight: 18 },
          { id: 'psychological-pressure', text: 'Psychological Pressure', color: '#9370DB', rarity: 'uncommon', weight: 15 },
          { id: 'surveillance', text: 'Surveillance Operation', color: '#2F2F2F', rarity: 'uncommon', weight: 16 },
          { id: 'forensic-analysis', text: 'Forensic Deep Dive', color: '#E6E6FA', rarity: 'uncommon', weight: 17 },
          { id: 'witness-protection', text: 'Witness Protection', color: '#4682B4', rarity: 'rare', weight: 12 },
          { id: 'undercover-infiltration', text: 'Undercover Infiltration', color: '#8B0000', rarity: 'rare', weight: 22 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'detective-mystery',
      },
      defaultNextStep: 'plot-twist',
    },

    // Step 6: Plot Twist
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
          { id: 'time-paradox', text: 'Time Paradox', color: '#800080', rarity: 'legendary', weight: 38 },
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
          { id: 'innocent-bystander', text: 'The Innocent Bystander', color: '#4682B4', rarity: 'uncommon', weight: 16 },
          { id: 'victims-child', text: 'Victim\'s Own Child', color: '#8B0000', rarity: 'rare', weight: 14 },
          { id: 'dirty-partner', text: 'Your Original Partner', color: '#2F2F2F', rarity: 'rare', weight: 12 },
          { id: 'corrupt-official', text: 'Mayor/Judge/Chief', color: '#800080', rarity: 'legendary', weight: 8 },
          { id: 'professional-hitman', text: 'Professional Hitman', color: '#DC143C', rarity: 'uncommon', weight: 18 },
          { id: 'jealous-ex', text: 'Jealous Ex-Lover', color: '#FF69B4', rarity: 'common', weight: 32 },
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
          { id: 'high-speed-chase', text: 'High-Speed Chase', color: '#FF4500', rarity: 'uncommon', weight: 18 },
          { id: 'rooftop-standoff', text: 'Rooftop Standoff', color: '#4169E1', rarity: 'uncommon', weight: 16 },
          { id: 'warehouse-trap', text: 'Warehouse Trap', color: '#2F2F2F', rarity: 'uncommon', weight: 15 },
          { id: 'courtroom-confession', text: 'Public Confession', color: '#B8860B', rarity: 'rare', weight: 12 },
          { id: 'quiet-arrest', text: 'Quiet Arrest', color: '#228B22', rarity: 'common', weight: 24 },
          { id: 'hostage-situation', text: 'Hostage Situation', color: '#8B0000', rarity: 'rare', weight: 15 },
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
      // Final step - no defaultNextStep
    },
  ],

  narrativeTemplate: "In {city}, you investigated a {crime-discovery} using your expertise as a {detective-specialty}. Your first suspect was {first-suspect}, but through {investigation-method}, you uncovered a shocking {plot-twist}. The real mastermind was {real-culprit}, leading to a dramatic {confrontation}. The trial resulted in {trial-outcome}, and your story ended with {aftermath}.",

  narrativeTemplates: {
    // Legendary Case: The Perfect Detective
    'perfect-detective': "🔍 THE PERFECT DETECTIVE 🔍\n\nIn {city}, you faced the impossible - a {crime-discovery} that seemed unsolvable. As a brilliant {detective-specialty}, you saw through every deception, from suspecting {first-suspect} to uncovering the {plot-twist} that revealed {real-culprit} as the mastermind. Your {confrontation} became legendary, the {trial-outcome} brought perfect justice, and you became a {hero-detective} whose methods are still taught at police academies worldwide.",

    // Dark Path: The Haunted Investigator  
    'haunted-detective': "👻 THE HAUNTED DETECTIVE 👻\n\nThe {crime-discovery} in {city} changed you forever. Your {detective-specialty} skills led you through a maze of suspects, starting with {first-suspect}, but the {plot-twist} revealing {real-culprit} shattered your faith in justice. Even after the {confrontation} and {trial-outcome}, you remain {haunted-by-case}, carrying the weight of what you've seen in the darkest corners of human nature.",

    // Corruption Path: The System Fighter
    'corruption-fighter': "⚖️ THE CORRUPTION FIGHTER ⚖️\n\nIn {city}, your investigation of a {crime-discovery} uncovered more than just a crime - it exposed a web of corruption reaching the highest levels. Your {detective-specialty} training and {investigation-method} revealed that {real-culprit} was just a pawn. The {confrontation} was dangerous, but the {trial-outcome} led to massive reforms. You became the detective who {corruption-exposed}, reshaping law enforcement forever.",

    // Hero Path: The People's Champion
    'peoples-champion': "👮 THE PEOPLE'S CHAMPION 👮\n\nStarting as a {detective-specialty} in {city}, you turned a simple {crime-discovery} into a career-defining moment. When you suspected {first-suspect} but discovered {real-culprit} was the true villain, your {confrontation} became the stuff of legends. The {trial-outcome} brought justice, and as a {hero-detective}, you became the symbol of what law enforcement should be.",

    // Tragic Path: The Broken Detective
    'broken-detective': "💔 THE BROKEN DETECTIVE 💔\n\nIn {city}, the {crime-discovery} seemed routine until the {plot-twist} revealed truths you weren't prepared for. Your {detective-specialty} skills couldn't protect you from the psychological damage when {real-culprit}'s true nature was exposed. Despite the {confrontation} and {trial-outcome}, you're {haunted-by-case}, forever changed by a case that revealed the depths of human evil.",

    // Victory Path: The Master Investigator
    'master-investigator': "🏆 THE MASTER INVESTIGATOR 🏆\n\nYour reputation as a {detective-specialty} in {city} was built on cases like the {crime-discovery}. While others focused on obvious suspects like {first-suspect}, your {investigation-method} uncovered the {plot-twist} that led directly to {real-culprit}. The {confrontation} showcased your skills, the {trial-outcome} delivered justice, and you ended as a {hero-detective} whose methods revolutionized police work.",

    'default': "In {city}, you solved a {crime-discovery} as a {detective-specialty}, discovered {real-culprit} was the true culprit after a {plot-twist}, and saw justice served with {trial-outcome}."
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

// Export all themes
export const themes: SequenceTheme[] = [
  mysticalAcademyTheme,
  survivalTournamentTheme,
  detectiveMysteryTheme,
  undergroundRacingTheme,
];

export const getThemeById = (id: string): SequenceTheme | undefined => {
  return themes.find(theme => theme.id === id);
};