import * as THREE from 'three';
import { ProceduralTextures } from './proceduralTextures.js';
import { BuildingFactory } from './buildingFactory.js';
import { PropsAndFoliage } from './propsAndFoliage.js';
import { OceanWater } from './waterShader.js';
import { DISTRICTS, getDistrictAt } from './districts.js';

export class CityGenerator {
  constructor(scene, roadNetwork) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.textures = new ProceduralTextures();
    this.buildingFactory = new BuildingFactory(this.textures);
    this.props = new PropsAndFoliage(this.textures);

    this.colliders = [];
    this.beacons = [];
    this.bridges = [];

    this.ocean = new OceanWater(3200);
    this.scene.add(this.ocean.mesh);

    this.buildArchipelago();
  }

  buildArchipelago() {
    this.buildTerrainIslands();
    this.buildRoadSurfaces();
    this.buildCausewayBridges();
    this.buildNeonPromenadeDistrict();
    this.buildDowntownSpireDistrict();
    this.buildPuertoSolaraDistrict();
    this.buildPalmaHeightsDistrict();
    this.buildCayoIndustrialDistrict();
    this.buildOuterKeyDistrict();
  }

  buildTerrainIslands() {
    // 1. Mainland Island Ground (Green/urban ground)
    const mainlandGeo = new THREE.BoxGeometry(600, 3.0, 500);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const mainland = new THREE.Mesh(mainlandGeo, groundMat);
    mainland.position.set(-80, -1.5, -140);
    mainland.receiveShadow = true;
    this.scene.add(mainland);

    // 2. Neon Promenade Beach (Golden sand strip east of the boulevard)
    const sandTex = this.textures.createSandTexture();
    sandTex.repeat.set(12, 24);
    const sandMat = new THREE.MeshStandardMaterial({ map: sandTex, roughness: 0.95 });
    const sandGeo = new THREE.PlaneGeometry(120, 480);
    sandGeo.rotateX(-Math.PI / 2);
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.position.set(330, 0.05, -50);
    sand.receiveShadow = true;
    this.scene.add(sand);

    // 3. Palma Heights Elevated Hill/Ridge
    const hillGeo = new THREE.BoxGeometry(320, 22.0, 320);
    const hillMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85 });
    const hill = new THREE.Mesh(hillGeo, hillMat);
    hill.position.set(280, 8.5, -420);
    hill.receiveShadow = true;
    this.scene.add(hill);

    // 4. South Marina Key Island (Across the Causeway)
    const keyGeo = new THREE.BoxGeometry(260, 3.0, 220);
    const key = new THREE.Mesh(keyGeo, groundMat);
    key.position.set(-10, -1.5, 320);
    key.receiveShadow = true;
    this.scene.add(key);
  }

  buildRoadSurfaces() {
    const roadTex = this.textures.createAsphaltTexture();
    const swTex = this.textures.createSidewalkTexture();

    // Generate asphalt road geometry along road network segments
    for (let i = 0; i < this.roadNetwork.segments.length; i++) {
      const seg = this.roadNetwork.segments[i];
      if (seg.isBridge) continue; // bridges built separately

      const pA = seg.a.pos;
      const pB = seg.b.pos;
      const dist = pA.distanceTo(pB);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);

      const roadW = seg.lanes * 4.2;

      // Road Plane
      const rGeo = new THREE.PlaneGeometry(roadW, dist);
      rGeo.rotateX(-Math.PI / 2);
      const rMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.7 });
      const roadMesh = new THREE.Mesh(rGeo, rMat);
      roadMesh.position.set(mid.x, Math.max(pA.y, pB.y) + 0.02, mid.z);
      roadMesh.rotation.y = angle;
      roadMesh.receiveShadow = true;
      this.scene.add(roadMesh);

      // Sidewalk borders
      const swGeo = new THREE.BoxGeometry(2.4, 0.25, dist);
      const swMat = new THREE.MeshStandardMaterial({ map: swTex, roughness: 0.8 });
      const sw1 = new THREE.Mesh(swGeo, swMat);
      sw1.position.set(mid.x - Math.cos(angle) * (roadW / 2 + 1.2), Math.max(pA.y, pB.y) + 0.12, mid.z + Math.sin(angle) * (roadW / 2 + 1.2));
      sw1.rotation.y = angle;
      sw1.receiveShadow = true;
      this.scene.add(sw1);

      const sw2 = new THREE.Mesh(swGeo, swMat);
      sw2.position.set(mid.x + Math.cos(angle) * (roadW / 2 + 1.2), Math.max(pA.y, pB.y) + 0.12, mid.z - Math.sin(angle) * (roadW / 2 + 1.2));
      sw2.rotation.y = angle;
      sw2.receiveShadow = true;
      this.scene.add(sw2);
    }
  }

  buildCausewayBridges() {
    const bridgeTex = this.textures.createBridgeRoadTexture();
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.2 });

    const bridgeSegments = this.roadNetwork.segments.filter((s) => s.isBridge);

    for (let i = 0; i < bridgeSegments.length; i++) {
      const seg = bridgeSegments[i];
      const pA = seg.a.pos;
      const pB = seg.b.pos;
      const dist = pA.distanceTo(pB);
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);
      const angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);

      const w = 12.0;

      // Road deck
      const deckGeo = new THREE.BoxGeometry(w, 0.8, dist);
      const deckMat = new THREE.MeshStandardMaterial({ map: bridgeTex, roughness: 0.6 });
      const deck = new THREE.Mesh(deckGeo, deckMat);
      deck.position.set(mid.x, mid.y, mid.z);
      deck.rotation.y = angle;
      deck.receiveShadow = true;
      this.scene.add(deck);

      // Guardrails
      const railGeo = new THREE.BoxGeometry(0.5, 1.2, dist);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      const railL = new THREE.Mesh(railGeo, railMat);
      railL.position.set(mid.x - Math.cos(angle) * (w / 2 - 0.25), mid.y + 0.8, mid.z + Math.sin(angle) * (w / 2 - 0.25));
      railL.rotation.y = angle;
      this.scene.add(railL);

      const railR = new THREE.Mesh(railGeo, railMat);
      railR.position.set(mid.x + Math.cos(angle) * (w / 2 - 0.25), mid.y + 0.8, mid.z - Math.sin(angle) * (w / 2 - 0.25));
      railR.rotation.y = angle;
      this.scene.add(railR);

      // Support Pilings into water
      const pilGeo = new THREE.CylinderGeometry(1.2, 1.4, mid.y + 4, 8);
      const pil1 = new THREE.Mesh(pilGeo, concreteMat);
      pil1.position.set(mid.x - Math.cos(angle) * 4, (mid.y - 4) / 2, mid.z + Math.sin(angle) * 4);
      const pil2 = new THREE.Mesh(pilGeo, concreteMat);
      pil2.position.set(mid.x + Math.cos(angle) * 4, (mid.y - 4) / 2, mid.z - Math.sin(angle) * 4);
      this.scene.add(pil1);
      this.scene.add(pil2);

      // Glowing bridge streetlamps
      for (let s = -dist * 0.4; s <= dist * 0.4; s += 36) {
        const lamp = this.props.createStreetlamp(false);
        lamp.position.set(mid.x + Math.sin(angle) * s + Math.cos(angle) * 5.2, mid.y + 0.4, mid.z + Math.cos(angle) * s - Math.sin(angle) * 5.2);
        lamp.rotation.y = angle + Math.PI / 2;
        this.scene.add(lamp);
      }

      this.bridges.push({ pA, pB, width: w, height: mid.y });
    }
  }

  buildNeonPromenadeDistrict() {
    // Art-Deco hotels along west side of Ocean Drive
    const hotelConfigs = [
      { name: 'THE CORAL PALMS', col1: '#fbcfe8', col2: '#06b6d4', pos: [120, 0, -180] },
      { name: 'NEON SURF CLUB', col1: '#cffafe', col2: '#ec4899', pos: [120, 0, -110] },
      { name: 'OCEAN DRIVE SUITES', col1: '#fed7aa', col2: '#0ea5e9', pos: [120, 0, -40] },
      { name: 'TROPICO GRANDE', col1: '#ddd6fe', col2: '#f43f5e', pos: [120, 0, 30] },
      { name: 'SOLARA HORIZON', col1: '#fef08a', col2: '#06b6d4', pos: [120, 0, 100] }
    ];

    for (let i = 0; i < hotelConfigs.length; i++) {
      const c = hotelConfigs[i];
      const hotel = this.buildingFactory.createArtDecoHotel(34, 28, 42, c.col1, c.col2, c.name);
      hotel.position.set(c.pos[0], c.pos[1], c.pos[2]);
      hotel.rotation.y = Math.PI / 2;
      this.scene.add(hotel);
      this.addCollider(hotel.position, hotel.userData.collider);
    }

    // Rows of iconic tropical palm trees along Ocean Drive & beach promenade
    for (let z = -220; z <= 120; z += 22) {
      // West sidewalk palms
      const palmW = this.props.createPalmTree(9 + (z % 3) * 0.8);
      palmW.position.set(168, 0, z);
      this.scene.add(palmW);

      // East beach boardwalk palms
      const palmE = this.props.createPalmTree(10 + ((z + 7) % 3) * 0.8);
      palmE.position.set(208, 0, z);
      this.scene.add(palmE);

      // Promenade Streetlamps
      if (z % 44 === 0) {
        const lamp = this.props.createStreetlamp(true);
        lamp.position.set(166, 0, z);
        lamp.rotation.y = Math.PI / 2;
        this.scene.add(lamp);
      }
    }

    // Stunt ramp near beach
    const ramp = this.props.createStuntRamp();
    ramp.position.set(230, 0, 60);
    ramp.rotation.y = -Math.PI / 6;
    this.scene.add(ramp);
  }

  buildDowntownSpireDistrict() {
    // Solara Reserve Bank Landmark
    const bank = this.buildingFactory.createSolaraReserveBank();
    bank.position.set(-60, 0, -320);
    this.scene.add(bank);
    this.addCollider(bank.position, bank.userData.collider);

    // Skyscrapers grid
    const towerPositions = [
      { pos: [-120, 0, -380], h: 120, col: '#0284c7' },
      { pos: [-120, 0, -260], h: 105, col: '#0ea5e9' },
      { pos: [0, 0, -380], h: 135, col: '#06b6d4' },
      { pos: [0, 0, -260], h: 90, col: '#38bdf8' },
      { pos: [80, 0, -300], h: 80, col: '#0284c7' }
    ];

    for (let i = 0; i < towerPositions.length; i++) {
      const tp = towerPositions[i];
      const tower = this.buildingFactory.createModernSkyscraper(36, 36, tp.h, tp.col);
      tower.position.set(tp.pos[0], tp.pos[1], tp.pos[2]);
      this.scene.add(tower);
      this.addCollider(tower.position, tower.userData.collider);
    }

    // Modern neon corporate billboards
    const bb1 = this.props.createNeonBillboard('APEX FINANCIAL', '#06b6d4', 'GLOBAL ASSETS');
    bb1.position.set(-30, 0, -180);
    this.scene.add(bb1);
  }

  buildPuertoSolaraDistrict() {
    // Cape Solara Lighthouse Landmark
    const lighthouse = this.buildingFactory.createLighthouse();
    lighthouse.position.set(-420, 0, 240);
    this.scene.add(lighthouse);
    this.beacons.push(lighthouse.userData.beam);
    this.addCollider(lighthouse.position, lighthouse.userData.collider);

    // Waterfront warehouses
    const whPositions = [
      [-320, 0, 80],
      [-320, 0, 160],
      [-240, 0, 160]
    ];
    for (let i = 0; i < whPositions.length; i++) {
      const pos = whPositions[i];
      const wh = this.buildingFactory.createHarborWarehouse(32, 24, 11);
      wh.position.set(pos[0], pos[1], pos[2]);
      this.scene.add(wh);
      this.addCollider(wh.position, wh.userData.collider);
    }

    // Stacked shipping cargo containers
    const containerColors = [0x2563eb, 0xdc2626, 0x16a34a, 0xeab308, 0x9333ea];
    for (let x = -380; x <= -350; x += 14) {
      for (let z = 120; z <= 150; z += 16) {
        const col = containerColors[Math.abs(x + z) % containerColors.length];
        const c1 = this.props.createCargoContainer(col);
        c1.position.set(x, 0, z);
        this.scene.add(c1);
        this.addCollider(c1.position, c1.userData.collider);

        if ((x + z) % 2 === 0) {
          const c2 = this.props.createCargoContainer(containerColors[(x * z) % containerColors.length]);
          c2.position.set(x, 2.8, z);
          this.scene.add(c2);
        }
      }
    }
  }

  buildPalmaHeightsDistrict() {
    const villaPositions = [
      [260, 12, -440],
      [340, 16, -420],
      [380, 20, -340],
      [300, 14, -300]
    ];

    for (let i = 0; i < villaPositions.length; i++) {
      const vp = villaPositions[i];
      const villa = this.buildingFactory.createHillsideVilla(26, 20, 11);
      villa.position.set(vp[0], vp[1], vp[2]);
      villa.rotation.y = (i * Math.PI) / 3;
      this.scene.add(villa);
      this.addCollider(villa.position, villa.userData.collider);
    }
  }

  buildCayoIndustrialDistrict() {
    // Cruz's Chop-Shop & Safehouse Garage
    const garage = this.buildingFactory.createChopShopGarage();
    garage.position.set(-340, 0, -200);
    this.scene.add(garage);
    this.addCollider(garage.position, garage.userData.collider);

    // Industrial fuel refinery tanks
    const tankGeo = new THREE.CylinderGeometry(10, 10, 16, 16);
    const tankMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    const tank1 = new THREE.Mesh(tankGeo, tankMat);
    tank1.position.set(-460, 8, -260);
    this.scene.add(tank1);
    this.addCollider(tank1.position, { type: 'cylinder', radius: 10, height: 16 });

    const tank2 = new THREE.Mesh(tankGeo, tankMat);
    tank2.position.set(-430, 8, -290);
    this.scene.add(tank2);
    this.addCollider(tank2.position, { type: 'cylinder', radius: 10, height: 16 });

    // Stunt Jump ramp
    const ramp = this.props.createStuntRamp();
    ramp.position.set(-300, 0, -140);
    ramp.rotation.y = Math.PI / 4;
    this.scene.add(ramp);
  }

  buildOuterKeyDistrict() {
    // Outer Marina Slip Safehouse & Speedboat dock
    const slipGeo = new THREE.BoxGeometry(40, 1.2, 30);
    const slipMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    const slip = new THREE.Mesh(slipGeo, slipMat);
    slip.position.set(-20, 0.4, 340);
    this.scene.add(slip);

    const bbKey = this.props.createNeonBillboard('KEY MARINA SLIP', '#ec4899', 'PRIVATE BERTH');
    bbKey.position.set(10, 0, 310);
    this.scene.add(bbKey);
  }

  addCollider(pos, col) {
    if (!col) return;
    this.colliders.push({ pos, ...col });
  }

  checkCollision(pos, radius = 1.0) {
    for (let i = 0; i < this.colliders.length; i++) {
      const c = this.colliders[i];
      if (c.type === 'box') {
        const hW = c.size.x / 2 + radius;
        const hD = c.size.z / 2 + radius;
        if (
          pos.x >= c.pos.x - hW &&
          pos.x <= c.pos.x + hW &&
          pos.z >= c.pos.z - hD &&
          pos.z <= c.pos.z + hD &&
          pos.y <= c.pos.y + c.size.y
        ) {
          return true;
        }
      } else if (c.type === 'cylinder') {
        const dx = pos.x - c.pos.x;
        const dz = pos.z - c.pos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < c.radius + radius && pos.y <= c.pos.y + c.height) {
          return true;
        }
      }
    }
    return false;
  }

  getGroundHeight(x, z) {
    // Check causeway bridge elevation
    for (let i = 0; i < this.bridges.length; i++) {
      const b = this.bridges[i];
      const minX = Math.min(b.pA.x, b.pB.x) - b.width;
      const maxX = Math.max(b.pA.x, b.pB.x) + b.width;
      const minZ = Math.min(b.pA.z, b.pB.z);
      const maxZ = Math.max(b.pA.z, b.pB.z);
      if (x >= minX && x <= maxX && z >= minZ && z <= maxZ) {
        return b.height;
      }
    }

    // Palma Heights hills
    if (x >= 120 && x <= 440 && z >= -580 && z <= -260) {
      const distFromCenter = Math.sqrt(Math.pow(x - 280, 2) + Math.pow(z - 420, 2));
      return Math.max(0, 18 - distFromCenter * 0.05);
    }

    // Ocean water boundaries
    if (z > 50 && z < 250 && (x < -180 || x > 120)) {
      return -0.4; // water level
    }

    return 0.0; // standard mainland ground
  }

  update(delta) {
    this.ocean.update(delta);

    // Rotate lighthouse beam
    for (let i = 0; i < this.beacons.length; i++) {
      this.beacons[i].rotation.z += delta * 1.5;
    }
  }
}
