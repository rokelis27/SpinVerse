import { SequenceTheme } from '@/types/sequence';
import { WheelConfig } from '@/types/wheel';
import { BranchingConditions, createBranch } from '@/utils/branchingUtils';

// Enhanced Harry Potter Theme with Multiple Storylines
const harryPotterTheme: SequenceTheme = {
  id: 'harry-potter',
  name: 'Harry Potter: Your Magical Destiny',
  description: 'Discover your complete wizarding journey from Hogwarts to your ultimate purpose',
  color: '#8B4513',
  startStepId: 'origin', // Define the starting step
  steps: [
    {
      id: 'origin',
      title: 'Your Origin',
      description: 'Where does your magical blood come from?',
      wheelConfig: {
        segments: [
          { id: 'muggle-born', text: 'Muggle-born', color: '#E8C547', rarity: 'common', weight: 35 },
          { id: 'half-blood', text: 'Half-blood', color: '#7FB069', rarity: 'common', weight: 40 },
          { id: 'pure-blood', text: 'Pure-blood', color: '#4A90A4', rarity: 'uncommon', weight: 20 },
          { id: 'squib', text: 'Squib Family', color: '#B85450', rarity: 'rare', weight: 5 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      defaultNextStep: 'house', // Linear progression to house selection
    },
    {
      id: 'house',
      title: 'Your House',
      description: 'The Sorting Hat will decide your destiny...',
      wheelConfig: {
        segments: [
          { id: 'gryffindor', text: 'Gryffindor', color: '#D3A625', rarity: 'common', weight: 25 },
          { id: 'slytherin', text: 'Slytherin', color: '#2A623D', rarity: 'common', weight: 25 },
          { id: 'hufflepuff', text: 'Hufflepuff', color: '#F0C75E', rarity: 'common', weight: 25 },
          { id: 'ravenclaw', text: 'Ravenclaw', color: '#226B74', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      // Branching logic: Different magical specializations based on house
      branches: [
        createBranch('light-magic', [
          BranchingConditions.oneOf('house', ['gryffindor', 'hufflepuff'])
        ]),
        createBranch('dark-magic', [
          BranchingConditions.oneOf('house', ['slytherin', 'ravenclaw'])
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
        theme: 'harry-potter',
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
        theme: 'harry-potter',
      },
      defaultNextStep: 'wand', // Merge back to main path
    },
    
    {
      id: 'wand',
      title: 'Your Wand',
      description: 'The wand chooses the wizard, remember...',
      wheelConfig: {
        segments: [
          // Legendary combinations (rarest, most powerful)
          { id: 'holly-phoenix', text: 'Holly & Phoenix Feather', color: '#8B0000', rarity: 'legendary', weight: 5 },
          { id: 'elder-phoenix', text: 'Elder & Phoenix Feather', color: '#2F2F2F', rarity: 'legendary', weight: 3 },
          { id: 'yew-phoenix', text: 'Yew & Phoenix Feather', color: '#556B2F', rarity: 'legendary', weight: 4 },
          
          // Rare combinations (special properties)
          { id: 'cherry-dragon', text: 'Cherry & Dragon Heartstring', color: '#DC143C', rarity: 'rare', weight: 8 },
          { id: 'cedar-dragon', text: 'Cedar & Dragon Heartstring', color: '#8B4513', rarity: 'rare', weight: 9 },
          { id: 'cypress-dragon', text: 'Cypress & Dragon Heartstring', color: '#2F4F2F', rarity: 'rare', weight: 7 },
          { id: 'ebony-dragon', text: 'Ebony & Dragon Heartstring', color: '#000000', rarity: 'rare', weight: 6 },
          
          // Uncommon combinations (solid performance)
          { id: 'maple-phoenix', text: 'Maple & Phoenix Feather', color: '#D2691E', rarity: 'uncommon', weight: 12 },
          { id: 'chestnut-dragon', text: 'Chestnut & Dragon Heartstring', color: '#CD853F', rarity: 'uncommon', weight: 13 },
          { id: 'walnut-unicorn', text: 'Walnut & Unicorn Hair', color: '#8B7355', rarity: 'uncommon', weight: 11 },
          { id: 'rowan-dragon', text: 'Rowan & Dragon Heartstring', color: '#A0522D', rarity: 'uncommon', weight: 10 },
          
          // Common combinations (reliable, widespread)
          { id: 'oak-unicorn', text: 'Oak & Unicorn Hair', color: '#D2B48C', rarity: 'common', weight: 18 },
          { id: 'ash-unicorn', text: 'Ash & Unicorn Hair', color: '#DEB887', rarity: 'common', weight: 19 },
          { id: 'birch-unicorn', text: 'Birch & Unicorn Hair', color: '#F5DEB3', rarity: 'common', weight: 17 },
          { id: 'willow-unicorn', text: 'Willow & Unicorn Hair', color: '#9ACD32', rarity: 'common', weight: 16 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      defaultNextStep: 'school-performance',
    },
    
    // NEW: School Performance - How did you do at Hogwarts?
    {
      id: 'school-performance',
      title: 'Your School Achievement',
      description: 'How did you distinguish yourself at Hogwarts?',
      wheelConfig: {
        segments: [
          { id: 'quidditch-captain', text: 'Quidditch Captain', color: '#DAA520', rarity: 'rare', weight: 12 },
          { id: 'prefect', text: 'House Prefect', color: '#4169E1', rarity: 'uncommon', weight: 18 },
          { id: 'head-student', text: 'Head Boy/Girl', color: '#FFD700', rarity: 'legendary', weight: 6 },
          { id: 'top-grades', text: 'Outstanding Student', color: '#9932CC', rarity: 'uncommon', weight: 16 },
          { id: 'quidditch-star', text: 'Quidditch Star Player', color: '#FF6347', rarity: 'uncommon', weight: 15 },
          { id: 'dueling-champion', text: 'Dueling Club Champion', color: '#8B0000', rarity: 'rare', weight: 10 },
          { id: 'popular-student', text: 'Most Popular Student', color: '#FF69B4', rarity: 'common', weight: 20 },
          { id: 'rule-breaker', text: 'Notorious Rule-Breaker', color: '#2F4F2F', rarity: 'uncommon', weight: 13 },
          { id: 'quiet-genius', text: 'Quiet Genius', color: '#4682B4', rarity: 'common', weight: 17 },
          { id: 'class-clown', text: 'Class Prankster', color: '#FFA500', rarity: 'common', weight: 15 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      defaultNextStep: 'pet',
    },
    {
      id: 'pet',
      title: 'Your Magical Companion',
      description: 'Choose your faithful partner for the magical journey',
      wheelConfig: {
        segments: [
          // Official Hogwarts pets (most common)
          { id: 'snowy-owl', text: 'Snowy Owl (like Hedwig)', color: '#F8F8FF', rarity: 'common', weight: 18 },
          { id: 'brown-owl', text: 'Brown Owl', color: '#8B7355', rarity: 'common', weight: 16 },
          { id: 'tabby-cat', text: 'Tabby Cat', color: '#CD853F', rarity: 'common', weight: 17 },
          { id: 'black-cat', text: 'Black Cat', color: '#2F2F2F', rarity: 'common', weight: 15 },
          { id: 'common-toad', text: 'Common Toad', color: '#6B8E23', rarity: 'uncommon', weight: 12 },
          
          // Unofficial but seen at Hogwarts
          { id: 'rat', text: 'Pet Rat (like Scabbers)', color: '#A0522D', rarity: 'uncommon', weight: 10 },
          { id: 'ferret', text: 'Ferret', color: '#DEB887', rarity: 'uncommon', weight: 8 },
          
          // Rare/Special companions
          { id: 'snake', text: 'Non-Venomous Snake', color: '#228B22', rarity: 'rare', weight: 6 },
          { id: 'pygmy-puff', text: 'Pygmy Puff', color: '#FF69B4', rarity: 'rare', weight: 5 },
          { id: 'bowtruckle', text: 'Bowtruckle', color: '#8FBC8F', rarity: 'rare', weight: 4 },
          
          // Ultra-rare magical companions  
          { id: 'phoenix', text: 'Phoenix Chick', color: '#FF4500', rarity: 'legendary', weight: 2 },
          { id: 'thestral', text: 'Baby Thestral', color: '#2F2F2F', rarity: 'legendary', weight: 1 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      defaultNextStep: 'purpose',
    },
    
    // NEW: Life Purpose - The game-changing addition!
    {
      id: 'purpose',
      title: 'Your Magical Purpose',
      description: 'What drives you in the wizarding world?',
      wheelConfig: {
        segments: [
          { id: 'defeat-voldemort', text: 'Defeat Voldemort', color: '#8B0000', rarity: 'legendary', weight: 8 },
          { id: 'protect-muggles', text: 'Protect Muggles', color: '#4682B4', rarity: 'common', weight: 20 },
          { id: 'discover-magic', text: 'Discover New Magic', color: '#9932CC', rarity: 'uncommon', weight: 18 },
          { id: 'save-creatures', text: 'Save Magical Creatures', color: '#228B22', rarity: 'uncommon', weight: 18 },
          { id: 'become-auror', text: 'Become an Auror', color: '#B8860B', rarity: 'uncommon', weight: 16 },
          { id: 'teach-hogwarts', text: 'Teach at Hogwarts', color: '#8B4513', rarity: 'uncommon', weight: 12 },
          { id: 'master-potions', text: 'Master All Potions', color: '#2F4F2F', rarity: 'rare', weight: 8 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      // Branching based on purpose - different career paths
      branches: [
        createBranch('hero-career', [
          BranchingConditions.oneOf('purpose', ['defeat-voldemort', 'protect-muggles', 'become-auror'])
        ]),
        createBranch('scholar-career', [
          BranchingConditions.oneOf('purpose', ['discover-magic', 'teach-hogwarts', 'master-potions'])
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
      description: 'Choose your path as a protector of the wizarding world',
      wheelConfig: {
        segments: [
          { id: 'auror', text: 'Auror', color: '#B8860B', rarity: 'common', weight: 30 },
          { id: 'hit-wizard', text: 'Hit Wizard', color: '#8B0000', rarity: 'uncommon', weight: 20 },
          { id: 'ministry-security', text: 'Ministry Security', color: '#4682B4', rarity: 'common', weight: 25 },
          { id: 'dragon-keeper', text: 'Dragon Keeper', color: '#DC143C', rarity: 'rare', weight: 15 },
          { id: 'curse-breaker', text: 'Curse Breaker', color: '#FFD700', rarity: 'rare', weight: 10 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
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
        theme: 'harry-potter',
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
        theme: 'harry-potter',
      },
      defaultNextStep: 'spell',
    },
    
    {
      id: 'spell',
      title: 'Your Signature Spell',
      description: 'What magic defines your legacy?',
      wheelConfig: {
        segments: [
          { id: 'expelliarmus', text: 'Expelliarmus', color: '#FF6347', rarity: 'uncommon', weight: 18 },
          { id: 'lumos', text: 'Lumos', color: '#FFD700', rarity: 'common', weight: 20 },
          { id: 'alohomora', text: 'Alohomora', color: '#4169E1', rarity: 'common', weight: 18 },
          { id: 'expecto-patronum', text: 'Expecto Patronum', color: '#E6E6FA', rarity: 'legendary', weight: 5 },
          { id: 'stupefy', text: 'Stupefy', color: '#DC143C', rarity: 'uncommon', weight: 15 },
          { id: 'accio', text: 'Accio', color: '#32CD32', rarity: 'common', weight: 16 },
          { id: 'protego', text: 'Protego', color: '#4682B4', rarity: 'uncommon', weight: 12 },
          { id: 'avada-kedavra', text: 'Avada Kedavra', color: '#228B22', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
      // No defaultNextStep - this is the end of the sequence
    },
  ],
  narrativeTemplate: "You are a {origin} wizard sorted into {house}, wielding a {wand} wand with your loyal {pet} by your side. At Hogwarts, you were known as a {school-performance}. Your purpose is to {purpose}, working as a {career}, with {spell} as your signature spell.",
  narrativeTemplates: {
    // Easter Egg: The Chosen One Path (Harry Potter-like combination)
    'chosen-one': "🔥 THE CHOSEN ONE 🔥\n\nYou are a {origin} wizard from {house} house, wielding the legendary {wand} wand - the brother to He-Who-Must-Not-Be-Named's own wand. At Hogwarts, you distinguished yourself as a {school-performance}, showing early signs of greatness. Your {pet} has been your faithful companion through countless dangers. Driven to {purpose}, you've become the most powerful {hero-career} of your generation. Your mastery of {spell} has saved the wizarding world itself. History will remember you as the one who changed everything.",
    
    // Easter Egg: The Dark Lord Path (Voldemort-like combination) 
    'dark-lord': "💀 THE DARK LORD RISES 💀\n\nBorn a {origin} wizard, you were sorted into {house} where your ambition knew no bounds. Your {wand} wand trembles with dark power, while your {pet} serves as your most loyal servant. Your purpose to {purpose} has twisted into something far more sinister. As a master of the {dark-magic}, you've become the most feared {scholar-career} in wizarding history. Your signature spell {spell} strikes terror into the hearts of your enemies. The wizarding world whispers your name in fear.",
    
    // Easter Egg: The Protector Path (Dumbledore-like combination)
    'grand-protector': "✨ THE GRAND PROTECTOR ✨\n\nA wise {origin} wizard from {house} house, you wield your {wand} wand not for glory, but for the protection of all. Your {pet} has been witness to decades of your wisdom. Your calling to {purpose} has made you the greatest {scholar-career} of your time. Through your mastery of {light-magic} and your signature {spell}, you've become the guardian that the wizarding world turns to in its darkest hours. Love and wisdom guide your every action.",
    
    // Standard Path Templates
    'hero-path': "⚔️ You are a brave {origin} wizard from {house} house. With your {wand} wand and {pet} companion, you've answered the call to {purpose} by becoming an elite {hero-career}. Your mastery of {spell} makes you a legendary protector of the wizarding world, feared by dark wizards and celebrated by the innocent.",
    
    'scholar-path': "📚 You are a brilliant {origin} wizard from {house} house, driven by an insatiable desire to {purpose}. As a renowned {scholar-career}, you wield your {wand} wand in the pursuit of forbidden knowledge, with your {pet} as your devoted research companion. Your groundbreaking work with {spell} has revolutionized magical understanding for generations.",
    
    'nature-path': "🌿 You are a gentle {origin} wizard from {house} house who has dedicated their life to {purpose}. Working as a legendary {nature-career}, you use your {wand} wand to heal and protect the magical creatures of the world. Your {pet} was the first to recognize your gift, and your signature {spell} allows you to speak the ancient language of the wild.",
    
    'light-path': "🌟 You are a {origin} wizard from {house}, blessed with the rare gift of {light-magic}. With your {wand} wand and {pet} companion, you've devoted your life to {purpose}. Your mastery of {spell} brings hope and healing wherever darkness threatens to consume the wizarding world.",
    
    'dark-path': "🐍 You are a {origin} wizard from {house}, who has delved deep into the forbidden art of {dark-magic}. Your {wand} wand pulses with dangerous power, while your {pet} serves as both companion and co-conspirator. Driven to {purpose}, your mastery of {spell} makes even the bravest wizards step aside when you pass.",
    
    'default': "You are a {origin} wizard sorted into {house}, wielding a {wand} wand with your loyal {pet} by your side. Your purpose is to {purpose}, and {spell} is your signature spell."
  },
};

// Hunger Games Theme - The Arena Journey
const hungerGamesTheme: SequenceTheme = {
  id: 'hunger-games',
  name: 'Hunger Games: Tribute Journey',
  description: 'From District citizen to Arena survivor to potential rebel hero - survive the Games and overthrow the Capitol',
  color: '#8B0000', // Dark red for danger
  startStepId: 'district',
  steps: [
    // Wheel 1: District Origin
    {
      id: 'district',
      title: 'Your District Origin',
      description: 'Where you\'re from determines your skills, resources, and survival chances',
      wheelConfig: {
        segments: [
          { id: 'district-1', text: 'District 1 - Luxury', color: '#FFD700', rarity: 'uncommon', weight: 15 },
          { id: 'district-2', text: 'District 2 - Masonry', color: '#808080', rarity: 'uncommon', weight: 12 },
          { id: 'district-3', text: 'District 3 - Technology', color: '#4169E1', rarity: 'common', weight: 8 },
          { id: 'district-4', text: 'District 4 - Fishing', color: '#0080FF', rarity: 'uncommon', weight: 10 },
          { id: 'district-5', text: 'District 5 - Power', color: '#FFFF00', rarity: 'common', weight: 7 },
          { id: 'district-6', text: 'District 6 - Transportation', color: '#A0522D', rarity: 'common', weight: 7 },
          { id: 'district-7', text: 'District 7 - Lumber', color: '#228B22', rarity: 'common', weight: 9 },
          { id: 'district-8', text: 'District 8 - Textiles', color: '#800080', rarity: 'common', weight: 8 },
          { id: 'district-9', text: 'District 9 - Grain', color: '#DAA520', rarity: 'common', weight: 7 },
          { id: 'district-10', text: 'District 10 - Livestock', color: '#8B4513', rarity: 'common', weight: 8 },
          { id: 'district-11', text: 'District 11 - Agriculture', color: '#6B8E23', rarity: 'common', weight: 8 },
          { id: 'district-12', text: 'District 12 - Coal', color: '#2F2F2F', rarity: 'legendary', weight: 1 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
      defaultNextStep: 'tribute-status',
    },

    // Wheel 2: Tribute Status  
    {
      id: 'tribute-status',
      title: 'Your Tribute Status',
      description: 'How you entered the Games determines your preparation and mindset',
      wheelConfig: {
        segments: [
          { id: 'career-volunteer', text: 'Career Volunteer', color: '#B8860B', rarity: 'uncommon', weight: 35 },
          { id: 'volunteer-save', text: 'Volunteer to Save Someone', color: '#DC143C', rarity: 'rare', weight: 10 },
          { id: 'reluctant-volunteer', text: 'Reluctant Volunteer', color: '#8B4513', rarity: 'uncommon', weight: 8 },
          { id: 'reaped-first', text: 'Reaped - First Time', color: '#4682B4', rarity: 'common', weight: 40 },
          { id: 'reaped-multiple', text: 'Reaped - Multiple Entries', color: '#8B0000', rarity: 'common', weight: 7 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
      // Conditional logic for Career volunteers
      branches: [
        createBranch('career-training', [
          BranchingConditions.oneOf('district', ['district-1', 'district-2', 'district-4']),
          BranchingConditions.equals('tribute-status', 'career-volunteer')
        ])
      ],
      defaultNextStep: 'training-score',
    },

    // Wheel 3: Training Score
    {
      id: 'training-score', 
      title: 'Your Pre-Games Training Score',
      description: 'Gamemaker assessment determines sponsor attention and target level',
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
        theme: 'hunger-games',
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
        theme: 'hunger-games',
      },
      defaultNextStep: 'alliance-strategy',
    },

    // Wheel 5: Alliance Strategy
    {
      id: 'alliance-strategy',
      title: 'Your Alliance Strategy',
      description: 'Who you trust determines your mid-game survival',
      wheelConfig: {
        segments: [
          { id: 'career-pack', text: 'Join Career Pack', color: '#B8860B', rarity: 'common', weight: 25 },
          { id: 'district-alliance', text: 'Form District Alliance', color: '#4682B4', rarity: 'uncommon', weight: 15 },
          { id: 'unexpected-alliance', text: 'Unexpected Alliance', color: '#9370DB', rarity: 'common', weight: 20 },
          { id: 'protect-younger', text: 'Protect Younger Tribute', color: '#FFB6C1', rarity: 'uncommon', weight: 10 },
          { id: 'solo-survivor', text: 'Solo Survivor', color: '#2F4F2F', rarity: 'common', weight: 20 },
          { id: 'secret-romance', text: 'Secret Romance', color: '#FF69B4', rarity: 'rare', weight: 8 },
          { id: 'betrayal-plot', text: 'Betrayal Plot', color: '#8B0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
      defaultNextStep: 'cornucopia-bloodbath',
    },

    // Wheel 6: Cornucopia Bloodbath (BINARY)
    {
      id: 'cornucopia-bloodbath',
      title: 'Cornucopia Bloodbath',
      description: 'The 60-second massacre that claims half the tributes',
      wheelConfig: {
        segments: [
          { id: 'survive-bloodbath', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 75 },
          { id: 'die-bloodbath', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 25 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
      branches: [
        // Death branch - end sequence
        createBranch('bloodbath-death', [
          BranchingConditions.equals('cornucopia-bloodbath', 'die-bloodbath')
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
        theme: 'hunger-games',
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
        theme: 'hunger-games',
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
        theme: 'hunger-games',
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
        theme: 'hunger-games',
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
      description: 'The Capitol\'s twisted creatures claim another victim',
      wheelConfig: {
        segments: [
          { id: 'hallucination-death', text: 'Lost in Hallucinations', color: '#FF69B4', rarity: 'common', weight: 50 },
          { id: 'venom-death', text: 'Killed by Venom', color: '#228B22', rarity: 'common', weight: 30 },
          { id: 'swarm-death', text: 'Overwhelmed by Swarm', color: '#FFD700', rarity: 'common', weight: 20 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
    },

    // Wheel 9: Arena Disaster Survival (BINARY)
    {
      id: 'arena-disaster-survival',
      title: 'Arena Disaster Survival',
      description: 'Gamemaker manipulation: fire, floods, earthquakes, or toxic gas',
      wheelConfig: {
        segments: [
          { id: 'survive-disaster', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 65 },
          { id: 'die-disaster', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 35 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
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
      description: 'The Gamemakers\' cruelty claims another life',
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
        theme: 'hunger-games',
      },
    },

    // Wheel 10: Mutt Attack (BINARY)
    {
      id: 'mutt-attack',
      title: 'Mutt Attack',
      description: 'Capitol-engineered creatures designed to hunt and kill',
      wheelConfig: {
        segments: [
          { id: 'survive-mutts', text: 'SURVIVE', color: '#32CD32', rarity: 'common', weight: 60 },
          { id: 'die-mutts', text: 'DIE - STORY ENDS', color: '#8B0000', rarity: 'common', weight: 40 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
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
      title: 'Death by Muttations',
      description: 'The Capitol\'s deadliest creatures prove unstoppable',
      wheelConfig: {
        segments: [
          { id: 'wolf-mutts', text: 'Killed by Wolf Mutts', color: '#2F2F2F', rarity: 'common', weight: 40 },
          { id: 'tracker-mutts', text: 'Hunted by Tracker Mutts', color: '#8B0000', rarity: 'common', weight: 30 },
          { id: 'snake-mutts', text: 'Poisoned by Snake Mutts', color: '#228B22', rarity: 'common', weight: 30 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
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
        theme: 'hunger-games',
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
        theme: 'hunger-games',
      },
    },

    // Wheel 12: Final Showdown (VICTORY or death)
    {
      id: 'final-showdown',
      title: 'Final Showdown', 
      description: 'Last 2-3 tributes remaining - victory or death',
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
        theme: 'hunger-games',
      },
      defaultNextStep: 'rebellion-role',
    },

    // Wheel 13: Rebellion Role (final wheel for survivors)
    {
      id: 'rebellion-role',
      title: 'Your Rebellion Role',
      description: 'Your part in overthrowing the Capitol determines Panem\'s future',
      wheelConfig: {
        segments: [
          { id: 'the-mockingjay', text: 'The Mockingjay', color: '#FFD700', rarity: 'legendary', weight: 25 },
          { id: 'underground-coordinator', text: 'Underground Coordinator', color: '#2F4F2F', rarity: 'rare', weight: 20 },
          { id: 'district-liberator', text: 'District Liberator', color: '#228B22', rarity: 'rare', weight: 18 },
          { id: 'mentor-rebel', text: 'Mentor Rebel', color: '#4682B4', rarity: 'uncommon', weight: 15 },
          { id: 'capitol-infiltrator', text: 'Capitol Infiltrator', color: '#800080', rarity: 'rare', weight: 12 },
          { id: 'propaganda-star', text: 'Propaganda Star', color: '#FF6347', rarity: 'uncommon', weight: 8 },
          { id: 'presidential-assassin', text: 'Presidential Assassin', color: '#8B0000', rarity: 'legendary', weight: 2 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'hunger-games',
      },
      // No defaultNextStep - this is the final wheel
    },
  ],
  
  narrativeTemplate: "You were a tribute from {district} who entered the Games as a {tribute-status}, earning a training score of {training-score} in the {arena-environment} arena. Following a {alliance-strategy} strategy, you survived the bloodbath and fought through every deadly challenge the Capitol threw at you. Your {final-showdown} led to your role as {rebellion-role} in the revolution that would ultimately bring down President Snow's regime.",
  
  narrativeTemplates: {
    // Death storylines
    'bloodbath-victim': "💀 THE BLOODBATH VICTIM 💀\n\nYou were a {tribute-status} from {district} with a training score of {training-score}. Your journey ended in the first 60 seconds of the Games - {bloodbath-death}. But even in death, your sacrifice became part of the fire that would eventually burn down the Capitol. Your district remembers you as a hero who faced impossible odds with courage.",
    
    'exposure-victim': "❄️ CLAIMED BY THE ELEMENTS ❄️\n\nA {tribute-status} from {district}, you survived the bloodbath only to fall to the {arena-environment}'s harsh conditions. You {exposure-death}, but your determination to survive inspired others. Your family back home knows you fought until your last breath, and your memory fuels the growing rebellion.",
    
    'tracker-victim': "🐝 FALLEN TO THE CAPITOL'S CREATURES 🐝\n\nFrom {district} with a score of {training-score}, you made it through multiple Arena challenges before encountering the Capitol's deadliest trap. You {tracker-death} in the forest, but your survival skills kept you alive longer than most. The rebellion will remember how the Capitol's twisted science claimed one of their best.",
    
    'disaster-victim': "🌋 GAMEMAKER MANIPULATION VICTIM 🌋\n\nA brave {tribute-status} from {district}, you proved your worth by surviving the bloodbath and early challenges. When the Gamemakers intervened, you {disaster-death}, showing the Capitol's true cruelty. Your death exposed their manipulation and became a rallying cry for the revolution.",
    
    'mutt-victim': "🐺 KILLED BY CAPITOL MONSTERS 🐺\n\nYou made it further than most - a {tribute-status} from {district} who survived every human threat in the Arena. But the Capitol's final weapons proved too much, and you were {mutt-death}. Your courage in facing these abominations showed Panem what they were truly fighting against.",
    
    'betrayal-victim': "💔 BETRAYED IN THE FINAL MOMENTS 💔\n\nA {tribute-status} from {district}, you survived every Arena trap through your {alliance-strategy} strategy. In the end, you were {betrayal-death}, proving how the Capitol corrupts everything it touches. Your loyalty and sacrifice became the foundation for the rebellion's unity.",
    
    // Victory storylines  
    'brutal-survivor': "⚔️ THE BRUTAL SURVIVOR ⚔️\n\nFrom {district} with a training score of {training-score}, you fought through every death trap with ruthless determination. Your {brutal-victory} came at a terrible cost - the lives you took haunt your dreams. But as {rebellion-role}, you channeled that pain into the fire that burned down Snow's empire. The Games made you a killer; the rebellion made you a liberator.",
    
    'strategic-mastermind': "🧠 THE STRATEGIC MASTERMIND 🧠\n\nA brilliant {tribute-status} from {district}, you proved that mind conquers muscle. Through careful planning and your {strategic-victory}, you outmaneuvered every threat in the {arena-environment}. As {rebellion-role}, your tactical genius became the backbone of the revolution's success.",
    
    'unlikely-hero': "🏹 THE UNLIKELY HERO 🏹\n\nYou were just a {tribute-status} from {district} - no one expected you to survive. But through your {sacrifice-victory} and pure determination, you became something more. As {rebellion-role}, you proved that heroes aren't born in Career districts - they're forged in the fires of impossible odds.",
    
    'star-crossed': "💕 THE STAR-CROSSED SURVIVORS 💕\n\nTwo hearts from {district} who found love in the darkest place. Your {joint-victory} gave Panem something the Capitol couldn't destroy - hope. Together as {rebellion-role}, you became the symbol that love conquers even the cruelest tyranny.",
    
    'mockingjay-perfect': "🔥 THE PERFECT MOCKINGJAY 🔥\n\nFrom the coal-stained district of {district}, you volunteered to save someone you loved and scored an impossible {training-score}. Your {joint-victory} after exploiting the Gamemakers' rules broke their system entirely. As {the-mockingjay}, you became the symbol that ignited the revolution and personally ensured President Snow's downfall. You are the girl on fire who burned down an empire.",
    
    'default': "You were a {tribute-status} from {district} who survived the Games and joined the rebellion as {rebellion-role}."
  }
};

// Export all themes
export const themes: SequenceTheme[] = [
  harryPotterTheme,
  hungerGamesTheme,
];

export const getThemeById = (id: string): SequenceTheme | undefined => {
  return themes.find(theme => theme.id === id);
};