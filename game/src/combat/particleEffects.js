import * as THREE from 'three';

export class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];

    // Shared materials
    this.sparkMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 });
    this.smokeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, transparent: true, opacity: 0.6, roughness: 1.0 });
    this.fireMat = new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.85 });
    this.waterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });

    // Shared geometries
    this.sparkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.35);
    this.smokeGeo = new THREE.SphereGeometry(0.4, 6, 6);
    this.fireGeo = new THREE.SphereGeometry(0.8, 8, 8);
  }

  spawnMuzzleFlash(pos, dir) {
    const flash = new THREE.PointLight(0xf59e0b, 3.5, 8.0);
    flash.position.copy(pos);
    this.scene.add(flash);

    setTimeout(() => {
      this.scene.remove(flash);
    }, 45);

    // Short spark burst
    for (let i = 0; i < 4; i++) {
      const spark = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      spark.position.copy(pos);
      const vel = dir.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4)).multiplyScalar(15 + Math.random() * 10);
      this.scene.add(spark);
      this.particles.push({ mesh: spark, vel, life: 0.12, maxLife: 0.12 });
    }
  }

  spawnTireSmoke(pos) {
    const smoke = new THREE.Mesh(this.smokeGeo, this.smokeMat);
    smoke.position.copy(pos);
    smoke.position.y += 0.2;
    this.scene.add(smoke);

    const vel = new THREE.Vector3((Math.random() - 0.5) * 1.5, 1.2 + Math.random() * 1.5, (Math.random() - 0.5) * 1.5);
    this.particles.push({ mesh: smoke, vel, life: 0.8, maxLife: 0.8, scaleRate: 2.2 });
  }

  spawnSparks(pos, normal = null) {
    for (let i = 0; i < 6; i++) {
      const spark = new THREE.Mesh(this.sparkGeo, this.sparkMat);
      spark.position.copy(pos);
      const vel = normal ? normal.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.5, (Math.random() - 0.5) * 1.5)).multiplyScalar(8 + Math.random() * 6)
                         : new THREE.Vector3((Math.random() - 0.5) * 10, Math.random() * 8, (Math.random() - 0.5) * 10);
      spark.lookAt(spark.position.clone().add(vel));
      this.scene.add(spark);
      this.particles.push({ mesh: spark, vel, life: 0.35, maxLife: 0.35, gravity: 18 });
    }
  }

  spawnExplosion(pos, radius = 6) {
    // Flash light
    const flash = new THREE.PointLight(0xf97316, 8.0, 35);
    flash.position.copy(pos);
    this.scene.add(flash);
    setTimeout(() => this.scene.remove(flash), 120);

    // Fireball puffs
    for (let i = 0; i < 12; i++) {
      const fire = new THREE.Mesh(this.fireGeo, this.fireMat);
      fire.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, Math.random() * 1.2, (Math.random() - 0.5) * 1.5));
      this.scene.add(fire);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 12, 4 + Math.random() * 8, (Math.random() - 0.5) * 12);
      this.particles.push({ mesh: fire, vel, life: 0.65, maxLife: 0.65, scaleRate: 3.5 });
    }

    // Heavy black/gray smoke plumes
    for (let i = 0; i < 8; i++) {
      const smoke = new THREE.Mesh(this.smokeGeo, this.smokeMat);
      smoke.position.copy(pos);
      this.scene.add(smoke);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 6, 6 + Math.random() * 6, (Math.random() - 0.5) * 6);
      this.particles.push({ mesh: smoke, vel, life: 1.4, maxLife: 1.4, scaleRate: 4.0 });
    }
  }

  spawnWaterSpray(pos) {
    for (let i = 0; i < 8; i++) {
      const drop = new THREE.Mesh(this.smokeGeo, this.waterMat);
      drop.position.copy(pos);
      this.scene.add(drop);
      const vel = new THREE.Vector3((Math.random() - 0.5) * 4, 3 + Math.random() * 4, (Math.random() - 0.5) * 4);
      this.particles.push({ mesh: drop, vel, life: 0.5, maxLife: 0.5, gravity: 12 });
    }
  }

  update(delta) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;

      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.mesh.position.addScaledVector(p.vel, delta);
      if (p.gravity) {
        p.vel.y -= p.gravity * delta;
      }

      // Growth & Fade
      if (p.scaleRate) {
        p.mesh.scale.addScalar(p.scaleRate * delta);
      }

      const alpha = p.life / p.maxLife;
      if (p.mesh.material && p.mesh.material.opacity !== undefined) {
        p.mesh.material.opacity = alpha;
      }
    }
  }
}
