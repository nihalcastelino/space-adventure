export const CAMPAIGN_LEVELS = [
    // SECTOR 1: THE SOLAR SYSTEM (Tutorial & Basics)
    {
        id: 'level_1',
        sector: 'solar_system',
        name: 'Lift Off',
        description: 'Launch your journey! Reach the moon.',
        difficulty: 'easy',
        boardSize: 50,
        winCondition: 'reach_target',
        targetPosition: 50,
        background: 'earth_launchpad',
        hazards: [], // No aliens
        mechanics: ['simple_ladders'],
        rewards: { coins: 50, xp: 100 }
    },
    {
        id: 'level_2',
        sector: 'solar_system',
        name: 'Moon Base',
        description: 'Low gravity makes you jump higher!',
        difficulty: 'easy',
        boardSize: 100,
        winCondition: 'reach_target',
        targetPosition: 100,
        background: 'moon_surface',
        hazards: ['aliens_sparse'],
        mechanics: ['low_gravity'], // +1 to all rolls
        rewards: { coins: 75, xp: 150 }
    },
    {
        id: 'level_3',
        sector: 'solar_system',
        name: 'Mars Rover',
        description: 'Collect samples while avoiding dust storms.',
        difficulty: 'normal',
        boardSize: 100,
        winCondition: 'collect_items',
        requiredItems: 3, // Collect 3 samples
        background: 'mars_surface',
        hazards: ['aliens_normal', 'dust_storms'],
        mechanics: ['item_collection'],
        rewards: { coins: 100, xp: 200 }
    },

    // SECTOR 2: THE ASTEROID BELT (Hazards & Tactics)
    {
        id: 'level_4',
        sector: 'asteroid_belt',
        name: 'Meteor Shower',
        description: 'Dodge incoming meteors! Survival mode.',
        difficulty: 'normal',
        boardSize: 100,
        winCondition: 'survive_turns',
        maxTurns: 20,
        background: 'asteroid_field',
        hazards: ['meteors'], // Random tile strikes
        mechanics: ['survival'],
        rewards: { coins: 150, xp: 250 }
    },
    {
        id: 'level_5',
        sector: 'asteroid_belt',
        name: 'Gem Hunt',
        description: 'Tactical warfare! Use gems to disrupt opponents.',
        difficulty: 'hard',
        boardSize: 100,
        winCondition: 'reach_target',
        targetPosition: 100,
        background: 'crystal_caves',
        hazards: ['aliens_dense'],
        mechanics: ['tactical_gems'], // Gems spawn on board
        rewards: { coins: 200, xp: 300 }
    },
    {
        id: 'level_6',
        sector: 'asteroid_belt',
        name: 'Snake Pit',
        description: 'Snakes everywhere! Watch your step.',
        difficulty: 'hard',
        boardSize: 100,
        winCondition: 'reach_target',
        targetPosition: 100,
        background: 'alien_hive',
        hazards: ['aliens_extreme'], // Double aliens
        mechanics: ['snake_pit'],
        rewards: { coins: 250, xp: 350 }
    },

    // SECTOR 3: DEEP SPACE (Advanced)
    {
        id: 'level_7',
        sector: 'deep_space',
        name: 'Black Hole Horizon',
        description: 'Don\'t get pulled in! Gravity is unstable.',
        difficulty: 'extreme',
        boardSize: 100,
        winCondition: 'reach_target',
        targetPosition: 100,
        background: 'black_hole',
        hazards: ['gravity_well'], // Pulls players back
        mechanics: ['gravity_pull'],
        rewards: { coins: 400, xp: 500 }
    },
    {
        id: 'level_8',
        sector: 'deep_space',
        name: 'The Void',
        description: 'Navigate in the dark. Fog of War active.',
        difficulty: 'extreme',
        boardSize: 100,
        winCondition: 'reach_target',
        targetPosition: 100,
        background: 'deep_space',
        hazards: ['aliens_hidden'],
        mechanics: ['fog_of_war'], // Limited visibility
        rewards: { coins: 500, xp: 600 }
    }
];

export const SECTORS = {
    solar_system: { name: 'Solar System', requiredStars: 0 },
    asteroid_belt: { name: 'Asteroid Belt', requiredStars: 3 },
    deep_space: { name: 'Deep Space', requiredStars: 6 }
};
