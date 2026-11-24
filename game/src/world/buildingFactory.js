import * as THREE from 'three';

export class BuildingFactory {
  constructor(proceduralTextures) {
    this.textures = proceduralTextures;
    this.materials = new Map();
  }

  getMaterial(key, creator) {
    if (!this.materials.has(key)) {
      this.materials.set(key, creator());
    }
    return this.materials.get(key);
  }

  createArtDecoHotel(w = 28, d = 24, h = 38, col1 = '#fbcfe8', col2 = '#06b6d4', hotelName = 'THE CORAL PALMS') {
    const group = new THREE.Group();
    const tex = this.textures.createArtDecoFacadeTexture(col1, col2);
    tex.repeat.set(Math.max(1, Math.round(w / 12)), Math.max(1, Math.round(h / 14)));

    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.6,
      metalness: 0.1
    });

    // Base Tier
    const baseGeo = new THREE.BoxGeometry(w, h * 0.6, d);
    const baseMesh = new THREE.Mesh(baseGeo, mat);
    baseMesh.position.y = (h * 0.6) / 2;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Setback Tier 2
    const midH = h * 0.3;
    const midW = w * 0.78;
    const midD = d * 0.78;
    const midGeo = new THREE.BoxGeometry(midW, midH, midD);
    const midMesh = new THREE.Mesh(midGeo, mat);
    midMesh.position.y = h * 0.6 + midH / 2;
    midMesh.castShadow = true;
    midMesh.receiveShadow = true;
    group.add(midMesh);

    // Setback Tier 3 (Deco Crown)
    const topH = h * 0.15;
    const topW = w * 0.52;
    const topD = d * 0.52;
    const topGeo = new THREE.BoxGeometry(topW, topH, topD);
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3, metalness: 0.5 });
    const topMesh = new THREE.Mesh(topGeo, crownMat);
    topMesh.position.y = h * 0.9 + topH / 2;
    group.add(topMesh);

    // Entrance Marquee / Awning
    const awningGeo = new THREE.BoxGeometry(w * 0.45, 1.2, 7);
    const awningMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.4 });
    const awning = new THREE.Mesh(awningGeo, awningMat);
    awning.position.set(0, 3.2, d / 2 + 2.5);
    group.add(awning);

    // Rooftop Neon Sign
    const neonTex = this.textures.createNeonSignTexture(hotelName, '#f43f5e', 'ART DECO RESORT');
    const signGeo = new THREE.PlaneGeometry(16, 4.2);
    const signMat = new THREE.MeshBasicMaterial({ map: neonTex, transparent: true, side: THREE.DoubleSide });
    const signMesh = new THREE.Mesh(signGeo, signMat);
    signMesh.position.set(0, h * 0.9 + topH + 2.6, 0);
    group.add(signMesh);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }

  createModernSkyscraper(w = 32, d = 32, h = 95, glassTint = '#0284c7') {
    const group = new THREE.Group();
    const tex = this.textures.createLitSkyscraperTexture(glassTint, '#fef08a');
    tex.repeat.set(Math.max(1, Math.round(w / 14)), Math.max(1, Math.round(h / 12)));

    const towerMat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.15,
      metalness: 0.85
    });

    const towerGeo = new THREE.BoxGeometry(w, h, d);
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = h / 2;
    tower.castShadow = true;
    tower.receiveShadow = true;
    group.add(tower);

    // Glowing architectural crown & antennas
    const crownGeo = new THREE.BoxGeometry(w * 0.85, 4, d * 0.85);
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = h + 2;
    group.add(crown);

    // Spire
    const spireGeo = new THREE.CylinderGeometry(0.3, 1.2, 18, 8);
    const spireMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
    const spire = new THREE.Mesh(spireGeo, spireMat);
    spire.position.y = h + 13;
    group.add(spire);

    // Warning beacon point light on spire
    const beacon = new THREE.PointLight(0xef4444, 1.2, 25);
    beacon.position.y = h + 22;
    group.add(beacon);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }

  createHillsideVilla(w = 22, d = 18, h = 10) {
    const group = new THREE.Group();
    const tex = this.textures.createVillaWallTexture();
    const wallMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });

    // Lower terrace
    const lowGeo = new THREE.BoxGeometry(w, h * 0.55, d);
    const lowMesh = new THREE.Mesh(lowGeo, wallMat);
    lowMesh.position.y = (h * 0.55) / 2;
    lowMesh.castShadow = true;
    group.add(lowMesh);

    // Upper terrace
    const upGeo = new THREE.BoxGeometry(w * 0.65, h * 0.45, d * 0.7);
    const upMesh = new THREE.Mesh(upGeo, wallMat);
    upMesh.position.set(-w * 0.15, h * 0.55 + (h * 0.45) / 2, 0);
    upMesh.castShadow = true;
    group.add(upMesh);

    // Terracotta roof
    const roofGeo = new THREE.ConeGeometry(w * 0.48, 2.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-w * 0.15, h + 1.25, 0);
    group.add(roof);

    // Villa swimming pool terrace
    const poolGeo = new THREE.BoxGeometry(10, 0.4, 6);
    const poolMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.1, metalness: 0.2 });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.set(w * 0.32, 0.2, 0);
    group.add(pool);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }

  createHarborWarehouse(w = 34, d = 26, h = 12) {
    const group = new THREE.Group();
    const tex = this.textures.createWarehouseWallTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, metalness: 0.3 });

    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Rollup metal bay doors
    const doorGeo = new THREE.BoxGeometry(7, 6, 0.4);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.4 });
    const door1 = new THREE.Mesh(doorGeo, doorMat);
    door1.position.set(-8, 3, d / 2 + 0.2);
    const door2 = new THREE.Mesh(doorGeo, doorMat);
    door2.position.set(8, 3, d / 2 + 0.2);
    group.add(door1);
    group.add(door2);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }

  createSolaraReserveBank() {
    const group = new THREE.Group();
    const w = 48;
    const d = 36;
    const h = 26;

    // Granite facade
    const bankMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.1 });
    const baseGeo = new THREE.BoxGeometry(w, h, d);
    const base = new THREE.Mesh(baseGeo, bankMat);
    base.position.y = h / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Grand Entrance Portico & Pillars
    const colGeo = new THREE.CylinderGeometry(0.9, 1.0, 14, 16);
    const colMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    for (let x = -16; x <= 16; x += 8) {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(x, 7, d / 2 + 5);
      col.castShadow = true;
      group.add(col);
    }

    // Pediment triangle roof over entrance
    const pedGeo = new THREE.ConeGeometry(22, 6, 3);
    pedGeo.rotateY(Math.PI / 2);
    const ped = new THREE.Mesh(pedGeo, bankMat);
    ped.position.set(0, 17, d / 2 + 5);
    group.add(ped);

    // Bank Sign
    const signTex = this.textures.createNeonSignTexture('SOLARA RESERVE BANK', '#38bdf8', 'SECURITY DIVISION');
    const signGeo = new THREE.PlaneGeometry(24, 3.8);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 21, d / 2 + 0.2);
    group.add(sign);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w + 8, h, d + 12) };
    return group;
  }

  createLighthouse() {
    const group = new THREE.Group();
    const h = 34;

    // Tapered tower
    const towerGeo = new THREE.CylinderGeometry(2.4, 4.8, h, 16);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5 });
    const tower = new THREE.Mesh(towerGeo, towerMat);
    tower.position.y = h / 2;
    tower.castShadow = true;
    group.add(tower);

    // Red spiral stripes (decorative ring)
    const ringGeo = new THREE.CylinderGeometry(3.2, 3.6, 6, 16);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = h * 0.55;
    group.add(ring);

    // Balcony catwalk
    const catGeo = new THREE.CylinderGeometry(4.2, 4.2, 0.8, 16);
    const catMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const catwalk = new THREE.Mesh(catGeo, catMat);
    catwalk.position.y = h;
    group.add(catwalk);

    // Glass lantern room
    const glassGeo = new THREE.CylinderGeometry(2.8, 2.8, 4.5, 12);
    const glassMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.9 });
    const lantern = new THREE.Mesh(glassGeo, glassMat);
    lantern.position.y = h + 2.6;
    group.add(lantern);

    // Rotating coastal lighthouse beam
    const beamGeo = new THREE.ConeGeometry(8, 90, 16, 1, true);
    beamGeo.rotateX(Math.PI / 2);
    beamGeo.translate(0, 0, 45);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = h + 2.6;
    group.add(beam);
    group.userData.beam = beam;

    group.userData.collider = { type: 'cylinder', radius: 4.8, height: h };
    return group;
  }

  createChopShopGarage() {
    const group = new THREE.Group();
    const w = 36;
    const d = 28;
    const h = 11;

    const baseGeo = new THREE.BoxGeometry(w, h, d);
    const tex = this.textures.createWarehouseWallTexture();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });
    const base = new THREE.Mesh(baseGeo, mat);
    base.position.y = h / 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Huge roll-up open garage bay
    const bayGeo = new THREE.BoxGeometry(16, 7.5, 1.2);
    const bayMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const bay = new THREE.Mesh(bayGeo, bayMat);
    bay.position.set(0, 3.75, d / 2 + 0.1);
    group.add(bay);

    // Cruz Chop-Shop Neon Billboard
    const signTex = this.textures.createNeonSignTexture("CRUZ'S CUSTOMS", '#ec4899', 'CHOP-SHOP & GARAGE');
    const signGeo = new THREE.PlaneGeometry(18, 4.5);
    const signMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, h + 2.6, d / 2 + 0.2);
    group.add(sign);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }
}
