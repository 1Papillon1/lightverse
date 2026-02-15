<?php

// config/achievements.php

return [
    // ============================================
    // 🌟 EXPLORATION (Low Light - Basic Actions)
    // ============================================
    'first_login' => [
        'name' => 'First Light',
        'category' => 'exploration',
        'light' => 7,
        'data' => [
            'icon' => '🌟',
            'rarity' => 'common',
            'description' => 'Welcome to the Lightverse'
        ]
    ],

    'visit_profile' => [
        'name' => 'Know Thyself',
        'category' => 'exploration',
        'light' => 5,
        'data' => [
            'icon' => '👤',
            'rarity' => 'common',
            'description' => 'Visited your profile'
        ]
    ],

    'visit_roadmap' => [
        'name' => 'Future Gazer',
        'category' => 'exploration',
        'light' => 6,
        'data' => [
            'icon' => '🗺️',
            'rarity' => 'common',
            'description' => 'Explored the roadmap'
        ]
    ],

    'visit_community' => [
        'name' => 'Social Explorer',
        'category' => 'exploration',
        'light' => 8,
        'data' => [
            'icon' => '🌐',
            'rarity' => 'common',
            'description' => 'Discovered the community'
        ]
    ],

    'visit_knowledge' => [
        'name' => 'Curious Mind',
        'category' => 'exploration',
        'light' => 6,
        'data' => [
            'icon' => '📚',
            'rarity' => 'common',
            'description' => 'Visited the Knowledge galaxy'
        ]
    ],

    // ============================================
    // 📚 LEARNING (Medium Light - Effort Required)
    // ============================================
    'complete_tutorial' => [
        'name' => 'Apprentice',
        'category' => 'learning',
        'light' => 18,
        'data' => [
            'icon' => '📖',
            'rarity' => 'common',
            'description' => 'Completed the tutorial'
        ]
    ],

    'read_docs' => [
        'name' => 'Knowledge Seeker',
        'category' => 'learning',
        'light' => 12,
        'data' => [
            'icon' => '📚',
            'rarity' => 'common',
            'description' => 'Read documentation'
        ]
    ],

    'complete_beginner_path' => [
        'name' => 'Foundation Laid',
        'category' => 'learning',
        'light' => 23,
        'data' => [
            'icon' => '🎓',
            'rarity' => 'uncommon',
            'description' => 'Completed beginner learning path'
        ]
    ],

    // ============================================
    // 🛠️ CREATION (Higher Light - Real Contribution)
    // ============================================
    'complete_profile' => [
        'name' => 'Identity Forged',
        'category' => 'creation',
        'light' => 15,
        'data' => [
            'icon' => '✨',
            'rarity' => 'uncommon',
            'description' => 'Completed your profile'
        ]
    ],

    'customize_avatar' => [
        'name' => 'Visual Identity',
        'category' => 'creation',
        'light' => 11,
        'data' => [
            'icon' => '🎨',
            'rarity' => 'uncommon',
            'description' => 'Customized your avatar'
        ]
    ],

    'write_first_post' => [
        'name' => 'Voice Heard',
        'category' => 'creation',
        'light' => 19,
        'data' => [
            'icon' => '📝',
            'rarity' => 'uncommon',
            'description' => 'Published your first post'
        ]
    ],

    // ============================================
    // 🤝 PARTICIPATION (Highest Light - Community Value)
    // ============================================
    'join_gathering' => [
        'name' => 'Community Member',
        'category' => 'participation',
        'light' => 14,
        'data' => [
            'icon' => '🤝',
            'rarity' => 'uncommon',
            'description' => 'Joined a community gathering'
        ]
    ],

    'help_another_user' => [
        'name' => 'Guiding Light',
        'category' => 'participation',
        'light' => 27,
        'data' => [
            'icon' => '💡',
            'rarity' => 'rare',
            'description' => 'Helped another user (verified by recipient)'
        ]
    ],

    'onboard_new_user' => [
        'name' => 'Pathfinder',
        'category' => 'participation',
        'light' => 34,
        'data' => [
            'icon' => '🌟',
            'rarity' => 'rare',
            'description' => 'Onboarded a new user'
        ]
    ],

    'contribute_to_project' => [
        'name' => 'Builder',
        'category' => 'participation',
        'light' => 41,
        'data' => [
            'icon' => '🔨',
            'rarity' => 'epic',
            'description' => 'Contributed to a community project'
        ]
    ],

    // ============================================
    // 📈 GROWTH MILESTONES (Progressive Rewards)
    // ============================================
    'reach_50_light' => [
        'name' => 'Spark',
        'category' => 'growth',
        'light' => 3,
        'data' => [
            'icon' => '⚡',
            'rarity' => 'common',
            'description' => 'Reached 50 total Light'
        ]
    ],

    'reach_100_light' => [
        'name' => 'Ember',
        'category' => 'growth',
        'light' => 7,
        'data' => [
            'icon' => '🔥',
            'rarity' => 'common',
            'description' => 'Reached 100 total Light'
        ]
    ],

    'reach_250_light' => [
        'name' => 'Glowing',
        'category' => 'growth',
        'light' => 13,
        'data' => [
            'icon' => '🌟',
            'rarity' => 'uncommon',
            'description' => 'Reached 250 total Light'
        ]
    ],

    'reach_500_light' => [
        'name' => 'Luminous',
        'category' => 'growth',
        'light' => 21,
        'data' => [
            'icon' => '✨',
            'rarity' => 'rare',
            'description' => 'Reached 500 total Light'
        ]
    ],

    'reach_1000_light' => [
        'name' => 'Radiant',
        'category' => 'growth',
        'light' => 37,
        'data' => [
            'icon' => '💫',
            'rarity' => 'epic',
            'description' => 'Reached 1,000 total Light'
        ]
    ],

    'reach_2500_light' => [
        'name' => 'Brilliant',
        'category' => 'growth',
        'light' => 59,
        'data' => [
            'icon' => '🌠',
            'rarity' => 'legendary',
            'description' => 'Reached 2,500 total Light'
        ]
    ],

    // ============================================
    // 🎯 STREAKS & CONSISTENCY
    // ============================================
    '3_day_streak' => [
        'name' => 'Building Habit',
        'category' => 'milestone',
        'light' => 9,
        'data' => [
            'icon' => '📅',
            'rarity' => 'common',
            'description' => '3-day login streak'
        ]
    ],

    '7_day_streak' => [
        'name' => 'Consistent',
        'category' => 'milestone',
        'light' => 16,
        'data' => [
            'icon' => '🔥',
            'rarity' => 'uncommon',
            'description' => '7-day login streak'
        ]
    ],

    '30_day_streak' => [
        'name' => 'Dedicated',
        'category' => 'milestone',
        'light' => 43,
        'data' => [
            'icon' => '🌟',
            'rarity' => 'rare',
            'description' => '30-day login streak'
        ]
    ],

    '100_day_streak' => [
        'name' => 'Eternal Flame',
        'category' => 'milestone',
        'light' => 87,
        'data' => [
            'icon' => '🌠',
            'rarity' => 'legendary',
            'description' => '100-day login streak'
        ]
    ],

    // ============================================
    // 🏆 SPECIAL (Very High Light - Rare Events)
    // ============================================
    'mentor_verified' => [
        'name' => 'Mentor',
        'category' => 'special',
        'light' => 62,
        'data' => [
            'icon' => '👨‍🏫',
            'rarity' => 'epic',
            'description' => 'Became a verified mentor'
        ]
    ],

    'beta_tester' => [
        'name' => 'Pioneer',
        'category' => 'special',
        'light' => 31,
        'data' => [
            'icon' => '🚀',
            'rarity' => 'rare',
            'description' => 'Early beta tester'
        ]
    ],

    'report_critical_bug' => [
        'name' => 'System Guardian',
        'category' => 'special',
        'light' => 48,
        'data' => [
            'icon' => '🛡️',
            'rarity' => 'epic',
            'description' => 'Reported critical bug (verified)'
        ]
    ],
];