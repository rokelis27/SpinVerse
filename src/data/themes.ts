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

// Export all themes
export const themes: SequenceTheme[] = [
  harryPotterTheme,
];

export const getThemeById = (id: string): SequenceTheme | undefined => {
  return themes.find(theme => theme.id === id);
};