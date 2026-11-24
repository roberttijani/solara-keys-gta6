import * as THREE from 'three';
import { Engine } from './core/engine.js';
import { GameState } from './core/gameState.js';
import { InputManager } from './core/inputManager.js';
import { CameraRig } from './core/cameraRig.js';
import { SaveSystem } from './core/saveSystem.js';

import { RoadNetwork } from './world/roadNetwork.js';
import { CityGenerator } from './world/cityGenerator.js';
import { SkyAndLighting } from './world/skyAndLighting.js';
import { getDistrictAt } from './world/districts.js';

import { VehicleFactory } from './entities/vehicleFactory.js';
import { VehiclePhysics } from './entities/vehiclePhysics.js';
import { PlayerController } from './entities/playerController.js';
import { TrafficAI } from './entities/trafficAI.js';
import { PedestrianAI } from './entities/pedestrianAI.js';
import { PoliceAI } from './entities/policeAI.js';
import { HelicopterAI } from './entities/helicopterAI.js';

import { ParticleEffects } from './combat/particleEffects.js';
import { ProjectilePool } from './combat/projectilePool.js';
import { WeaponSystem } from './combat/weaponSystem.js';

import { AudioEngine } from './audio/audioEngine.js';
import { ProceduralRadio } from './audio/proceduralRadio.js';

import { MissionManager } from './missions/missionManager.js';

import { HUDRenderer } from './ui/hudRenderer.js';
import { Minimap } from './ui/minimap.js';
import { WorldMapOverlay } from './ui/worldMapOverlay.js';
import { ShopAndGarageUI } from './ui/shopAndGarageUI.js';
import { MenuSystem } from './ui/menuSystem.js';

class SolaraGame {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.engine = new Engine(this.container);
    this.gameState = new GameState();
    this.input = new InputManager(this.engine.renderer.domElement);
    this.cameraRig = new CameraRig(this.engine.camera, this.engine);
    this.saveSystem = new SaveSystem(this.gameState);

    // Audio
    this.audio = new AudioEngine();
    this.radio = new ProceduralRadio(this.audio, this.gameState);

    // World
    this.roadNetwork = new RoadNetwork();
    this.city = new CityGenerator(this.engine.scene, this.roadNetwork);
    this.sky = new SkyAndLighting(this.engine.scene);

    // Combat & Particles
    this.particles = new ParticleEffects(this.engine.scene);
    this.projectiles = new ProjectilePool(this.engine.scene, this.particles, this.city);
    this.weaponSystem = new WeaponSystem(
      this.engine.scene,
      this.gameState,
      this.particles,
      this.projectiles,
      this.cameraRig,
      this.audio
    );

    // Vehicles & AI
    this.vehicleFactory = new VehicleFactory();
    this.vehicles = [];

    this.player = new PlayerController(this.engine.scene, this.city, this.cameraRig, this.gameState);
    this.cameraRig.setTarget(this.player.group);

    this.trafficAI = new TrafficAI(this.engine.scene, this.roadNetwork, this.vehicleFactory, this.city);
    this.pedestrianAI = new PedestrianAI(this.engine.scene, this.city);
    this.policeAI = new PoliceAI(this.engine.scene, this.roadNetwork, this.vehicleFactory, this.city);
    this.helicopterAI = new HelicopterAI(this.engine.scene);

    for (let i = 0; i < this.trafficAI.vehicles.length; i++) {
      this.vehicles.push(this.trafficAI.vehicles[i]);
    }

    // Missions
    this.missions = new MissionManager(this.engine.scene, this.gameState, this.policeAI, this.helicopterAI);

    // UI
    this.hud = new HUDRenderer(this.gameState);
    this.minimap = new Minimap(document.getElementById('minimap-canvas'), this.roadNetwork, this.gameState);
    this.worldMap = new WorldMapOverlay(document.getElementById('world-map-modal'), this.gameState, this.roadNetwork);
    this.shopUI = new ShopAndGarageUI(this.gameState, this.saveSystem);
    this.menus = new MenuSystem(this.gameState, this.saveSystem, this.audio, this.radio);

    // Setup initial player vehicle & world state according to preset
    this.setupWorldState();

    // Hook update & render loops
    this.engine.addUpdateCallback(this.update.bind(this));
    this.engine.start();
  }

  setupWorldState() {
    const preset = this.gameState.activePreset;

    if (preset === 'cover') {
      // 01_cover_golden_drive: Third-person driving in sleek cyan Super GT along Neon Promenade at golden hour
      const gt = this.vehicleFactory.createVehicle('super_gt', 0x06b6d4);
      gt.position.set(178, 0.1, -60);
      gt.rotation.y = 0;
      this.engine.scene.add(gt);

      const gtPhys = new VehiclePhysics(gt, this.city, this.cameraRig);
      gtPhys.speed = 42; // ~74 MPH
      const vWrap = { group: gt, physics: gtPhys };
      this.vehicles.push(vWrap);

      this.player.enterVehicle(vWrap);
      this.cameraRig.applyPreset('cover', gt);
      this.sky.setTimeOfDay('golden_hour', 17.6);

      // Orange muscle coupe ahead in lane
      const npcCar = this.vehicleFactory.createVehicle('muscle_coupe', 0xf97316);
      npcCar.position.set(180, 0.1, -25);
      npcCar.rotation.y = 0;
      this.engine.scene.add(npcCar);
      const npcPhys = new VehiclePhysics(npcCar, this.city);
      npcPhys.speed = 40;
      this.vehicles.push({ group: npcCar, physics: npcPhys });
      this.coverNpcCar = { group: npcCar, physics: npcPhys };

      // Mission beacon ahead on boulevard
      this.missions.setWaypoint(180, 0.1, 70, 'Marina Safehouse Slip');

    } else if (preset === 'chase') {
      // 02_neon_police_chase: High intensity 4-star police chase at neon dusk on Coral Causeway
      const playerCar = this.vehicleFactory.createVehicle('super_gt', 0xec4899);
      playerCar.position.set(-40, 4.0, 50);
      playerCar.rotation.y = 0;
      this.engine.scene.add(playerCar);

      const phys = new VehiclePhysics(playerCar, this.city, this.cameraRig);
      phys.speed = 64; // ~115 MPH
      phys.isDrifting = true;
      const vWrap = { group: playerCar, physics: phys };
      this.vehicles.push(vWrap);

      this.player.enterVehicle(vWrap);
      this.cameraRig.applyPreset('chase', playerCar);
      this.sky.setTimeOfDay('neon_dusk', 20.2);

      // Cruiser 1 ramming player's left flank
      const c1 = this.vehicleFactory.createVehicle('scpd_cruiser');
      c1.position.set(-42.8, 4.0, 52);
      c1.rotation.y = 0.08;
      this.engine.scene.add(c1);
      const c1Phys = new VehiclePhysics(c1, this.city);
      c1Phys.speed = 64;
      this.policeAI.activeUnits.push({ group: c1, physics: c1Phys });
      this.chaseCruiser1 = { group: c1, physics: c1Phys };

      // Cruiser 2 right on right rear bumper
      const c2 = this.vehicleFactory.createVehicle('scpd_cruiser');
      c2.position.set(-37.2, 4.0, 48);
      c2.rotation.y = -0.05;
      this.engine.scene.add(c2);
      const c2Phys = new VehiclePhysics(c2, this.city);
      c2Phys.speed = 64;
      this.policeAI.activeUnits.push({ group: c2, physics: c2Phys });
      this.chaseCruiser2 = { group: c2, physics: c2Phys };

      // Police Chopper overhead projecting searchlight cone
      this.helicopterAI.setActive(true, playerCar.position);
      this.helicopterAI.group.position.set(-44, 25, 75);

      // Roadblock ahead on the bridge
      const rb1 = this.vehicleFactory.createVehicle('scpd_cruiser');
      rb1.position.set(-42, 4.0, 230);
      rb1.rotation.y = Math.PI / 4;
      const rb2 = this.vehicleFactory.createVehicle('scpd_cruiser');
      rb2.position.set(-38, 4.0, 230);
      rb2.rotation.y = -Math.PI / 4;
      this.engine.scene.add(rb1, rb2);

      // Drift smoke & sparks
      this.particles.spawnTireSmoke(new THREE.Vector3(-41, 4.0, 48));
      this.particles.spawnTireSmoke(new THREE.Vector3(-39, 4.0, 48));
      this.particles.spawnSparks(new THREE.Vector3(-42, 4.0, 51));

    } else if (preset === 'combat') {
      // 03_onfoot_combat_mission: On-foot combat in Puerto Solara harbor
      this.player.position.set(-330, 0.1, 140);
      this.player.group.position.set(-330, 0.1, 140);
      this.player.heading = -Math.PI * 0.25;
      this.player.group.rotation.y = -Math.PI * 0.25; // facing enemies at (-338, 148)
      this.sky.setTimeOfDay('sunset', 18.8);

      // Warm tactical rim/fill light on Mateo Cruz
      const fillLight = new THREE.PointLight(0xffedd5, 2.4, 18);
      fillLight.position.set(-328, 2.2, 139);
      this.engine.scene.add(fillLight);

      // Stealable Muscle Coupe right beside player
      const muscle = this.vehicleFactory.createVehicle('muscle_coupe', 0xf97316);
      muscle.position.set(-326.5, 0.1, 141.5);
      muscle.rotation.y = -Math.PI / 4;
      this.engine.scene.add(muscle);
      const mPhys = new VehiclePhysics(muscle, this.city);
      this.vehicles.push({ group: muscle, physics: mPhys });

      // Rival syndicate enemies taking cover behind cargo crates
      for (let g = 0; g < 2; g++) {
        const guard = this.pedestrianAI.createPedModel(0xef4444, 0x0f172a);
        guard.group.position.set(-338 - g * 3.5, 0.1, 148 + g * 2.5);
        guard.group.rotation.y = Math.PI * 0.25;
        this.engine.scene.add(guard.group);
      }

      // Mateo aiming with SMG + muzzle flash & tracer
      this.gameState.currentWeaponIndex = 2; // SMG
      this.gameState.contextPrompt = '[E] Enter Muscle Coupe';
      this.cameraRig.applyPreset('combat', this.player.group);

      const muzzlePos = new THREE.Vector3(-331.2, 1.45, 141.5);
      const shotDir = new THREE.Vector3(-0.85, 0.05, 0.52).normalize();
      this.particles.spawnMuzzleFlash(muzzlePos, shotDir);
      this.projectiles.spawnBullet(muzzlePos, shotDir, 22, this.player.group, 220);

      // Mission beacon pillar visible near the pier terminal
      this.missions.setWaypoint(-342, 0.1, 156, 'Neutralize Corales Captain');

      // Dock pedestrians fleeing
      this.pedestrianAI.triggerFlee(this.player.position, 65);

    } else if (preset === 'map') {
      // 04_world_map_progression: World Map overlay open over illuminated city at dusk
      this.sky.setTimeOfDay('neon_dusk', 21.0);
      this.worldMap.toggle(true);
      this.cameraRig.applyPreset('map', null);
    } else {
      // Freeplay
      const starterCar = this.vehicleFactory.createVehicle('super_gt', 0x06b6d4);
      starterCar.position.set(176, 0.1, -110);
      this.engine.scene.add(starterCar);
      const sPhys = new VehiclePhysics(starterCar, this.city);
      this.vehicles.push({ group: starterCar, physics: sPhys });
      this.sky.setTimeOfDay(this.gameState.timeOfDay, this.gameState.timeValue);
    }
  }

  update(delta) {
    if (this.input.consumeJustPressed('Escape')) {
      this.menus.togglePause();
    }
    if (this.gameState.isPaused) return;

    if (this.input.consumeJustPressed('KeyM')) {
      this.worldMap.toggle();
    }

    if (this.input.consumeJustPressed('KeyT')) {
      this.menus.cycleTimeOfDay();
    }

    if (this.input.consumeJustPressed('KeyQ')) {
      this.gameState.cycleRadio();
    }

    for (let k = 1; k <= 5; k++) {
      if (this.input.consumeJustPressed(`Digit${k}`)) {
        this.gameState.selectWeapon(k - 1);
      }
    }

    if (this.input.consumeJustPressed('KeyR')) {
      this.weaponSystem.startReload();
    }

    const playerPos = this.player.position;

    const curDist = getDistrictAt(playerPos.x, playerPos.z);
    this.gameState.setDistrict(curDist.name, curDist.id);

    this.gameState.update(delta);
    this.city.update(delta);
    if (!this.gameState.activePreset) {
      this.sky.setTimeOfDay(this.gameState.timeOfDay, this.gameState.timeValue);
    }
    this.sky.updateFollow(playerPos);

    this.player.update(delta, this.input, this.vehicles, this.weaponSystem);
    this.cameraRig.update(
      delta,
      this.input,
      this.player.isAiming,
      this.gameState.speedMph,
      this.gameState.nitroActive
    );

    // Keep preset companion vehicles synced
    if (this.gameState.activePreset === 'cover' && this.coverNpcCar) {
      this.coverNpcCar.group.position.set(this.player.position.x + 2, 0.1, this.player.position.z + 32);
      this.coverNpcCar.physics.speed = 42;
    } else if (this.gameState.activePreset === 'chase') {
      if (this.chaseCruiser1) {
        this.chaseCruiser1.group.position.set(this.player.position.x - 2.8, 4.0, this.player.position.z + 3.2);
        this.chaseCruiser1.group.rotation.y = 0.08;
        this.chaseCruiser1.physics.speed = 64;
      }
      if (this.chaseCruiser2) {
        this.chaseCruiser2.group.position.set(this.player.position.x + 2.8, 4.0, this.player.position.z - 1.5);
        this.chaseCruiser2.group.rotation.y = -0.05;
        this.chaseCruiser2.physics.speed = 64;
      }
      if (this.helicopterAI) {
        this.helicopterAI.group.position.set(this.player.position.x - 4, 25, this.player.position.z + 18);
        this.helicopterAI.update(delta, this.player.position);
      }
      this.particles.spawnTireSmoke(new THREE.Vector3(this.player.position.x - 0.8, 4.0, this.player.position.z - 1.8));
      this.particles.spawnTireSmoke(new THREE.Vector3(this.player.position.x + 0.8, 4.0, this.player.position.z - 1.8));
      this.particles.spawnSparks(new THREE.Vector3(this.player.position.x - 2.0, 4.0, this.player.position.z + 0.8));
    } else if (this.gameState.activePreset === 'combat') {
      this.player.armR.rotation.x = -Math.PI / 2;
      this.player.heading = -0.785;
      this.player.group.rotation.y = -0.785;
      const muzzlePos = new THREE.Vector3(-330.16, 1.45, 140.82);
      const shotDir = new THREE.Vector3(-0.707, 0.02, 0.707).normalize();
      this.particles.spawnMuzzleFlash(muzzlePos, shotDir);
      this.projectiles.spawnBullet(muzzlePos, shotDir, 22, this.player.group, 220);
    }

    this.weaponSystem.update(delta);
    this.particles.update(delta);
    this.projectiles.update(delta, this.vehicles);

    this.trafficAI.update(delta, playerPos);
    this.pedestrianAI.update(delta);
    if (this.gameState.activePreset !== 'chase') {
      this.policeAI.update(delta, playerPos, this.gameState.inVehicle);
    }
    if (this.gameState.activePreset !== 'chase') {
      this.helicopterAI.update(delta, playerPos);
    }

    this.missions.update(delta, playerPos);

    if (this.gameState.inVehicle) {
      this.audio.setEngineParams(Math.min(1.0, this.gameState.speedMph / 120), true);
    } else {
      this.audio.setEngineParams(0, false);
    }

    this.hud.update(delta);
    this.minimap.update(delta, playerPos, this.player.heading, this.policeAI.activeUnits);

    if (this.worldMap.isOpen) {
      this.worldMap.render(playerPos);
    }

    this.input.endFrame();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.solaraGame = new SolaraGame();
});
