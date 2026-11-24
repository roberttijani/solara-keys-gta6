import * as THREE from 'three';

export class PropsAndFoliage {
  constructor(proceduralTextures) {
    this.textures = proceduralTextures;
  }

  createPalmTree(h = 9.5) {
    const group = new THREE.Group();

    // Trunk with slight natural curve
    const segments = 6;
    const segH = h / segments;
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78563c, roughness: 0.85 });

    let curY = 0;
    let curX = 0;
    for (let i = 0; i < segments; i++) {
      const rBottom = 0.45 * (1 - (i / segments) * 0.4);
      const rTop = 0.45 * (1 - ((i + 1) / segments) * 0.4);
      const geo = new THREE.CylinderGeometry(rTop, rBottom, segH, 8);
      const mesh = new THREE.Mesh(geo, trunkMat);
      mesh.position.set(curX, curY + segH / 2, 0);
      mesh.rotation.z = 0.04 * i;
      mesh.castShadow = true;
      group.add(mesh);

      curY += segH;
      curX += 0.12;
    }

    // Tropical Palm Fronds / Leaves
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      side: THREE.DoubleSide
    });

    const leafCount = 9;
    for (let i = 0; i < leafCount; i++) {
      const angle = (i / leafCount) * Math.PI * 2;
      const leafGeo = new THREE.ConeGeometry(0.8, 3.8, 4);
      leafGeo.rotateX(Math.PI / 2.4);
      leafGeo.scale(1.2, 0.2, 1.0);
      const leaf = new THREE.Mesh(leafGeo, frondMat);
      leaf.position.set(curX, curY, 0);
      leaf.rotation.y = angle;
      leaf.castShadow = true;
      group.add(leaf);
    }

    group.userData.collider = { type: 'cylinder', radius: 0.5, height: h };
    return group;
  }

  createStreetlamp(isWarm = true) {
    const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

    // Vertical pole
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.18, 7.5, 8);
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3.75;
    pole.castShadow = true;
    group.add(pole);

    // Curved arm
    const armGeo = new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8);
    armGeo.rotateZ(Math.PI / 3);
    const arm = new THREE.Mesh(armGeo, poleMat);
    arm.position.set(0.9, 7.6, 0);
    group.add(arm);

    // Lamp fixture
    const lampGeo = new THREE.BoxGeometry(0.8, 0.25, 0.45);
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: isWarm ? 0xfef08a : 0x38bdf8,
      emissiveIntensity: 0.95
    });
    const fixture = new THREE.Mesh(lampGeo, lampMat);
    fixture.position.set(1.8, 8.2, 0);
    group.add(fixture);

    // Night PointLight
    const light = new THREE.PointLight(isWarm ? 0xfef08a : 0x38bdf8, 1.2, 22, 1.8);
    light.position.set(1.8, 7.8, 0);
    group.add(light);

    group.userData.light = light;
    return group;
  }

  createCargoContainer(colorHex = 0x2563eb) {
    const group = new THREE.Group();
    const w = 6.0;
    const h = 2.8;
    const d = 14.0;

    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.4 });
    const geo = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Frame accents
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 });
    const endGeo = new THREE.BoxGeometry(w + 0.1, h + 0.1, 0.4);
    const end1 = new THREE.Mesh(endGeo, frameMat);
    end1.position.set(0, h / 2, d / 2);
    const end2 = new THREE.Mesh(endGeo, frameMat);
    end2.position.set(0, h / 2, -d / 2);
    group.add(end1);
    group.add(end2);

    group.userData.collider = { type: 'box', size: new THREE.Vector3(w, h, d) };
    return group;
  }

  createStuntRamp() {
    const group = new THREE.Group();
    const w = 8.0;
    const l = 16.0;
    const h = 3.6;

    // Wedge ramp
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(l, 0);
    shape.lineTo(l, h);
    shape.closePath();

    const extrudeSettings = { depth: w, bevelEnabled: false };
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.translate(-l / 2, 0, -w / 2);

    const rampMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.6 });
    const mesh = new THREE.Mesh(geo, rampMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // Chevrons / arrows
    const arrowGeo = new THREE.PlaneGeometry(w * 0.8, 1.8);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const arrow = new THREE.Mesh(arrowGeo, arrowMat);
    arrow.rotation.x = -Math.atan2(h, l);
    arrow.position.set(0, h * 0.5 + 0.05, 0);
    group.add(arrow);

    group.userData.collider = { type: 'ramp', width: w, length: l, height: h };
    return group;
  }

  createNeonBillboard(title = 'SOLARA ENERGY', color = '#06b6d4', subtitle = 'POWER THE CITY') {
    const group = new THREE.Group();
    const tex = this.textures.createNeonSignTexture(title, color, subtitle);

    // Support pillars
    const legGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const leg1 = new THREE.Mesh(legGeo, legMat);
    leg1.position.set(-6, 7, 0);
    const leg2 = new THREE.Mesh(legGeo, legMat);
    leg2.position.set(6, 7, 0);
    group.add(leg1);
    group.add(leg2);

    // Billboard board
    const boardGeo = new THREE.BoxGeometry(20, 6.5, 0.8);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x090d16 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, 16, 0);
    group.add(board);

    // Front illuminated face
    const faceGeo = new THREE.PlaneGeometry(19.5, 6.0);
    const faceMat = new THREE.MeshBasicMaterial({ map: tex });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 16, 0.45);
    group.add(face);

    return group;
  }
}
