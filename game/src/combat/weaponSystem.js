import * as THREE from 'three';

export class WeaponSystem {
  constructor(scene, gameState, particles, projectiles, cameraRig, audio) {
    this.scene = scene;
    this.gameState = gameState;
    this.particles = particles;
    this.projectiles = projectiles;
    this.cameraRig = cameraRig;
    this.audio = audio;

    this.cooldownTimer = 0;
    this.isReloading = false;
    this.reloadTimer = 0;
  }

  getCurrentWeapon() {
    return this.gameState.getCurrentWeapon();
  }

  isAutomatic() {
    const w = this.getCurrentWeapon();
    return w && (w.id === 'smg' || w.id === 'carbine');
  }

  fire(originPos, camera, shooterObj) {
    if (this.cooldownTimer > 0 || this.isReloading) return false;

    const weapon = this.getCurrentWeapon();
    if (!weapon) return false;

    // Melee check
    if (weapon.id === 'fists') {
      this.cooldownTimer = 0.35;
      if (this.audio) this.audio.playPunch();
      return true;
    }

    // Ammo check
    if (weapon.clip <= 0) {
      this.startReload();
      return false;
    }

    weapon.clip -= 1;
    this.gameState.emit('weaponChanged', weapon);

    // Aim direction from camera center
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);

    // Muzzle position slightly forward and to the right
    const muzzle = originPos.clone().add(new THREE.Vector3(0, 1.45, 0)).addScaledVector(dir, 0.8);

    // Recoil and audio
    if (weapon.id === 'pistol') {
      this.cooldownTimer = 0.28;
      this.particles.spawnMuzzleFlash(muzzle, dir);
      this.projectiles.spawnBullet(muzzle, dir, weapon.damage, shooterObj, 240);
      if (this.cameraRig) this.cameraRig.addShake(0.3, 0.15);
      if (this.audio) this.audio.playGunshot('pistol');
    } else if (weapon.id === 'smg') {
      this.cooldownTimer = 0.085;
      const spread = new THREE.Vector3((Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.06);
      const spreadDir = dir.clone().add(spread).normalize();
      this.particles.spawnMuzzleFlash(muzzle, spreadDir);
      this.projectiles.spawnBullet(muzzle, spreadDir, weapon.damage, shooterObj, 220);
      if (this.cameraRig) this.cameraRig.addShake(0.18, 0.08);
      if (this.audio) this.audio.playGunshot('smg');
    } else if (weapon.id === 'shotgun') {
      this.cooldownTimer = 0.75;
      this.particles.spawnMuzzleFlash(muzzle, dir);
      for (let i = 0; i < 6; i++) {
        const spread = new THREE.Vector3((Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.14, (Math.random() - 0.5) * 0.14);
        const pDir = dir.clone().add(spread).normalize();
        this.projectiles.spawnBullet(muzzle, pDir, weapon.damage / 4, shooterObj, 190);
      }
      if (this.cameraRig) this.cameraRig.addShake(0.7, 0.25);
      if (this.audio) this.audio.playGunshot('shotgun');
    } else if (weapon.id === 'carbine') {
      this.cooldownTimer = 0.12;
      this.particles.spawnMuzzleFlash(muzzle, dir);
      this.projectiles.spawnBullet(muzzle, dir, weapon.damage, shooterObj, 270);
      if (this.cameraRig) this.cameraRig.addShake(0.35, 0.12);
      if (this.audio) this.audio.playGunshot('carbine');
    }

    return true;
  }

  startReload() {
    const weapon = this.getCurrentWeapon();
    if (!weapon || weapon.id === 'fists' || this.isReloading) return;
    if (weapon.clip >= weapon.maxClip || weapon.ammo <= 0) return;

    this.isReloading = true;
    this.reloadTimer = 1.4;
    if (this.audio) this.audio.playReload();
  }

  update(delta) {
    if (this.cooldownTimer > 0) {
      this.cooldownTimer -= delta;
    }

    if (this.isReloading) {
      this.reloadTimer -= delta;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        const weapon = this.getCurrentWeapon();
        if (weapon) {
          const needed = weapon.maxClip - weapon.clip;
          const transfer = Math.min(needed, weapon.ammo);
          weapon.clip += transfer;
          weapon.ammo -= transfer;
          this.gameState.emit('weaponChanged', weapon);
        }
      }
    }
  }
}
