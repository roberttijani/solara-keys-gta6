import * as THREE from 'three';
import { STORY_MISSIONS } from './storyMissions.js';
import { SIDE_ACTIVITIES } from './sideActivities.js';

export class MissionManager {
  constructor(scene, gameState, policeAI, helicopterAI) {
    this.scene = scene;
    this.gameState = gameState;
    this.policeAI = policeAI;
    this.helicopterAI = helicopterAI;

    this.currentMissionIndex = 0;
    this.currentStepIndex = 0;
    this.activeMission = null;

    this.waypointMesh = null;
    this.createWaypointPillar();

    // Start with Mission 1 if no preset override
    if (!this.gameState.activePreset) {
      this.startMission(STORY_MISSIONS[0]);
    } else {
      this.setupPresetMission(this.gameState.activePreset);
    }
  }

  createWaypointPillar() {
    this.waypointGroup = new THREE.Group();

    // Tall vertical glowing beacon pillar
    const beamGeo = new THREE.CylinderGeometry(0.8, 0.8, 48, 16, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xec4899,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 24;
    this.waypointGroup.add(beam);

    // Floating rotating marker diamond
    const diamondGeo = new THREE.OctahedronGeometry(1.6);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xec4899,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    this.diamond = new THREE.Mesh(diamondGeo, diamondMat);
    this.diamond.position.y = 2.4;
    this.waypointGroup.add(this.diamond);

    // Ground ripple ring
    const ringGeo = new THREE.RingGeometry(2.4, 3.2, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xec4899, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    this.ring = new THREE.Mesh(ringGeo, ringMat);
    this.ring.position.y = 0.15;
    this.waypointGroup.add(this.ring);

    this.scene.add(this.waypointGroup);
    this.waypointGroup.visible = false;
  }

  setupPresetMission(preset) {
    if (preset === 'cover') {
      this.activeMission = STORY_MISSIONS[0];
      this.currentStepIndex = 0;
      this.setWaypoint(180, 0.1, 80, 'Marina Safehouse Slip');
    } else if (preset === 'chase') {
      this.activeMission = STORY_MISSIONS[3]; // Causeway Heat
      this.currentStepIndex = 1;
      this.setWaypoint(20, 0.2, 320, 'Reach Outer Key Marina');
      this.policeAI.setWantedLevel(4, new THREE.Vector3(-20, 3.8, 120));
      this.helicopterAI.setActive(true, new THREE.Vector3(-20, 3.8, 120));
    } else if (preset === 'combat') {
      this.activeMission = STORY_MISSIONS[1]; // Marina Repo
      this.currentStepIndex = 1;
      this.setWaypoint(-360, 0.1, 160, 'Neutralize Corales Guards');
    } else if (preset === 'map') {
      this.activeMission = STORY_MISSIONS[8]; // The Solara Vault
      this.currentStepIndex = 0;
      this.setWaypoint(-60, 0.1, -315, 'Solara Reserve Bank');
    }
  }

  startMission(mission) {
    this.activeMission = mission;
    this.currentStepIndex = 0;
    this.gameState.activeMission = mission;
    this.gameState.activeMissionStep = 0;

    this.gameState.setDialogue(mission.introSpeaker, mission.introDialogue, 8.0);
    this.advanceStep();
  }

  setWaypoint(x, y, z, label) {
    this.waypointGroup.position.set(x, y, z);
    this.waypointGroup.visible = true;
    this.gameState.activeWaypoint = { x, y, z, label };
  }

  advanceStep() {
    if (!this.activeMission) return;
    const steps = this.activeMission.steps;

    if (this.currentStepIndex >= steps.length) {
      // Mission Complete!
      this.completeMission();
      return;
    }

    const step = steps[this.currentStepIndex];
    if (step.pos) {
      this.setWaypoint(step.pos[0], step.pos[1], step.pos[2], step.label);
    }

    if (step.level !== undefined) {
      this.gameState.setWantedLevel(step.level);
    }

    if (step.dialogue) {
      this.gameState.setDialogue('Comms', step.dialogue, 6.0);
    }
  }

  completeMission() {
    const reward = this.activeMission.reward || 5000;
    this.gameState.addCash(reward);
    this.gameState.completedMissions.push(this.activeMission.id);
    this.gameState.setDialogue('Mission Passed!', `${this.activeMission.title} Completed! +$${reward}`, 6.0);
    this.waypointGroup.visible = false;
    this.gameState.activeWaypoint = null;

    // Advance to next story mission
    this.currentMissionIndex++;
    if (this.currentMissionIndex < STORY_MISSIONS.length) {
      setTimeout(() => {
        this.startMission(STORY_MISSIONS[this.currentMissionIndex]);
      }, 5000);
    }
  }

  update(delta, playerPos) {
    if (!playerPos) return;

    // Animate waypoint diamond and beam
    if (this.waypointGroup.visible) {
      this.diamond.rotation.y += delta * 2.5;
      this.diamond.position.y = 2.4 + Math.sin(Date.now() * 0.004) * 0.4;
      this.ring.rotation.z += delta * 1.5;

      // Check player proximity
      const wpPos = this.waypointGroup.position;
      const dist = new THREE.Vector2(playerPos.x - wpPos.x, playerPos.z - wpPos.z).length();

      const triggerRadius = this.gameState.inVehicle ? 7.5 : 4.0;
      if (dist < triggerRadius && !this.gameState.activePreset) {
        this.currentStepIndex++;
        this.advanceStep();
      }
    }
  }
}
