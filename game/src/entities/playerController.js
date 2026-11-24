import * as THREE from 'three';

export class PlayerController {
  constructor(scene, cityGen, cameraRig, gameState) {
    this.scene = scene;
    this.city = cityGen;
    this.cameraRig = cameraRig;
    this.gameState = gameState;

    this.group = new THREE.Group();
    this.buildCharacterMesh();
    this.scene.add(this.group);

    this.position = this.group.position;
    this.rotation = this.group.rotation;

    // Default start location: Neon Promenade ocean boulevard
    this.position.set(176, 0.1, -80);

    this.velocity = new THREE.Vector3();
    this.heading = 0;
    this.isGrounded = true;
    this.verticalVelocity = 0;
    this.walkAnimTimer = 0;

    // Vehicle interaction
    this.currentVehicle = null;
    this.vehiclePhysics = null;

    this.isAiming = false;
  }

  buildCharacterMesh() {
    // Mateo Cruz: Navy stunt jacket, cyan coastal undershirt, dark jeans
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5 });
    const jeansMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

    // Torso & Jacket
    const torsoGeo = new THREE.BoxGeometry(0.72, 0.82, 0.42);
    const torso = new THREE.Mesh(torsoGeo, jacketMat);
    torso.position.y = 1.35;
    torso.castShadow = true;
    this.group.add(torso);

    // Inner shirt chest accent
    const shirtGeo = new THREE.BoxGeometry(0.32, 0.55, 0.05);
    const shirt = new THREE.Mesh(shirtGeo, shirtMat);
    shirt.position.set(0, 1.4, 0.2);
    this.group.add(shirt);

    // Head
    const headGeo = new THREE.BoxGeometry(0.38, 0.42, 0.38);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.95;
    head.castShadow = true;
    this.group.add(head);

    // Aviator Shades
    const shadesGeo = new THREE.BoxGeometry(0.34, 0.12, 0.08);
    const shadesMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const shades = new THREE.Mesh(shadesGeo, shadesMat);
    shades.position.set(0, 1.98, 0.2);
    this.group.add(shades);

    // Hair (Top and back of head)
    const hairGeo = new THREE.BoxGeometry(0.4, 0.26, 0.44);
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.9 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 2.06, -0.04);
    this.group.add(hair);

    // Jacket collar
    const collarGeo = new THREE.BoxGeometry(0.48, 0.16, 0.44);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 1.76, 0);
    this.group.add(collar);

    // Left & Right Arms
    const armGeo = new THREE.BoxGeometry(0.2, 0.7, 0.2);
    this.armL = new THREE.Mesh(armGeo, jacketMat);
    this.armL.position.set(-0.46, 1.32, 0);
    this.armL.castShadow = true;

    this.armR = new THREE.Mesh(armGeo, jacketMat);
    this.armR.position.set(0.46, 1.32, 0);
    this.armR.castShadow = true;

    // Tactical Weapon in hand
    const gunGeo = new THREE.BoxGeometry(0.12, 0.22, 0.48);
    const gunMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 });
    this.gunMesh = new THREE.Mesh(gunGeo, gunMat);
    this.gunMesh.position.set(0, -0.32, 0.2);
    this.armR.add(this.gunMesh);

    this.group.add(this.armL, this.armR);

    // Left & Right Legs
    const legGeo = new THREE.BoxGeometry(0.24, 0.85, 0.26);
    this.legL = new THREE.Mesh(legGeo, jeansMat);
    this.legL.position.set(-0.2, 0.48, 0);
    this.legL.castShadow = true;

    this.legR = new THREE.Mesh(legGeo, jeansMat);
    this.legR.position.set(0.2, 0.48, 0);
    this.legR.castShadow = true;
    this.group.add(this.legL, this.legR);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.25, 0.16, 0.38);
    const shoeL = new THREE.Mesh(shoeGeo, shoeMat);
    shoeL.position.set(-0.2, 0.08, 0.05);
    const shoeR = new THREE.Mesh(shoeGeo, shoeMat);
    shoeR.position.set(0.2, 0.08, 0.05);
    this.group.add(shoeL, shoeR);
  }

  update(delta, input, vehicles = [], weaponSystem = null) {
    if (this.gameState.inVehicle) {
      this.updateInVehicle(delta, input);
      return;
    }

    this.updateOnFoot(delta, input, vehicles, weaponSystem);
  }

  updateOnFoot(delta, input, vehicles, weaponSystem) {
    this.isAiming = input.mouse.rightDown || (this.gameState.activePreset === 'combat');

    // Movement input relative to camera
    const move = input.getMovementVector();
    let moveSpeed = (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) ? 9.2 : 4.8;
    if (this.isAiming) moveSpeed = 3.2;

    const camYaw = this.cameraRig ? this.cameraRig.yaw : 0;
    const forward = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw));
    const right = new THREE.Vector3(Math.cos(camYaw), 0, -Math.sin(camYaw));

    const moveDir = new THREE.Vector3()
      .addScaledVector(forward, move.forward)
      .addScaledVector(right, move.right);

    const isMoving = moveDir.lengthSq() > 0.01;
    if (isMoving) {
      moveDir.normalize();
      this.velocity.x = moveDir.x * moveSpeed;
      this.velocity.z = moveDir.z * moveSpeed;

      if (!this.isAiming) {
        const targetRot = Math.atan2(moveDir.x, moveDir.z);
        this.heading = THREE.MathUtils.lerp(this.heading, targetRot, delta * 12);
        this.group.rotation.y = this.heading;
      }
    } else {
      this.velocity.x = 0;
      this.velocity.z = 0;
    }

    if (this.isAiming) {
      if (!this.gameState.activePreset) {
        this.heading = THREE.MathUtils.lerp(this.heading, camYaw, delta * 16);
        this.group.rotation.y = this.heading;
      }
      // Aiming arm posture
      this.armR.rotation.x = -Math.PI / 2;
    } else {
      this.armR.rotation.x = 0;
    }

    // Jump & Gravity
    const groundH = this.city.getGroundHeight(this.position.x, this.position.z);
    if (this.isGrounded) {
      if (input.wasJustPressed('Space')) {
        this.verticalVelocity = 8.5;
        this.isGrounded = false;
      }
    } else {
      this.verticalVelocity -= 24 * delta;
      this.position.y += this.verticalVelocity * delta;

      if (this.position.y <= groundH) {
        this.position.y = groundH;
        this.verticalVelocity = 0;
        this.isGrounded = true;
      }
    }

    // Translate horizontal
    const nextX = this.position.x + this.velocity.x * delta;
    const nextZ = this.position.z + this.velocity.z * delta;

    if (!this.city.checkCollision(new THREE.Vector3(nextX, this.position.y, nextZ), 0.5)) {
      this.position.x = nextX;
      this.position.z = nextZ;
    }

    // Walking animation
    if (isMoving && this.isGrounded) {
      this.walkAnimTimer += delta * (moveSpeed * 1.6);
      this.legL.rotation.x = Math.sin(this.walkAnimTimer) * 0.65;
      this.legR.rotation.x = -Math.sin(this.walkAnimTimer) * 0.65;
      if (!this.isAiming) {
        this.armL.rotation.x = -Math.sin(this.walkAnimTimer) * 0.55;
        this.armR.rotation.x = Math.sin(this.walkAnimTimer) * 0.55;
      }
    } else {
      this.legL.rotation.x = 0;
      this.legR.rotation.x = 0;
      if (!this.isAiming) {
        this.armL.rotation.x = 0;
      }
    }

    // Check nearest vehicle for Enter / Steal
    let nearestVeh = null;
    let nearestDist = 5.0;
    for (let i = 0; i < vehicles.length; i++) {
      const v = vehicles[i];
      const d = this.position.distanceTo(v.group.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearestVeh = v;
      }
    }

    if (nearestVeh) {
      const typeName = (nearestVeh.group.userData.type || 'Vehicle').replace('_', ' ').toUpperCase();
      this.gameState.contextPrompt = `[E] Enter ${typeName}`;
      if (input.consumeJustPressed('KeyE') || input.consumeJustPressed('KeyF')) {
        this.enterVehicle(nearestVeh);
      }
    } else {
      if (this.gameState.contextPrompt && this.gameState.contextPrompt.startsWith('[E] Enter')) {
        this.gameState.contextPrompt = null;
      }
    }

    // Shooting
    if (weaponSystem && (input.mouse.leftJustPressed || (input.mouse.leftDown && weaponSystem.isAutomatic()))) {
      weaponSystem.fire(this.position, this.cameraRig.camera, this.group);
    }
  }

  enterVehicle(vehicleWrapper) {
    this.currentVehicle = vehicleWrapper;
    this.vehiclePhysics = vehicleWrapper.physics;
    this.gameState.inVehicle = true;
    this.gameState.currentVehicle = vehicleWrapper;
    this.gameState.contextPrompt = null;

    // Hide player model
    this.group.visible = false;

    // Attach camera to vehicle
    if (this.cameraRig) {
      this.cameraRig.setTarget(vehicleWrapper.group);
      this.cameraRig.setMode('driving');
    }
  }

  exitVehicle() {
    if (!this.currentVehicle) return;

    const carPos = this.currentVehicle.group.position;
    const carRot = this.currentVehicle.group.rotation.y;

    // Place player beside driver door
    const exitOffset = new THREE.Vector3(-1.8, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
    this.position.copy(carPos).add(exitOffset);
    this.position.y = this.city.getGroundHeight(this.position.x, this.position.z);

    this.group.visible = true;
    this.gameState.inVehicle = false;
    this.gameState.currentVehicle = null;
    this.gameState.speedMph = 0;

    if (this.cameraRig) {
      this.cameraRig.setTarget(this.group);
      this.cameraRig.setMode('onfoot');
    }

    this.currentVehicle = null;
    this.vehiclePhysics = null;
  }

  updateInVehicle(delta, input) {
    if (input.consumeJustPressed('KeyE') || input.consumeJustPressed('KeyF')) {
      this.exitVehicle();
      return;
    }

    if (this.vehiclePhysics) {
      this.vehiclePhysics.update(delta, input, true, this.gameState);
      // Keep player position synced with vehicle
      this.position.copy(this.currentVehicle.group.position);
    }
  }
}
