import { SequenceTheme } from '@/types/sequence';
import { WheelConfig } from '@/types/wheel';

// Harry Potter Theme Data
const harryPotterTheme: SequenceTheme = {
  id: 'harry-potter',
  name: 'Harry Potter Character Creator',
  description: 'Discover your magical identity through the halls of Hogwarts',
  color: '#8B4513',
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
    },
    {
      id: 'wand',
      title: 'Your Wand',
      description: 'The wand chooses the wizard, remember...',
      wheelConfig: {
        segments: [
          { id: 'holly-phoenix', text: 'Holly & Phoenix', color: '#8B4513', rarity: 'legendary', weight: 8 },
          { id: 'oak-unicorn', text: 'Oak & Unicorn', color: '#D2691E', rarity: 'common', weight: 25 },
          { id: 'willow-dragon', text: 'Willow & Dragon', color: '#A0522D', rarity: 'rare', weight: 12 },
          { id: 'maple-phoenix', text: 'Maple & Phoenix', color: '#CD853F', rarity: 'uncommon', weight: 20 },
          { id: 'ash-unicorn', text: 'Ash & Unicorn', color: '#DEB887', rarity: 'common', weight: 25 },
          { id: 'cherry-dragon', text: 'Cherry & Dragon', color: '#F4A460', rarity: 'rare', weight: 10 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
    },
    {
      id: 'pet',
      title: 'Your Pet',
      description: 'Choose your magical companion',
      wheelConfig: {
        segments: [
          { id: 'owl', text: 'Wise Owl', color: '#8B7355', rarity: 'common', weight: 30 },
          { id: 'cat', text: 'Clever Cat', color: '#696969', rarity: 'common', weight: 30 },
          { id: 'toad', text: 'Lucky Toad', color: '#6B8E23', rarity: 'uncommon', weight: 20 },
          { id: 'rat', text: 'Loyal Rat', color: '#A0522D', rarity: 'uncommon', weight: 15 },
          { id: 'snake', text: 'Cunning Snake', color: '#2F4F2F', rarity: 'rare', weight: 5 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
    },
    {
      id: 'spell',
      title: 'Your Favorite Spell',
      description: 'What magic flows through you most naturally?',
      wheelConfig: {
        segments: [
          { id: 'expelliarmus', text: 'Expelliarmus', color: '#FF6347', rarity: 'uncommon', weight: 18 },
          { id: 'lumos', text: 'Lumos', color: '#FFD700', rarity: 'common', weight: 20 },
          { id: 'alohomora', text: 'Alohomora', color: '#4169E1', rarity: 'common', weight: 18 },
          { id: 'expecto-patronum', text: 'Expecto Patronum', color: '#E6E6FA', rarity: 'legendary', weight: 5 },
          { id: 'stupefy', text: 'Stupefy', color: '#DC143C', rarity: 'uncommon', weight: 15 },
          { id: 'accio', text: 'Accio', color: '#32CD32', rarity: 'common', weight: 16 },
          { id: 'protego', text: 'Protego', color: '#4682B4', rarity: 'uncommon', weight: 12 },
          { id: 'wingardium-leviosa', text: 'Wingardium Leviosa', color: '#DDA0DD', rarity: 'common', weight: 16 },
        ],
        size: 400,
        spinDuration: 3000,
        friction: 0.02,
        theme: 'harry-potter',
      },
    },
  ],
  narrativeTemplate: "You are a {origin} wizard sorted into {house}, wielding a {wand} wand with your loyal {pet} by your side. Your signature spell is {spell}.",
};

// Export all themes
export const themes: SequenceTheme[] = [
  harryPotterTheme,
];

export const getThemeById = (id: string): SequenceTheme | undefined => {
  return themes.find(theme => theme.id === id);
};