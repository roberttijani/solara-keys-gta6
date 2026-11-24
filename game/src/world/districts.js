export const DISTRICTS = [
  {
    id: 'neon_promenade',
    name: 'Neon Promenade',
    subtitle: 'Beachfront Strip & Art Deco Blvd',
    themeColor: '#ec4899', // Magenta
    ambientColor: 0xffe4e6,
    bounds: { minX: 50, maxX: 450, minZ: -250, maxZ: 150 },
    center: { x: 220, y: 1.0, z: -50 },
    description: 'Pastel Art-Deco hotels, glowing rooftop neon, palm-lined ocean boulevard, and golden sands.',
    landmarks: [
      { name: 'The Coral Palms Hotel', pos: [180, 0, -30], type: 'hotel' },
      { name: 'Solara Marina Boardwalk', pos: [320, 0, 80], type: 'boardwalk' },
      { name: 'Tropicana Club & Lounge', pos: [240, 0, -120], type: 'club' }
    ],
    vehicleSpawns: ['super_gt', 'muscle_coupe', 'coastal_sedan'],
    pedestrianDensity: 1.2
  },
  {
    id: 'downtown_spire',
    name: 'Downtown Spire',
    subtitle: 'Financial Core & Sky Plaza',
    themeColor: '#06b6d4', // Cyan
    ambientColor: 0xe0f2fe,
    bounds: { minX: -200, maxX: 100, minZ: -450, maxZ: -150 },
    center: { x: -50, y: 1.0, z: -300 },
    description: 'Sleek mirrored glass skyscrapers, multi-tier plazas, overpass ramps, and the Solara Reserve Bank.',
    landmarks: [
      { name: 'Solara Reserve Bank', pos: [-60, 0, -320], type: 'bank' },
      { name: 'Apex Tower Plaza', pos: [-20, 0, -250], type: 'corporate' },
      { name: 'Overpass Transit Hub', pos: [40, 0, -380], type: 'transit' }
    ],
    vehicleSpawns: ['coastal_sedan', 'armored_van', 'super_gt'],
    pedestrianDensity: 1.0
  },
  {
    id: 'puerto_solara',
    name: 'Puerto Solara',
    subtitle: 'Harbor, Docks & Marina',
    themeColor: '#f59e0b', // Amber
    ambientColor: 0xfef3c7,
    bounds: { minX: -450, maxX: -150, minZ: -50, maxZ: 300 },
    center: { x: -300, y: 1.0, z: 120 },
    description: 'Gantry shipping cranes, stacked colorful cargo containers, docked yachts, and the coastal lighthouse.',
    landmarks: [
      { name: 'Cape Solara Lighthouse', pos: [-420, 0, 240], type: 'lighthouse' },
      { name: 'Marina Yacht Basin', pos: [-240, 0, 80], type: 'marina' },
      { name: 'Corales Cargo Pier 4', pos: [-360, 0, 160], type: 'pier' }
    ],
    vehicleSpawns: ['muscle_coupe', 'harbor_speedboat', 'armored_van'],
    pedestrianDensity: 0.6
  },
  {
    id: 'palma_heights',
    name: 'Palma Heights',
    subtitle: 'Hillside Villas & Ridge Overlook',
    themeColor: '#10b981', // Emerald
    ambientColor: 0xd1fae5,
    bounds: { minX: 100, maxX: 450, minZ: -600, maxZ: -250 },
    center: { x: 260, y: 15.0, z: -420 },
    description: 'Elevated scenic winding ridge roads, terraced white villas with pools, and panoramic ocean vistas.',
    landmarks: [
      { name: 'Villa Corazon Estate', pos: [300, 18, -440], type: 'villa' },
      { name: 'Sunset Ridge Lookout', pos: [380, 24, -360], type: 'vista' },
      { name: 'Heights Helipad', pos: [220, 14, -480], type: 'helipad' }
    ],
    vehicleSpawns: ['super_gt', 'muscle_coupe'],
    pedestrianDensity: 0.5
  },
  {
    id: 'cayo_industrial',
    name: 'Cayo Industrial',
    subtitle: 'Docks, Scrapyard & Cruz Chop-Shop',
    themeColor: '#ef4444', // Red
    ambientColor: 0xfee2e2,
    bounds: { minX: -550, maxX: -200, minZ: -400, maxZ: -50 },
    center: { x: -380, y: 1.0, z: -220 },
    description: 'Fuel storage tanks, industrial hangars, stunt ramps, and Mateo Cruz’s Chop-Shop & Safehouse Garage.',
    landmarks: [
      { name: "Cruz's Chop-Shop & Garage", pos: [-340, 0, -200], type: 'garage' },
      { name: 'Solara Refinery Tanks', pos: [-460, 0, -260], type: 'refinery' },
      { name: 'The Mega Stunt Ramp', pos: [-300, 0, -140], type: 'ramp' }
    ],
    vehicleSpawns: ['muscle_coupe', 'armored_van'],
    pedestrianDensity: 0.4
  },
  {
    id: 'coral_causeway',
    name: 'Coral Causeway',
    subtitle: 'Twin Ocean Bridges & Outer Keys',
    themeColor: '#8b5cf6', // Violet
    ambientColor: 0xede9fe,
    bounds: { minX: -200, maxX: 150, minZ: -50, maxZ: 350 },
    center: { x: -20, y: 3.5, z: 150 },
    description: 'Long elevated over-water bridges with glowing neon streetlamps linking the archipelago islands.',
    landmarks: [
      { name: 'Solara Twin Bridges', pos: [-20, 3.5, 120], type: 'bridge' },
      { name: 'South Key Marina Gate', pos: [40, 1.0, 280], type: 'gate' },
      { name: 'Causeway Speed Checkpoint', pos: [-50, 3.5, 200], type: 'checkpoint' }
    ],
    vehicleSpawns: ['super_gt', 'scpd_cruiser', 'coastal_sedan'],
    pedestrianDensity: 0.2
  }
];

export function getDistrictAt(x, z) {
  for (let i = 0; i < DISTRICTS.length; i++) {
    const d = DISTRICTS[i];
    if (x >= d.bounds.minX && x <= d.bounds.maxX && z >= d.bounds.minZ && z <= d.bounds.maxZ) {
      return d;
    }
  }
  // Default to nearest or neon promenade
  return DISTRICTS[0];
}
