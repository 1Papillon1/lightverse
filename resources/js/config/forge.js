// resources/js/config/forge.js
// Light Generator configuration for The Forge galaxy

export const generatorConfig = {

  id: 'light-generator',
  name: 'Light Generator',
  description: 'A structure that concentrates raw contribution into a single burst of Light.',
  completionLight: 87, // Active Light awarded on full completion (non-round, feels earned)

  stages: [
    {
      id: 1,
      key: 'foundation',
      name: 'Foundation',
      lore: 'Before anything can be built, the schematics must be read. The archive holds what you need.',
      mechanic: 'gate', // requires visiting the manual node before unlocking
      gateNode: '/galaxy/lumina-archives/proving-grounds/the-codex', // or wherever manual node lives
      gateLabel: 'Read the Manual',
      gateNodeLabel: 'The Codex',
      durationHours: 2,
      completionLabel: 'Foundation set.',
    },
    {
      id: 2,
      key: 'core-ignition',
      name: 'Core Ignition',
      lore: 'The core requires direct energy input. No machine can do this part.',
      mechanic: 'charge', // spacebar mash mechanic
      targetFill: 100,       // percent to reach
      decayRate: 1.8,        // percent lost per second while not pressing
      chargeRate: 4.2,       // percent gained per keypress
      timeLimit: 30,         // seconds — if timer runs out without reaching 100%, fail
      completionLabel: 'Core ignited.',
    },
    {
      id: 3,
      key: 'calibration',
      name: 'Calibration',
      lore: 'The generator aligns itself to the frequency of the Verse. This cannot be rushed.',
      mechanic: 'timer',
      durationHours: 6,
      completionLabel: 'Calibration complete.',
    },
    {
      id: 4,
      key: 'resonance',
      name: 'Resonance',
      lore: 'Deep harmonic lock. The structure is becoming real.',
      mechanic: 'timer',
      durationHours: 8,
      completionLabel: 'Resonance achieved.',
    },
    {
      id: 5,
      key: 'completion',
      name: 'Final Convergence',
      lore: 'One last wait. Then the Light is yours.',
      mechanic: 'timer',
      durationHours: 4,
      completionLabel: 'Generator complete.',
    },
  ],

};

// Generator states (stored in DB / returned from backend as props)
// 'inactive'   — user has never started
// 'active'     — current stage timer is running
// 'waiting'    — stage timer finished, user must click to begin next stage
// 'charging'   — spacebar mechanic is in progress (client-side only, not persisted)
// 'complete'   — all stages done, Light awarded