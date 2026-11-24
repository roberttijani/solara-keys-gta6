import * as THREE from 'three';

export class PedestrianAI {
  constructor(scene, cityGen) {
    this.scene = scene;
    this.city = cityGen;

    this.pedestrians = [];
    this.maxPeds = 20;

    this.spawnPedestrians();
  }

  createPedModel(shirtColor = 0xf43f5e, pantsColor = 0x1e293b) {
    const group = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.7 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });

    // Torso
    const torsoGeo = new THREE.BoxGeometry(0.6, 0.75, 0.35);
    const torso = new THREE.Mesh(torsoGeo, shirtMat);
    torso.position.y = 1.3;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.32, 0.36, 0.32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 1.85;
    head.castShadow = true;
    group.add(head);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.18, 0.65, 0.18);
    const armL = new THREE.Mesh(armGeo, shirtMat);
    armL.position.set(-0.38, 1.25, 0);
    const armR = new THREE.Mesh(armGeo, shirtMat);
    armR.position.set(0.38, 1.25, 0);
    group.add(armL, armR);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.22, 0.75, 0.22);
    const legL = new THREE.Mesh(legGeo, pantsMat);
    legL.position.set(-0.16, 0.45, 0);
    const legR = new THREE.Mesh(legGeo, pantsMat);
    legR.position.set(0.16, 0.45, 0);
    group.add(legL, legR);

    return { group, armL, armR, legL, legR };
  }

  spawnPedestrians() {
    const shirts = [0xf43f5e, 0x06b6d4, 0x10b981, 0xfbbf24, 0x8b5cf6, 0xffffff];
    const pants = [0x1e293b, 0x334155, 0x64748b, 0x0f172a];

    // Spawn on Neon Promenade sidewalks and beachfront
    for (let i = 0; i < this.maxPeds; i++) {
      const colS = shirts[i % shirts.length];
      const colP = pants[i % pants.length];
      const ped = this.createPedModel(colS, colP);

      // Distribute along promenade sidewalks
      const z = -200 + i * 16;
      const x = (i % 2 === 0) ? 168 : 206;
      ped.group.position.set(x, 0.1, z);
      this.scene.add(ped.group);

      this.pedestrians.push({
        ...ped,
        speed: 2.2 + Math.random() * 0.8,
        dir: (Math.random() > 0.5) ? 1 : -1,
        animTimer: Math.random() * 10,
        isFleeing: false,
        fleeTimer: 0,
        isAlive: true
      });
    }
  }

  triggerFlee(centerPos, radius = 35) {
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (!p.isAlive) continue;

      if (p.group.position.distanceTo(centerPos) < radius) {
        p.isFleeing = true;
        p.fleeTimer = 8.0;
        p.speed = 7.5; // sprint away
        // Face away from danger
        const away = new THREE.Vector3().subVectors(p.group.position, centerPos).normalize();
        p.group.rotation.y = Math.atan2(away.x, away.z);
      }
    }
  }

  update(delta) {
    for (let i = 0; i < this.pedestrians.length; i++) {
      const p = this.pedestrians[i];
      if (!p.isAlive) continue;

      if (p.isFleeing) {
        p.fleeTimer -= delta;
        if (p.fleeTimer <= 0) {
          p.isFleeing = false;
          p.speed = 2.4;
        }
        // Panicked arm posture (arms raised)
        p.armL.rotation.x = -Math.PI * 0.7;
        p.armR.rotation.x = -Math.PI * 0.7;
      }

      // Move along sidewalk
      p.animTimer += delta * (p.speed * 2.2);
      p.legL.rotation.x = Math.sin(p.animTimer) * 0.6;
      p.legR.rotation.x = -Math.sin(p.animTimer) * 0.6;
      if (!p.isFleeing) {
        p.armL.rotation.x = -Math.sin(p.animTimer) * 0.5;
        p.armR.rotation.x = Math.sin(p.animTimer) * 0.5;
      }

      if (!p.isFleeing) {
        p.group.position.z += p.speed * p.dir * delta;
        p.group.rotation.y = p.dir > 0 ? 0 : Math.PI;

        // Turn around at ends of strip
        if (p.group.position.z > 140) p.dir = -1;
        if (p.group.position.z < -220) p.dir = 1;
      } else {
        // Run forward in current heading
        p.group.position.x += Math.sin(p.group.rotation.y) * p.speed * delta;
        p.group.position.z += Math.cos(p.group.rotation.y) * p.speed * delta;
      }
    }
  }
}
