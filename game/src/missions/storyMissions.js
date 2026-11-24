export const STORY_MISSIONS = [
  {
    id: 'm1_keys_to_coast',
    title: 'Keys to the Coast',
    district: 'Neon Promenade',
    reward: 5000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Welcome back to Solara, Mateo. First things first: find the cyan Super GT parked outside the Coral Palms, lose the patrol, and get it to the marina slip.',
    steps: [
      { type: 'goto', pos: [176, 0.1, -110], label: 'Steal the Super GT on Ocean Drive' },
      { type: 'wanted', level: 1, dialogue: 'SCPD cruiser spotted the hotwire! Shake the 1-star heat!' },
      { type: 'evade', dialogue: 'Heat is clear! Now park it inside the safehouse garage.' },
      { type: 'park', pos: [180, 0.1, 80], label: 'Marina Safehouse Garage' }
    ]
  },
  {
    id: 'm2_marina_repo',
    title: 'Marina Repo',
    district: 'Puerto Solara',
    reward: 8500,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Los Corales Cartel impounded Cruz’s custom muscle coupe at Pier 4. Infiltrate the container yard and repossess it.',
    steps: [
      { type: 'goto', pos: [-360, 0.1, 160], label: 'Infiltrate Pier 4 Container Yard' },
      { type: 'neutralize', count: 3, label: 'Neutralize Corales Guards' },
      { type: 'steal', pos: [-370, 0.1, 175], label: 'Hijack Cruz’s Muscle Coupe' },
      { type: 'deliver', pos: [-340, 0.1, -200], label: 'Deliver to Cruz Chop-Shop' }
    ]
  },
  {
    id: 'm3_neon_shakedown',
    title: 'Neon Shakedown',
    district: 'Neon Promenade',
    reward: 12000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Apex Security is shaking down our local marina informants. Hit all three collection spots on the promenade before their shift changes.',
    steps: [
      { type: 'goto', pos: [180, 0.1, -180], label: 'Intimidate Collector 1 (Coral Palms)' },
      { type: 'goto', pos: [180, 0.1, -40], label: 'Intimidate Collector 2 (Neon Surf)' },
      { type: 'goto', pos: [180, 0.1, 100], label: 'Intimidate Collector 3 (Solara Horizon)' }
    ]
  },
  {
    id: 'm4_causeway_heat',
    title: 'Causeway Heat',
    district: 'Coral Causeway',
    reward: 18000,
    introSpeaker: 'SCPD Dispatch',
    introDialogue: 'Attention all units: 3-Star pursuit authorized. Target vehicle is speeding towards Coral Causeway bridge!',
    steps: [
      { type: 'wanted', level: 3, dialogue: 'Elena: Mateo! SCPD has locked down the Causeway! Hit the nitro and break through!' },
      { type: 'goto', pos: [40, 3.8, 180], label: 'Break Causeway Police Roadblock' },
      { type: 'goto', pos: [20, 0.2, 320], label: 'Reach Outer Key Marina' }
    ]
  },
  {
    id: 'm5_dockside_ambush',
    title: 'Dockside Ambush',
    district: 'Cayo Industrial',
    reward: 25000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'It is a setup! Corales enforcers have the scrapyard surrounded. Grab the Tactical Shotgun and fight through their waves!',
    steps: [
      { type: 'goto', pos: [-420, 0.1, -120], label: 'Survive Scrapyard Ambush' },
      { type: 'combat_wave', waves: 2, label: 'Defeat Cartel Enforcers' },
      { type: 'escape', pos: [-340, 0.1, -200], label: 'Fall back to Cruz Garage' }
    ]
  },
  {
    id: 'm6_villa_infiltration',
    title: 'Villa Infiltration',
    district: 'Palma Heights',
    reward: 35000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Drive up the winding ridge to Villa Corazon. Cartel boss keeps the ledger in the cliffside office. Retrieve it and slip away downhill.',
    steps: [
      { type: 'goto', pos: [240, 12.0, -420], label: 'Drive up Palma Heights Ridge' },
      { type: 'goto', pos: [300, 18.0, -440], label: 'Infiltrate Villa Corazon Office' },
      { type: 'steal_item', label: 'Retrieve Cartel Encryption Ledger' },
      { type: 'evade_downhill', pos: [120, 0.1, -220], label: 'Escape down to Ocean Drive' }
    ]
  },
  {
    id: 'm7_airspace_lockdown',
    title: 'Airspace Lockdown',
    district: 'Downtown Spire',
    reward: 50000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'SCPD Air-1 is in the sky with full spotlight sweep. We have 4 stars on us! Dodge their searchlight beams and reach the underground canal slip.',
    steps: [
      { type: 'wanted', level: 4, dialogue: 'SCPD Chopper overhead! Break line of sight!' },
      { type: 'goto', pos: [-50, 0.1, -200], label: 'Speed through Downtown Overpass' },
      { type: 'goto', pos: [-240, 0.1, 80], label: 'Duck into Harbor Slip Berth' }
    ]
  },
  {
    id: 'm8_armored_convoy',
    title: 'Armored Convoy',
    district: 'Downtown Spire',
    reward: 75000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Apex Security’s armored transport is rolling through the financial district carrying the vault keycards. Intercept and disable it.',
    steps: [
      { type: 'intercept', pos: [-50, 0.1, -320], label: 'Intercept Apex Armored Van' },
      { type: 'disable', label: 'Ram or Shoot Engine until Disabled' },
      { type: 'retrieve_key', label: 'Secure Reserve Bank Master Keycard' }
    ]
  },
  {
    id: 'm9_the_solara_vault',
    title: 'The Solara Vault',
    district: 'Downtown Spire',
    reward: 120000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'This is it, Mateo. Solara Reserve Bank. Enter the grand rotunda, breach the security gate, and trigger the vault override.',
    steps: [
      { type: 'goto', pos: [-60, 0.1, -315], label: 'Enter Solara Reserve Bank' },
      { type: 'hack', time: 5, label: 'Breach Vault Door' },
      { type: 'wanted', level: 5, dialogue: 'SCPD 5-Star Alarm triggered! Every cop in Solara is en route!' }
    ]
  },
  {
    id: 'm10_golden_hour_escape',
    title: 'Golden Hour Escape',
    district: 'Coral Causeway',
    reward: 150000,
    introSpeaker: 'Elena Vance',
    introDialogue: 'Mateo! We’ve got the vault bearer bonds! Take the Super GT, gun it across the Coral Causeway, and jump into the getaway speedboat at Puerto Solara!',
    steps: [
      { type: 'goto', pos: [60, 3.8, 120], label: 'Blaze across Coral Causeway' },
      { type: 'goto', pos: [-260, 0.1, 220], label: 'Reach Marina Speedboat Dock' },
      { type: 'board_boat', pos: [-270, -0.2, 230], label: 'Escape into the Golden Hour Sunset!' }
    ]
  }
];
