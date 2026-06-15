import { LevelConfig, ShopItem } from '../types';

export const LEVEL_THEMES: Record<string, { name: string; skyColor: string; roadColor: string; laneColor: string; sideColor: string; ambientColor: string }> = {
  sunny_highway: {
    name: 'Sunny Highway',
    skyColor: 'linear-gradient(to bottom, #38bdf8, #bae6fd)',
    roadColor: '#4b5563',
    laneColor: '#facc15',
    sideColor: '#15803d', // Grass green
    ambientColor: '#22c55e',
  },
  neon_cyber: {
    name: 'Cyber Neon Grid',
    skyColor: 'linear-gradient(to bottom, #1e1b4b, #311042)',
    roadColor: '#111827',
    laneColor: '#f43f5e', // Hot pink
    sideColor: '#090d16', // Cyber dark
    ambientColor: '#06b6d4', // Cyan
  },
  sunset_canyon: {
    name: 'Sunset Canyon',
    skyColor: 'linear-gradient(to bottom, #f97316, #fca5a5)',
    roadColor: '#57534e',
    laneColor: '#fafaf9',
    sideColor: '#b45309', // Canyon sand
    ambientColor: '#ea580c',
  },
  glacier_nordic: {
    name: 'Snowy Forest',
    skyColor: 'linear-gradient(to bottom, #cbd5e1, #f1f5f9)',
    roadColor: '#334155',
    laneColor: '#94a3b8',
    sideColor: '#e2e8f0', // Snow white
    ambientColor: '#0ea5e9',
  }
};

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // --- VEHICLES ---
  {
    id: 'cycle_classic',
    name: 'Standard Bicycle',
    cost: 0,
    category: 'vehicle',
    description: 'A classic reliable cycle. Sleek and perfect for daily commutes.',
    iconName: 'Bike',
    specs: { speedBoost: 0, label: 'Standard Speed' }
  },
  {
    id: 'cycle_bmx',
    name: 'Turbo BMX',
    cost: 350,
    category: 'vehicle',
    description: 'Highly agile street BMX with custom neon rims. Increased drift control.',
    iconName: 'ZapColor',
    specs: { speedBoost: 15, label: '+15% Max Speed' }
  },
  {
    id: 'cycle_electric',
    name: 'Electric Hyper-Bike',
    cost: 800,
    category: 'vehicle',
    description: 'Eco-friendly speed beast powered by solid-state lithium cells.',
    iconName: 'BatteryCharging',
    specs: { speedBoost: 30, label: '+30% Max Speed' }
  },
  {
    id: 'horse_stallion',
    name: 'Wild Stallion',
    cost: 1600,
    category: 'vehicle',
    description: 'Ride a wild, majestic stallion! Moves gracefully with unique horse sounds.',
    iconName: 'Sparkles',
    specs: { speedBoost: 45, label: 'Horse Mode! +45% Speed' }
  },
  {
    id: 'motorbike_retro',
    name: 'Vanguard Motorbike',
    cost: 3000,
    category: 'vehicle',
    description: 'Kick-start a powerful twin-cylinder engine. Supreme highway performance.',
    iconName: 'Activity',
    specs: { speedBoost: 60, label: 'Motorbike! +60% Speed' }
  },
  {
    id: 'car_supercar',
    name: 'Hyper Sports Car',
    cost: 6500,
    category: 'vehicle',
    description: 'Ultimate street cruiser! Extreme speed, armored chassis survives 1 extra crash.',
    iconName: 'Car',
    specs: { speedBoost: 80, armored: true, label: 'Supercar! +80% Speed & Barrier' }
  },

  // --- OUTFITS ---
  {
    id: 'outfit_casual',
    name: 'Casual Hoodie',
    cost: 0,
    category: 'outfit',
    description: 'Comfy everyday attire for casual neighborhood cycling.',
    iconName: 'User',
    specs: { label: 'Default Look' }
  },
  {
    id: 'outfit_retro',
    name: 'Aero Sports Suit',
    cost: 250,
    category: 'outfit',
    description: 'Sleek aerodynamic racer jumpsuit. Lightweight and flexible.',
    iconName: 'Shirt',
    specs: { label: 'Aerodynamic Vibe' }
  },
  {
    id: 'outfit_neon',
    name: 'Cyber Ranger Outfit',
    cost: 600,
    category: 'outfit',
    description: 'High-visibility bio-luminescent fiber suit with futuristic visors.',
    iconName: 'Eye',
    specs: { label: 'Luminous Glow' }
  },
  {
    id: 'outfit_royal',
    name: 'Royal Gold Uniform',
    cost: 1500,
    category: 'outfit',
    description: 'Woven with threads of pure level-capped gold. Utmost luxury.',
    iconName: 'Crown',
    specs: { label: 'Prestigious Rich Look' }
  },

  // --- WEAPONS ---
  {
    id: 'weapon_bow',
    name: 'Hunter Recurve Bow',
    cost: 500,
    category: 'weapon',
    description: 'Enables shooting standard/energy arrows to blast obstacles ahead! (Press SPACE/TAP)',
    iconName: 'Flame',
    specs: { label: 'Unlocks Ranged Arrow Attacks' }
  },

  // --- BACKGROUND THEMES ---
  {
    id: 'bg_sunny',
    name: 'Sunny Highway Road',
    cost: 0,
    category: 'background',
    description: 'Bright high-noon skies over lush green outer fields.',
    iconName: 'Sun',
    specs: { label: 'Included Theme' }
  },
  {
    id: 'bg_cyber',
    name: 'Synths Cyber Grid',
    cost: 200,
    category: 'background',
    description: 'A beautiful retro-futuristic purple sky with blue glowing lanes.',
    iconName: 'Zap',
    specs: { label: 'Cyberpunk Theme' }
  },
  {
    id: 'bg_sunset',
    name: 'Sunset Red Canyon',
    cost: 400,
    category: 'background',
    description: 'Calm golden hour racing beside majestic orange rock plateaus.',
    iconName: 'Sunset',
    specs: { label: 'Sunset Theme' }
  },
  {
    id: 'bg_nordic',
    name: 'Alpine Snowy Forest',
    cost: 750,
    category: 'background',
    description: 'Blinded in high-contrast snow-capped pine trees and icy asphalt.',
    iconName: 'CloudSnow',
    specs: { label: 'Icy Wilderness' }
  },
];

// Generate 20 Level configs dynamically for maximum robustness and escalation challenge!
export const GAME_LEVELS: LevelConfig[] = Array.from({ length: 20 }, (_, index) => {
  const levelNumber = index + 1;
  const targetDistance = 250 + levelNumber * 100; // 350m to 2250m
  const baseSpeedMultiplier = 1 + levelNumber * 0.08; // gradual speed scaling
  const spawnRateMultiplier = 1 + levelNumber * 0.06; // more vehicles
  const oppositeSpawnChance = Math.min(0.1 + (levelNumber * 0.04), 0.65); // up to 65% chance of cars coming against traffic
  const rewardPoints = 150 + levelNumber * 50; // Points scaling from 200 to 1150 standard points

  // Rotate between background settings
  let backgroundId = 'bg_sunny';
  if (levelNumber > 15) {
    backgroundId = 'bg_nordic';
  } else if (levelNumber > 10) {
    backgroundId = 'bg_sunset';
  } else if (levelNumber > 5) {
    backgroundId = 'bg_cyber';
  }

  // Titles
  const titles = [
    'First Ride Out',
    'Suburban Grid',
    'Neon Dusk Glide',
    'Overtake Master',
    'Midnight Rush',
    'Canyon Highway Cruise',
    'Opposite Traffic Chase',
    'Speed Trap Ascent',
    'Sunset Driftway',
    'Hyper City Freeway',
    'White-out Wilderness',
    'Bow Hunter Debut',
    'Gridlock Survival',
    'Brakeless Descent',
    'Adrenaline Overpass',
    'Northern Lights Drift',
    'Car Apocalypse',
    'Ghost Rider Straight',
    'Relentless Interstate',
    'Apex Highway Legend'
  ];

  const title = titles[index] || `Highway Sector ${levelNumber}`;

  return {
    levelNumber,
    title,
    targetDistance,
    baseSpeedMultiplier,
    spawnRateMultiplier,
    oppositeSpawnChance,
    rewardPoints,
    backgroundId
  };
});
