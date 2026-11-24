import * as THREE from 'three';

export class HelicopterAI {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.buildChopperModel();
    this.scene.add(this.group);

    this.group.visible = false;
    this.altitude = 32;
    this.targetPos = new THREE.Vector3();
    this.rotorSpeed = 24.0;
    this.isActive = false;
  }

  buildChopperModel() {
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.6 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.8 });

    // Fuselage cabin
    const cabinGeo = new THREE.BoxGeometry(2.4, 2.2, 5.2);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.y = 1.2;
    cabin.castShadow = true;
    this.group.add(cabin);

    // White SCPD stripe
    const stripeGeo = new THREE.BoxGeometry(2.45, 0.45, 4.8);
    const stripe = new THREE.Mesh(stripeGeo, whiteMat);
    stripe.position.y = 1.1;
    this.group.add(stripe);

    // Bubble cockpit windshield
    const glassGeo = new THREE.ConeGeometry(1.2, 2.2, 8);
    glassGeo.rotateX(-Math.PI / 2);
    const glass = new THREE.Mesh(glassGeo, glassMat);
    glass.position.set(0, 1.2, 2.8);
    this.group.add(glass);

    // Tail boom
    const tailGeo = new THREE.CylinderGeometry(0.35, 0.55, 6.5, 8);
    tailGeo.rotateX(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeo, bodyMat);
    tail.position.set(0, 1.4, -4.8);
    tail.castShadow = true;
    this.group.add(tail);

    // Tail vertical fin
    const finGeo = new THREE.BoxGeometry(0.15, 1.6, 0.9);
    const fin = new THREE.Mesh(finGeo, whiteMat);
    fin.position.set(0, 2.0, -7.8);
    this.group.add(fin);

    // Skids (landing gear)
    const skidGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.0, 8);
    skidGeo.rotateX(Math.PI / 2);
    const skidMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const skidL = new THREE.Mesh(skidGeo, skidMat);
    skidL.position.set(-1.1, -0.2, 0);
    const skidR = new THREE.Mesh(skidGeo, skidMat);
    skidR.position.set(1.1, -0.2, 0);
    this.group.add(skidL, skidR);

    // Main Overhead Rotor Shaft
    const shaftGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const shaft = new THREE.Mesh(shaftGeo, skidMat);
    shaft.position.set(0, 2.5, 0.4);
    this.group.add(shaft);

    // Main Rotor Blades (4 blades)
    this.mainRotor = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.3, 0.05, 11.5);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
    const b1 = new THREE.Mesh(bladeGeo, bladeMat);
    const b2 = new THREE.Mesh(bladeGeo, bladeMat);
    b2.rotation.y = Math.PI / 2;
    this.mainRotor.add(b1, b2);
    this.mainRotor.position.set(0, 2.9, 0.4);
    this.group.add(this.mainRotor);

    // Tail Rotor
    this.tailRotor = new THREE.Group();
    const tBladeGeo = new THREE.BoxGeometry(0.15, 1.8, 0.04);
    const tb1 = new THREE.Mesh(tBladeGeo, bladeMat);
    this.tailRotor.add(tb1);
    this.tailRotor.position.set(0.25, 2.2, -7.9);
    this.group.add(this.tailRotor);

    // Volumetric Searchlight Cone
    const coneGeo = new THREE.ConeGeometry(7.5, 34, 24, 1, true);
    coneGeo.rotateX(Math.PI);
    coneGeo.translate(0, -17, 0);

    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.searchlightCone = new THREE.Mesh(coneGeo, coneMat);
    this.searchlightCone.position.set(0, 0.2, 1.5);
    this.group.add(this.searchlightCone);

    // Searchlight spot light
    this.spotLight = new THREE.SpotLight(0xffffff, 4.0, 75, Math.PI / 6, 0.5, 1.5);
    this.spotLight.position.set(0, 0.2, 1.5);
    this.group.add(this.spotLight);
    this.spotLightTarget = new THREE.Object3D();
    this.scene.add(this.spotLightTarget);
    this.spotLight.target = this.spotLightTarget;
  }

  setActive(active, playerPos = null) {
    this.isActive = active;
    this.group.visible = active;
    if (active && playerPos) {
      this.group.position.set(playerPos.x + 15, playerPos.y + this.altitude, playerPos.z + 25);
    }
  }

  update(delta, playerPos) {
    if (!this.isActive || !this.group.visible) return;

    // Spin rotors
    this.mainRotor.rotation.y += delta * this.rotorSpeed;
    this.tailRotor.rotation.x += delta * this.rotorSpeed * 1.5;

    if (playerPos) {
      // Hover orbit around player position
      const desiredPos = new THREE.Vector3(
        playerPos.x + Math.sin(Date.now() * 0.0006) * 22,
        playerPos.y + this.altitude + Math.sin(Date.now() * 0.0012) * 2.5,
        playerPos.z + Math.cos(Date.now() * 0.0006) * 22
      );

      this.group.position.lerp(desiredPos, delta * 2.2);

      // Face towards player
      const toPlayer = new THREE.Vector3().subVectors(playerPos, this.group.position);
      const angle = Math.atan2(toPlayer.x, toPlayer.z);
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, angle, delta * 3.5);

      // Bank tilt
      this.group.rotation.z = Math.sin(Date.now() * 0.001) * 0.12;
      this.group.rotation.x = 0.08; // slight nose-down flight posture

      // Point searchlight directly at player
      this.spotLightTarget.position.copy(playerPos);
      this.searchlightCone.lookAt(playerPos);
      this.searchlightCone.rotateX(-Math.PI / 2);
    }
  }
}
