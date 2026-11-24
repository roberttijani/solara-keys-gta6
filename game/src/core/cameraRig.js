import * as THREE from 'three';

export class CameraRig {
  constructor(camera, engine) {
    this.camera = camera;
    this.engine = engine;

    this.mode = 'onfoot'; // 'onfoot', 'driving', 'cinematic'
    this.target = null;

    // Angles
    this.yaw = 0;
    this.pitch = 0.15;
    this.distance = 4.0;
    this.height = 1.8;
    this.fov = 65;
    this.targetFov = 65;

    // Driving camera smoothing
    this.currentPosition = new THREE.Vector3();
    this.currentLookAt = new THREE.Vector3();

    // Camera shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeTimer = 0;

    this.isPresetLocked = false;
    this.presetTarget = null;
    this.presetCamOffset = null;
    this.presetLookAtOffset = null;
  }

  setTarget(target) {
    this.target = target;
  }

  setMode(mode) {
    if (this.isPresetLocked) return;
    this.mode = mode;
    if (mode === 'driving') {
      this.distance = 6.2;
      this.height = 2.2;
    } else if (mode === 'onfoot') {
      this.distance = 3.6;
      this.height = 1.7;
    }
  }

  addShake(intensity = 0.5, duration = 0.3) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }

  applyPreset(presetName, targetObj) {
    this.isPresetLocked = true;
    this.presetTarget = targetObj;

    if (presetName === 'cover') {
      // Dynamic tracking shot right behind the cyan Super GT in the foreground
      this.presetCamOffset = new THREE.Vector3(-1.3, 1.45, -5.0);
      this.presetLookAtOffset = new THREE.Vector3(0.3, 0.95, 14.0);
      this.camera.fov = 62;
    } else if (presetName === 'chase') {
      // Dynamic chase shot showing player drifting with SCPD cruisers flanking/ramming on Coral Causeway
      this.presetCamOffset = new THREE.Vector3(1.4, 2.2, -6.0);
      this.presetLookAtOffset = new THREE.Vector3(-0.2, 0.9, 14.0);
      this.camera.fov = 64;
    } else if (presetName === 'combat') {
      // True over-the-shoulder tactical aiming shot of Mateo Cruz engaging rival cartel
      this.presetCamOffset = new THREE.Vector3(2.6, 1.6, 0.1);
      this.presetLookAtOffset = new THREE.Vector3(-8.0, 1.3, 8.0);
      this.camera.fov = 58;
    } else if (presetName === 'map') {
      this.camera.position.set(120, 160, 140);
      this.camera.lookAt(0, 20, 0);
      this.camera.fov = 60;
    }
    this.camera.updateProjectionMatrix();
  }

  update(delta, input, isAiming = false, speedMph = 0, isNitro = false) {
    if (this.isPresetLocked) {
      if (this.presetTarget && this.presetCamOffset) {
        const tPos = this.presetTarget.position;
        this.camera.position.set(
          tPos.x + this.presetCamOffset.x,
          tPos.y + this.presetCamOffset.y,
          tPos.z + this.presetCamOffset.z
        );
        this.camera.lookAt(
          tPos.x + this.presetLookAtOffset.x,
          tPos.y + this.presetLookAtOffset.y,
          tPos.z + this.presetLookAtOffset.z
        );
      }
      return;
    }

    if (!this.target) return;

    if (input && input.mouse && input.mouse.isLocked) {
      const mouseSens = 0.0022;
      this.yaw -= input.mouse.dx * mouseSens;
      this.pitch -= input.mouse.dy * mouseSens;
      this.pitch = Math.max(-0.6, Math.min(0.9, this.pitch));
    }

    const targetPos = this.target.position ? this.target.position.clone() : this.target.clone();

    if (this.mode === 'driving') {
      const carRot = this.target.rotation ? this.target.rotation.y : 0;
      const backward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
      
      const speedFactor = Math.min(speedMph / 120, 1.0);
      const camDist = this.distance + speedFactor * 1.5;
      const camHeight = this.height + speedFactor * 0.4;

      this.targetFov = isNitro ? 78 : (65 + speedFactor * 8);

      const desiredPos = targetPos.clone().add(backward.clone().multiplyScalar(camDist));
      desiredPos.y += camHeight;

      if (Math.abs(this.yaw) > 0.01) {
        desiredPos.sub(targetPos);
        desiredPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        desiredPos.add(targetPos);
        this.yaw *= 0.96;
      }

      this.currentPosition.lerp(desiredPos, delta * 9);
      const lookTarget = targetPos.clone().add(new THREE.Vector3(0, 1.1, 0));
      this.currentLookAt.lerp(lookTarget, delta * 12);

      this.camera.position.copy(this.currentPosition);
      this.camera.lookAt(this.currentLookAt);

    } else if (this.mode === 'onfoot') {
      this.targetFov = isAiming ? 50 : 65;
      const dist = isAiming ? 2.2 : this.distance;
      const shoulderX = isAiming ? 0.65 : 0.45;

      const offset = new THREE.Vector3(
        shoulderX,
        this.height + Math.sin(this.pitch) * dist,
        Math.cos(this.pitch) * dist
      );
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);

      const desiredPos = targetPos.clone().add(offset);
      this.camera.position.lerp(desiredPos, delta * 18);

      const lookTarget = targetPos.clone().add(new THREE.Vector3(0, 1.4, 0));
      lookTarget.add(new THREE.Vector3(
        -Math.sin(this.yaw) * 10,
        Math.sin(this.pitch) * -10,
        -Math.cos(this.yaw) * 10
      ));
      this.camera.lookAt(lookTarget);
    }

    if (Math.abs(this.camera.fov - this.targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, this.targetFov, delta * 8);
      this.camera.updateProjectionMatrix();
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= delta;
      const progress = this.shakeTimer / this.shakeDuration;
      const curIntensity = this.shakeIntensity * progress;
      this.camera.position.x += (Math.random() - 0.5) * curIntensity * 0.4;
      this.camera.position.y += (Math.random() - 0.5) * curIntensity * 0.3;
      this.camera.position.z += (Math.random() - 0.5) * curIntensity * 0.4;
    }
  }
}
