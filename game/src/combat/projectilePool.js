import * as THREE from 'three';

export class ProjectilePool {
  constructor(scene, particles, cityGen) {
    this.scene = scene;
    this.particles = particles;
    this.city = cityGen;

    this.projectiles = [];
    this.tracerGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4);
    this.tracerGeo.rotateX(Math.PI / 2);
    this.tracerMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  }

  spawnBullet(origin, direction, damage = 30, shooter = null, speed = 220) {
    const mesh = new THREE.Mesh(this.tracerGeo, this.tracerMat);
    mesh.position.copy(origin);
    mesh.lookAt(origin.clone().add(direction));
    this.scene.add(mesh);

    this.projectiles.push({
      mesh,
      velocity: direction.clone().multiplyScalar(speed),
      damage,
      shooter,
      life: 1.5,
      prevPos: origin.clone()
    });
  }

  update(delta, targetables = []) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      p.prevPos.copy(p.mesh.position);
      p.mesh.position.addScaledVector(p.velocity, delta);

      // Check collision with city buildings/props
      if (this.city.checkCollision(p.mesh.position, 0.2)) {
        this.particles.spawnSparks(p.mesh.position);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with water
      if (p.mesh.position.y <= -0.1) {
        this.particles.spawnWaterSpray(p.mesh.position);
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with vehicles and enemies
      let hit = false;
      for (let t = 0; t < targetables.length; t++) {
        const target = targetables[t];
        if (!target || target === p.shooter) continue;

        const targetPos = target.position || (target.group && target.group.position);
        if (!targetPos) continue;

        const dist = p.mesh.position.distanceTo(targetPos);
        const hitRadius = target.radius || 1.8;

        if (dist < hitRadius) {
          hit = true;
          this.particles.spawnSparks(p.mesh.position);

          if (target.takeDamage) {
            target.takeDamage(p.damage);
          } else if (target.health !== undefined) {
            target.health = Math.max(0, target.health - p.damage);
            if (target.health <= 0 && target.onDestroyed) {
              target.onDestroyed();
            }
          }
          break;
        }
      }

      if (hit) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }
}
