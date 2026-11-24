import * as THREE from 'three';
import { VehiclePhysics } from './vehiclePhysics.js';

export class TrafficAI {
  constructor(scene, roadNetwork, vehicleFactory, cityGen) {
    this.scene = scene;
    this.roadNetwork = roadNetwork;
    this.factory = vehicleFactory;
    this.city = cityGen;

    this.vehicles = [];
    this.maxCars = 14;
    this.spawnInitialTraffic();
  }

  spawnInitialTraffic() {
    const types = ['coastal_sedan', 'super_gt', 'muscle_coupe'];
    for (let i = 0; i < this.maxCars; i++) {
      const node = this.roadNetwork.getRandomNode();
      if (!node) continue;

      const type = types[i % types.length];
      const group = this.factory.createVehicle(type);
      group.position.copy(node.pos);
      this.scene.add(group);

      const phys = new VehiclePhysics(group, this.city);
      const targetNode = this.roadNetwork.getNextWaypoint(node);

      this.vehicles.push({
        group,
        physics: phys,
        currentNode: node,
        targetNode,
        isPanicked: false,
        panicTimer: 0
      });
    }
  }

  triggerPanic(centerPos, radius = 45) {
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      if (v.group.position.distanceTo(centerPos) < radius) {
        v.isPanicked = true;
        v.panicTimer = 6.0;
        // Swerve
        v.physics.steeringAngle = (Math.random() - 0.5) * 1.5;
        v.physics.speed = Math.min(v.physics.maxSpeed, v.physics.speed + 25);
      }
    }
  }

  update(delta, playerPos) {
    for (let i = 0; i < this.vehicles.length; i++) {
      const v = this.vehicles[i];
      const carPos = v.group.position;

      // Handle panic decay
      if (v.isPanicked) {
        v.panicTimer -= delta;
        if (v.panicTimer <= 0) v.isPanicked = false;
      }

      // Check distance to target node
      if (v.targetNode) {
        const toTarget = new THREE.Vector3().subVectors(v.targetNode.pos, carPos);
        const dist = toTarget.length();

        if (dist < 8.0) {
          // Reached node, pick next
          const next = this.roadNetwork.getNextWaypoint(v.targetNode, v.currentNode);
          v.currentNode = v.targetNode;
          v.targetNode = next;
        } else {
          // Steer towards target node
          const desiredHeading = Math.atan2(toTarget.x, toTarget.z);
          let diff = desiredHeading - v.physics.heading;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;

          v.physics.steeringAngle = THREE.MathUtils.clamp(diff * 1.8, -1.0, 1.0);

          // Cruise speed
          const targetSpeed = v.isPanicked ? 55 : 32;
          if (v.physics.speed < targetSpeed) {
            v.physics.speed = Math.min(targetSpeed, v.physics.speed + 18 * delta);
          } else {
            v.physics.speed = Math.max(targetSpeed, v.physics.speed - 24 * delta);
          }
        }
      }

      // Update vehicle physics
      v.physics.update(delta, null, false);

      // Distance respawn if too far from player
      if (playerPos && carPos.distanceTo(playerPos) > 420) {
        const nearNode = this.roadNetwork.getNearestNode(playerPos);
        if (nearNode) {
          carPos.copy(nearNode.pos);
          v.currentNode = nearNode;
          v.targetNode = this.roadNetwork.getNextWaypoint(nearNode);
        }
      }
    }
  }
}
