// config/trials.js
// Each topic maps to the Light Codex node that should be visited first.
// light: Active Light awarded on passing (>= passMark correct)
// passMark: minimum correct answers to earn Light

export const trialsConfig = {

  'what-is-light': {
    topic: 'What is Light?',
    sourceNode: '/galaxy/lumina-archives/light-codex/what-is-light',
    light: 12,
    passMark: 3,
    questions: [
      {
        id: 'wil-1',
        text: 'Light in Lightverse is best described as:',
        options: [
          'A tradable token you can sell on exchanges',
          'A contribution-based reputation metric',
          'A social follower count',
          'An in-game currency for purchases',
        ],
        correct: 1,
      },
      {
        id: 'wil-2',
        text: 'Which of these correctly describes Active Light?',
        options: [
          'It is permanent and never decays',
          'It can be transferred to other users',
          'It expires after 30 days of inactivity',
          'It is awarded only by admins',
        ],
        correct: 2,
      },
      {
        id: 'wil-3',
        text: 'Core Light is different from Active Light because:',
        options: [
          'Core Light decays faster',
          'Core Light is permanent structural contribution',
          'Core Light is earned by visiting pages',
          'Core Light resets every month',
        ],
        correct: 1,
      },
      {
        id: 'wil-4',
        text: 'What is the formula for a user\'s total Light?',
        options: [
          'Active + Stable',
          'Core × Active',
          'Core + Stable + Active',
          'Core + Active',
        ],
        correct: 2,
      },
      {
        id: 'wil-5',
        text: 'Light is described as "digital physics" because:',
        options: [
          'It powers the 3D rendering engine',
          'It behaves like a natural force — earned, not bought',
          'It follows the laws of thermodynamics exactly',
          'It is measured in joules',
        ],
        correct: 1,
      },
    ],
  },

  'earning': {
    topic: 'Earning Light',
    sourceNode: '/galaxy/lumina-archives/light-codex/earning',
    light: 14,
    passMark: 3,
    questions: [
      {
        id: 'el-1',
        text: 'Which action awards Core Light automatically?',
        options: [
          'Completing a tutorial',
          'Visiting your profile',
          'Registering (Genesis Spark)',
          'Unlocking 10 achievements',
        ],
        correct: 2,
      },
      {
        id: 'el-2',
        text: 'Achievement Light is awarded as:',
        options: [
          'Stable Light with no expiry',
          'Core Light requiring admin approval',
          'Active Light that expires in 30 days',
          'Governance tokens',
        ],
        correct: 2,
      },
      {
        id: 'el-3',
        text: 'Why does Active Light decay?',
        options: [
          'To punish inactive users',
          'To create entropy and reward consistent contribution',
          'Because the system has a bug',
          'To reduce the total supply',
        ],
        correct: 1,
      },
      {
        id: 'el-4',
        text: 'Stable Light (in v0.1) is:',
        options: [
          'Earned through streaks automatically',
          'Not yet implemented — planned for a future phase',
          'The same as Core Light',
          'Awarded by peer validation',
        ],
        correct: 1,
      },
      {
        id: 'el-5',
        text: 'What happens on Day 31 after earning achievement Light on Day 1?',
        options: [
          'The Light converts to Stable Light',
          'Nothing — it is permanent',
          'The Active Light from Day 1 expires',
          'It doubles in value',
        ],
        correct: 2,
      },
    ],
  },

  'economy': {
    topic: 'Light Economy',
    sourceNode: '/galaxy/lumina-archives/light-codex/economy',
    light: 16,
    passMark: 3,
    questions: [
      {
        id: 'ec-1',
        text: 'System Core Light is calculated as:',
        options: [
          'The average of all user Light scores',
          'The sum of all user Core Light',
          'The highest individual user\'s Light',
          'A fixed value set by admins',
        ],
        correct: 1,
      },
      {
        id: 'ec-2',
        text: 'Why is Light stored in a ledger (transactions table) rather than a single column?',
        options: [
          'It is faster to query',
          'It provides an audit trail and prevents corruption',
          'It allows Light to be traded',
          'It is required by blockchain law',
        ],
        correct: 1,
      },
      {
        id: 'ec-3',
        text: 'System milestones in Lightverse trigger:',
        options: [
          'Automatic payouts to all users',
          'Structural upgrades to the universe after a stabilisation window',
          'A reset of all Active Light',
          'New token listings',
        ],
        correct: 1,
      },
      {
        id: 'ec-4',
        text: 'Light can NEVER be:',
        options: [
          'Earned through exploration',
          'Traded or transferred between users',
          'Displayed in the navigation',
          'Affected by inactivity',
        ],
        correct: 1,
      },
      {
        id: 'ec-5',
        text: 'The purpose of the stabilisation window after a system milestone is:',
        options: [
          'To let admins fix bugs',
          'To prevent the universe from evolving too quickly',
          'To give users time to earn more tokens',
          'To run the expiry command',
        ],
        correct: 1,
      },
    ],
  },

};

// Signal Scan daily questions — rotate through these, 3 per day
// These are broader, cross-topic pulse questions
export const signalScanQuestions = [
  {
    id: 'ss-1',
    text: 'Which type of Light is awarded when you register?',
    options: ['Active', 'Stable', 'Core', 'None'],
    correct: 2,
  },
  {
    id: 'ss-2',
    text: 'How long does Active Light last before expiring?',
    options: ['7 days', '14 days', '30 days', 'Forever'],
    correct: 2,
  },
  {
    id: 'ss-3',
    text: 'What is the Lightverse equivalent of a daily visit reward?',
    options: ['A governance vote', 'An Active Light achievement', 'A Core Light grant', 'Nothing — rewards are manual only'],
    correct: 1,
  },
  {
    id: 'ss-4',
    text: 'Which galaxy is focused on knowledge and archives?',
    options: ['Identity Nebula', 'Core Systems', 'Lumina Archives', 'The Forge'],
    correct: 2,
  },
  {
    id: 'ss-5',
    text: 'What does the Genesis Spark represent?',
    options: ['Your first Active Light achievement', '1 Core Light on registration — existence in the Verse', 'Your profile picture', 'The first system milestone'],
    correct: 1,
  },
  {
    id: 'ss-6',
    text: 'Why are Light amounts non-round numbers (e.g. +7, +18, +34)?',
    options: ['It\'s a calculation error', 'To feel organic and earned, not gamified', 'They are random', 'Round numbers are reserved for Core Light'],
    correct: 1,
  },
  {
    id: 'ss-7',
    text: 'Core Light differs from Active Light in that it:',
    options: ['Decays faster', 'Is never permanent', 'Is permanent and rare', 'Can be traded'],
    correct: 2,
  },
  {
    id: 'ss-8',
    text: 'The phrase "Light is digital physics" means:',
    options: ['It powers the 3D engine', 'It behaves like a natural force — earned, not bought', 'It follows Newton\'s laws', 'It is mined like crypto'],
    correct: 1,
  },
  {
    id: 'ss-9',
    text: 'System upgrades in Lightverse are triggered by:',
    options: ['Admin decisions only', 'Random events', 'System Core Light reaching milestone thresholds', 'User votes in real time'],
    correct: 2,
  },
  {
    id: 'ss-10',
    text: 'In the universe structure, what sits below a Star System?',
    options: ['A Galaxy', 'A Node (planet)', 'The Light Core', 'An achievement'],
    correct: 1,
  },
  {
    id: 'ss-11',
    text: 'Active Light can drop to zero. This is:',
    options: ['A bug to be fixed', 'Correct — it creates entropy and maintenance pressure', 'Only possible for banned users', 'Temporary — it always recovers'],
    correct: 1,
  },
  {
    id: 'ss-12',
    text: 'Stable Light in v0.1 is:',
    options: ['Fully implemented', 'Not yet active — planned for a later phase', 'The same as Core Light', 'Earned only through quizzes'],
    correct: 1,
  },
];