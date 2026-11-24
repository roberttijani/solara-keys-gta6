export const SIDE_ACTIVITIES = {
  streetRaces: [
    {
      id: 'race_promenade_sprint',
      title: 'Neon Promenade Sprint',
      district: 'Neon Promenade',
      laps: 1,
      reward: 7500,
      startPos: [180, 0.1, -220],
      checkpoints: [
        [180, 0.1, -100],
        [180, 0.1, 0],
        [180, 0.1, 120],
        [250, 0.1, 100],
        [250, 0.1, -100],
        [180, 0.1, -220]
      ]
    },
    {
      id: 'race_causeway_gp',
      title: 'Coral Causeway Grand Prix',
      district: 'Coral Causeway',
      laps: 2,
      reward: 15000,
      startPos: [80, 0.1, 50],
      checkpoints: [
        [60, 3.8, 120],
        [40, 4.0, 220],
        [20, 0.2, 300],
        [-40, 4.0, 220],
        [-40, 3.8, 120],
        [80, 0.1, 50]
      ]
    }
  ],

  stuntJumps: [
    { id: 'jump_beach_lip', name: 'Promenade Boardwalk Launch', pos: [230, 0.1, 60], reward: 3000 },
    { id: 'jump_cayo_scrapyard', name: 'Cayo Mega Stunt Ramp', pos: [-300, 0.1, -140], reward: 4500 },
    { id: 'jump_overpass_gap', name: 'Downtown Overpass Gap', pos: [40, 4.0, -360], reward: 5000 },
    { id: 'jump_pier_barrel', name: 'Pier 4 Container Leap', pos: [-380, 0.1, 140], reward: 4000 },
    { id: 'jump_villa_cliff', name: 'Palma Cliff Drop', pos: [380, 20.0, -340], reward: 6000 },
    { id: 'jump_refinery_pipe', name: 'Refinery Tank Crest', pos: [-430, 0.1, -260], reward: 5500 },
    { id: 'jump_causeway_span', name: 'Causeway Drawbridge Split', pos: [0, 4.0, 180], reward: 8000 },
    { id: 'jump_key_slip_pier', name: 'Outer Key Marina Flyby', pos: [-10, 0.2, 340], reward: 5000 }
  ],

  courierRuns: [
    {
      id: 'courier_marina_parts',
      title: 'High-Priority Turbo Parts',
      origin: 'Cruz Chop-Shop',
      destination: 'Marina Basin',
      pos: [-240, 0.1, 80],
      timeLimit: 90,
      reward: 6000
    },
    {
      id: 'courier_encrypted_drive',
      title: 'Elena Vance Data Drop',
      origin: 'Downtown Spire',
      destination: 'Palma Heights Lookout',
      pos: [380, 24.0, -360],
      timeLimit: 120,
      reward: 9500
    }
  ],

  turfRaids: [
    { id: 'turf_corales_wharf', name: 'Los Corales Wharf Depot', district: 'Puerto Solara', pos: [-360, 0.1, 160], reward: 12500 },
    { id: 'turf_apex_depot', name: 'Apex Security Hub', district: 'Downtown Spire', pos: [-20, 0.1, -250], reward: 18000 },
    { id: 'turf_scrapyard_crew', name: 'Scrapyard Smugglers', district: 'Cayo Industrial', pos: [-420, 0.1, -120], reward: 10000 },
    { id: 'turf_villa_syndicate', name: 'Heights Syndicate Guardhouse', district: 'Palma Heights', pos: [300, 18.0, -440], reward: 22000 }
  ]
};
