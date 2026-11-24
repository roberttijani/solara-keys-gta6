import * as THREE from 'three';
import { VehiclePhysics } from './vehiclePhysics.js';

export class PoliceAI {
  constructor(scene, roadNetwork, vehicleFactory, cityGen) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.factory = vehicleFactory;
    this.city = cityGen;

    this.activeUnits = [];
    this.roadblocks = [];
    this.maxPolice = 5;
  }

  setWantedLevel(level, playerPos) {
    const desiredUnits = Math.min(this.maxPolice, level);

    // Spawn needed units
    while (this.activeUnits.length < desiredUnits) {
      this.spawnCruiser(playerPos);
    }

    // Despawn excess units if level drops
    while (this.activeUnits.length > desiredUnits) {
      const u = this.activeUnits.pop();
      this.scene.remove(u.group);
    }

    // Roadblock management for 3+ stars
    if (level >= 3 && this.roadblocks.length === 0 && playerPos) {
      this.spawnRoadblock(playerPos);
    } else if (level < 3 && this.roadblocks.length > 0) {
      this.clearRoadblocks();
    }
  }

  spawnCruiser(playerPos) {
    const cruiser = this.factory.createVehicle('scpd_cruiser');
    // Spawn 80-120m away from player along a road node
    let spawnPos = new THREE.Vector3(180, 0.1, -150);
    if (playerPos) {
      const node = this.roadNetwork.getNearestNode(playerPos);
      if (node) {
        spawnPos = node.pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 60, 0, (Math.random() - 0.5) * 60));
      }
    }
    cruiser.position.copy(spawnPos);
    this.scene.add(cruiser);

    const physics = new VehiclePhysics(cruiser, this.city);
    physics.speed = 40;

    this.activeUnits.push({
      group: cruiser,
      physics,
      isAggressive: true
    });
  }

  spawnRoadblock(playerPos) {
    // Spawn two crossed SCPD cruisers and barriers ~90m ahead of player
    const rbGroup = new THREE.Group();
    const c1 = this.factory.createVehicle('scpd_cruiser');
    c1.position.set(-6, 0.1, 0);
    c1.rotation.y = Math.PI / 4;
    const c2 = this.factory.createVehicle('scpd_cruiser');
    c2.position.set(6, 0.1, 0);
    c2.rotation.y = -Math.PI / 4;
    rbGroup.add(c1, c2);

    // Position roadblock on causeway or boulevard ahead
    const ahead = playerPos ? new THREE.Vector3(playerPos.x, 0.1, playerPos.z + 85) : new THREE.Vector3(180, 0.1, 0);
    rbGroup.position.copy(ahead);
    this.scene.add(rbGroup);
    this.roadblocks.push(rbGroup);
  }

  clearRoadblocks() {
    for (let i = 0; i < this.roadblocks.length; i++) {
      this.scene.remove(this.roadblocks[i]);
    }
    this.roadblocks = [];
  }

  update(delta, playerPos, playerInVehicle = false) {
    if (!playerPos) return;

    for (let i = 0; i < this.activeUnits.length; i++) {
      const u = this.activeUnits[i];
      const carPos = u.group.position;

      // Vector to player
      const toPlayer = new THREE.Vector3().subVectors(playerPos, carPos);
      const dist = toPlayer.length();

      // Steering towards player / ramming trajectory
      const targetAngle = Math.atan2(toPlayer.x, toPlayer.z);
      let diff = targetAngle - u.physics.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      u.physics.steeringAngle = THREE.MathUtils.clamp(diff * 2.2, -1.0, 1.0);

      // Speed regulation
      if (dist > 15) {
        // Full throttle intercept
        u.physics.speed = Math.min(u.physics.maxSpeed, u.physics.speed + 35 * delta);
      } else {
        // Ramming or box-in
        u.physics.speed = Math.min(50, u.physics.speed);
      }

      u.physics.update(delta, null, false);
    }
  }
}
