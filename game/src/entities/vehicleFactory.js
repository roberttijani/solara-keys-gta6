import * as THREE from 'three';

export class VehicleFactory {
  constructor() {
    this.wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 16);
    this.wheelGeo.rotateZ(Math.PI / 2);
    this.wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    this.rimMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9, roughness: 0.1 });
  }

  createWheel() {
    const wheelGroup = new THREE.Group();
    const tire = new THREE.Mesh(this.wheelGeo, this.wheelMat);
    tire.castShadow = true;
    wheelGroup.add(tire);

    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.36, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.rimMat);
    wheelGroup.add(rim);

    return wheelGroup;
  }

  createVehicle(type = 'super_gt', colorHex = null) {
    const group = new THREE.Group();
    group.userData.type = type;
    group.userData.wheels = [];
    group.userData.headlights = [];
    group.userData.taillights = [];
    group.userData.policeLights = [];

    if (type === 'super_gt') {
      this.buildSuperGT(group, colorHex || 0x06b6d4); // Vibrant cyan default
    } else if (type === 'muscle_coupe') {
      this.buildMuscleCoupe(group, colorHex || 0xf97316); // Sunset orange
    } else if (type === 'coastal_sedan') {
      this.buildCoastalSedan(group, colorHex || 0xf8fafc); // Pearl white
    } else if (type === 'armored_van') {
      this.buildArmoredVan(group, colorHex || 0x334155); // Apex slate gray
    } else if (type === 'scpd_cruiser') {
      this.buildSCPDCruiser(group);
    } else if (type === 'harbor_speedboat') {
      this.buildHarborSpeedboat(group, colorHex || 0x0284c7);
    } else {
      this.buildSuperGT(group, colorHex || 0xec4899);
    }

    return group;
  }

  buildSuperGT(group, bodyColor) {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.15,
      metalness: 0.85
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85
    });

    // Lower aerodynamic chassis
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.45, 4.6);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.45;
    chassis.castShadow = true;
    group.add(chassis);

    // Tapered cabin & cockpit
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.42, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 0.85, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Front wedge nose
    const noseGeo = new THREE.ConeGeometry(1.05, 1.2, 4);
    noseGeo.rotateX(-Math.PI / 2);
    noseGeo.rotateY(Math.PI / 4);
    noseGeo.scale(1.0, 0.35, 1.0);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.42, 2.3);
    group.add(nose);

    // Rear aerodynamic wing / spoiler
    const wingGeo = new THREE.BoxGeometry(1.9, 0.08, 0.4);
    const wing = new THREE.Mesh(wingGeo, bodyMat);
    wing.position.set(0, 0.98, -2.1);
    group.add(wing);

    const postGeo = new THREE.BoxGeometry(0.08, 0.35, 0.1);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    const p1 = new THREE.Mesh(postGeo, postMat);
    p1.position.set(-0.6, 0.78, -2.1);
    const p2 = new THREE.Mesh(postGeo, postMat);
    p2.position.set(0.6, 0.78, -2.1);
    group.add(p1);
    group.add(p2);

    // Neon underglow
    const underglow = new THREE.PointLight(0x06b6d4, 1.6, 4.5);
    underglow.position.set(0, 0.15, 0);
    group.add(underglow);
    group.userData.underglow = underglow;

    // Headlights (LED cyan/white)
    const hlGeo = new THREE.BoxGeometry(0.35, 0.12, 0.1);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x38bdf8, emissiveIntensity: 1.5 });
    const hlL = new THREE.Mesh(hlGeo, hlMat);
    hlL.position.set(-0.75, 0.45, 2.3);
    const hlR = new THREE.Mesh(hlGeo, hlMat);
    hlR.position.set(0.75, 0.45, 2.3);
    group.add(hlL);
    group.add(hlR);
    group.userData.headlights.push(hlL, hlR);

    // Taillights (Neon red strip)
    const tlGeo = new THREE.BoxGeometry(1.7, 0.1, 0.1);
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 1.2 });
    const tl = new THREE.Mesh(tlGeo, tlMat);
    tl.position.set(0, 0.55, -2.31);
    group.add(tl);
    group.userData.taillights.push(tl);

    // Wheels
    const wFL = this.createWheel();
    wFL.position.set(-1.08, 0.42, 1.4);
    const wFR = this.createWheel();
    wFR.position.set(1.08, 0.42, 1.4);
    const wRL = this.createWheel();
    wRL.position.set(-1.08, 0.42, -1.4);
    const wRR = this.createWheel();
    wRR.position.set(1.08, 0.42, -1.4);
    group.add(wFL, wFR, wRL, wRR);
    group.userData.wheels = [wFL, wFR, wRL, wRR];

    group.userData.physics = {
      maxSpeed: 135,
      acceleration: 48,
      brakeForce: 75,
      turnSpeed: 2.8,
      mass: 1400,
      driftFactor: 0.94
    };
  }

  buildMuscleCoupe(group, bodyColor) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.6 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.95, roughness: 0.05 });

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(2.15, 0.55, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    group.add(chassis);

    // Hood scoop
    const scoopGeo = new THREE.BoxGeometry(0.7, 0.18, 1.2);
    const scoop = new THREE.Mesh(scoopGeo, chromeMat);
    scoop.position.set(0, 0.88, 1.1);
    group.add(scoop);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.48, 2.2);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.02, -0.4);
    group.add(cabin);

    // Chrome bumpers
    const fBumpGeo = new THREE.BoxGeometry(2.18, 0.18, 0.2);
    const fBump = new THREE.Mesh(fBumpGeo, chromeMat);
    fBump.position.set(0, 0.45, 2.45);
    const rBump = new THREE.Mesh(fBumpGeo, chromeMat);
    rBump.position.set(0, 0.45, -2.45);
    group.add(fBump, rBump);

    // Dual exhaust tips
    const exhGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    exhGeo.rotateX(Math.PI / 2);
    const ex1 = new THREE.Mesh(exhGeo, chromeMat);
    ex1.position.set(-0.6, 0.35, -2.5);
    const ex2 = new THREE.Mesh(exhGeo, chromeMat);
    ex2.position.set(0.6, 0.35, -2.5);
    group.add(ex1, ex2);

    // Headlights
    const hlGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 12);
    hlGeo.rotateX(Math.PI / 2);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xffedd5, emissiveIntensity: 1.4 });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(-0.75, 0.58, 2.42);
    const hl2 = new THREE.Mesh(hlGeo, hlMat);
    hl2.position.set(0.75, 0.58, 2.42);
    group.add(hl1, hl2);
    group.userData.headlights.push(hl1, hl2);

    // Taillights
    const tlGeo = new THREE.BoxGeometry(0.4, 0.18, 0.1);
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 1.2 });
    const tl1 = new THREE.Mesh(tlGeo, tlMat);
    tl1.position.set(-0.7, 0.58, -2.42);
    const tl2 = new THREE.Mesh(tlGeo, tlMat);
    tl2.position.set(0.7, 0.58, -2.42);
    group.add(tl1, tl2);
    group.userData.taillights.push(tl1, tl2);

    // Wheels
    const wFL = this.createWheel();
    wFL.position.set(-1.1, 0.44, 1.45);
    const wFR = this.createWheel();
    wFR.position.set(1.1, 0.44, 1.45);
    const wRL = this.createWheel();
    wRL.position.set(-1.1, 0.44, -1.45);
    const wRR = this.createWheel();
    wRR.position.set(1.1, 0.44, -1.45);
    group.add(wFL, wFR, wRL, wRR);
    group.userData.wheels = [wFL, wFR, wRL, wRR];

    group.userData.physics = {
      maxSpeed: 118,
      acceleration: 44,
      brakeForce: 68,
      turnSpeed: 2.5,
      mass: 1650,
      driftFactor: 0.91
    };
  }

  buildCoastalSedan(group, bodyColor) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.25, metalness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.8 });

    const chassisGeo = new THREE.BoxGeometry(2.0, 0.52, 4.6);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.y = 0.52;
    chassis.castShadow = true;
    group.add(chassis);

    const cabinGeo = new THREE.BoxGeometry(1.7, 0.52, 2.5);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.0, -0.1);
    group.add(cabin);

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.12, 0.1);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
    const hlL = new THREE.Mesh(hlGeo, hlMat);
    hlL.position.set(-0.7, 0.52, 2.3);
    const hlR = new THREE.Mesh(hlGeo, hlMat);
    hlR.position.set(0.7, 0.52, 2.3);
    group.add(hlL, hlR);
    group.userData.headlights.push(hlL, hlR);

    // Taillights
    const tlGeo = new THREE.BoxGeometry(0.4, 0.12, 0.1);
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 1.0 });
    const tlL = new THREE.Mesh(tlGeo, tlMat);
    tlL.position.set(-0.7, 0.52, -2.3);
    const tlR = new THREE.Mesh(tlGeo, tlMat);
    tlR.position.set(0.7, 0.52, -2.3);
    group.add(tlL, tlR);
    group.userData.taillights.push(tlL, tlR);

    // Wheels
    const wFL = this.createWheel();
    wFL.position.set(-1.02, 0.42, 1.4);
    const wFR = this.createWheel();
    wFR.position.set(1.02, 0.42, 1.4);
    const wRL = this.createWheel();
    wRL.position.set(-1.02, 0.42, -1.4);
    const wRR = this.createWheel();
    wRR.position.set(1.02, 0.42, -1.4);
    group.add(wFL, wFR, wRL, wRR);
    group.userData.wheels = [wFL, wFR, wRL, wRR];

    group.userData.physics = {
      maxSpeed: 104,
      acceleration: 36,
      brakeForce: 65,
      turnSpeed: 2.6,
      mass: 1550,
      driftFactor: 0.95
    };
  }

  buildArmoredVan(group, bodyColor) {
    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.55, metalness: 0.6 });
    const armorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.2 });

    // Main heavy van box
    const bodyGeo = new THREE.BoxGeometry(2.4, 1.5, 5.2);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 1.15;
    body.castShadow = true;
    group.add(body);

    // Heavy front bull-bar
    const barGeo = new THREE.BoxGeometry(2.4, 0.8, 0.35);
    const bar = new THREE.Mesh(barGeo, armorMat);
    bar.position.set(0, 0.75, 2.75);
    group.add(bar);

    // Slit armored windows
    const slitGeo = new THREE.BoxGeometry(2.0, 0.28, 0.1);
    const slitMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const fSlit = new THREE.Mesh(slitGeo, slitMat);
    fSlit.position.set(0, 1.4, 2.61);
    group.add(fSlit);

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(-0.85, 0.8, 2.65);
    const hl2 = new THREE.Mesh(hlGeo, hlMat);
    hl2.position.set(0.85, 0.8, 2.65);
    group.add(hl1, hl2);
    group.userData.headlights.push(hl1, hl2);

    // Wheels (Heavy 6-wheel or large 4-wheel)
    const wFL = this.createWheel();
    wFL.position.set(-1.25, 0.5, 1.6);
    const wFR = this.createWheel();
    wFR.position.set(1.25, 0.5, 1.6);
    const wRL = this.createWheel();
    wRL.position.set(-1.25, 0.5, -1.6);
    const wRR = this.createWheel();
    wRR.position.set(1.25, 0.5, -1.6);
    group.add(wFL, wFR, wRL, wRR);
    group.userData.wheels = [wFL, wFR, wRL, wRR];

    group.userData.physics = {
      maxSpeed: 82,
      acceleration: 26,
      brakeForce: 85,
      turnSpeed: 2.0,
      mass: 3800,
      driftFactor: 0.98
    };
  }

  buildSCPDCruiser(group) {
    // Black & white police livery
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.5 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1 });

    // Chassis (White doors, black hood & trunk)
    const chassisGeo = new THREE.BoxGeometry(2.1, 0.54, 4.8);
    const chassis = new THREE.Mesh(chassisGeo, whiteMat);
    chassis.position.y = 0.54;
    chassis.castShadow = true;
    group.add(chassis);

    // Black hood
    const hoodGeo = new THREE.BoxGeometry(2.08, 0.05, 1.5);
    const hood = new THREE.Mesh(hoodGeo, blackMat);
    hood.position.set(0, 0.82, 1.4);
    group.add(hood);

    // Black trunk
    const trunkGeo = new THREE.BoxGeometry(2.08, 0.05, 1.2);
    const trunk = new THREE.Mesh(trunkGeo, blackMat);
    trunk.position.set(0, 0.82, -1.6);
    group.add(trunk);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.75, 0.52, 2.3);
    const cabin = new THREE.Mesh(cabinGeo, glassMat);
    cabin.position.set(0, 1.05, -0.1);
    group.add(cabin);

    // Front push-bar
    const pushGeo = new THREE.BoxGeometry(1.6, 0.5, 0.3);
    const pushMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
    const pushBar = new THREE.Mesh(pushGeo, pushMat);
    pushBar.position.set(0, 0.55, 2.5);
    group.add(pushBar);

    // Rooftop SCPD Lightbar (Dynamic Red & Blue)
    const barGeo = new THREE.BoxGeometry(1.1, 0.12, 0.3);
    const barBaseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const barBase = new THREE.Mesh(barGeo, barBaseMat);
    barBase.position.set(0, 1.35, -0.1);
    group.add(barBase);

    // Red lens
    const redLensGeo = new THREE.BoxGeometry(0.48, 0.14, 0.28);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0 });
    const redLens = new THREE.Mesh(redLensGeo, redMat);
    redLens.position.set(-0.28, 1.42, -0.1);
    group.add(redLens);

    // Blue lens
    const blueLensGeo = new THREE.BoxGeometry(0.48, 0.14, 0.28);
    const blueMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 2.0 });
    const blueLens = new THREE.Mesh(blueLensGeo, blueMat);
    blueLens.position.set(0.28, 1.42, -0.1);
    group.add(blueLens);

    // Dynamic flashing point lights
    const redLight = new THREE.PointLight(0xef4444, 2.5, 18);
    redLight.position.set(-0.4, 1.6, -0.1);
    const blueLight = new THREE.PointLight(0x3b82f6, 2.5, 18);
    blueLight.position.set(0.4, 1.6, -0.1);
    group.add(redLight, blueLight);
    group.userData.policeLights = [redLight, blueLight, redLens, blueLens];

    // Headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.14, 0.1);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.5 });
    const hl1 = new THREE.Mesh(hlGeo, hlMat);
    hl1.position.set(-0.75, 0.54, 2.4);
    const hl2 = new THREE.Mesh(hlGeo, hlMat);
    hl2.position.set(0.75, 0.54, 2.4);
    group.add(hl1, hl2);
    group.userData.headlights.push(hl1, hl2);

    // Wheels
    const wFL = this.createWheel();
    wFL.position.set(-1.08, 0.44, 1.45);
    const wFR = this.createWheel();
    wFR.position.set(1.08, 0.44, 1.45);
    const wRL = this.createWheel();
    wRL.position.set(-1.08, 0.44, -1.45);
    const wRR = this.createWheel();
    wRR.position.set(1.08, 0.44, -1.45);
    group.add(wFL, wFR, wRL, wRR);
    group.userData.wheels = [wFL, wFR, wRL, wRR];

    group.userData.physics = {
      maxSpeed: 128,
      acceleration: 46,
      brakeForce: 78,
      turnSpeed: 2.7,
      mass: 1750,
      driftFactor: 0.93
    };
  }

  buildHarborSpeedboat(group, bodyColor) {
    const hullMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.2, metalness: 0.7 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });

    // Streamlined V-hull
    const hullGeo = new THREE.ConeGeometry(1.6, 6.2, 4);
    hullGeo.rotateX(-Math.PI / 2);
    hullGeo.rotateY(Math.PI / 4);
    hullGeo.scale(1.2, 0.55, 1.0);
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(0, 0.4, 0);
    group.add(hull);

    // Top deck
    const deckGeo = new THREE.BoxGeometry(2.0, 0.2, 4.4);
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(0, 0.65, -0.6);
    group.add(deck);

    // Windshield
    const wsGeo = new THREE.BoxGeometry(1.8, 0.45, 0.1);
    const wsMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
    const ws = new THREE.Mesh(wsGeo, wsMat);
    ws.position.set(0, 0.95, 0.6);
    group.add(ws);

    // Twin outboard motors
    const motorGeo = new THREE.BoxGeometry(0.35, 0.9, 0.45);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    const m1 = new THREE.Mesh(motorGeo, motorMat);
    m1.position.set(-0.6, 0.4, -2.9);
    const m2 = new THREE.Mesh(motorGeo, motorMat);
    m2.position.set(0.6, 0.4, -2.9);
    group.add(m1, m2);

    group.userData.isBoat = true;
    group.userData.physics = {
      maxSpeed: 110,
      acceleration: 38,
      brakeForce: 45,
      turnSpeed: 2.2,
      mass: 1200,
      driftFactor: 0.88
    };
  }
}
