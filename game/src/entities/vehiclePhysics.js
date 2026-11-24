import * as THREE from 'three';

export class VehiclePhysics {
  constructor(vehicleGroup, cityGen, cameraRig = null) {
    this.vehicle = vehicleGroup;
    this.city = cityGen;
    this.cameraRig = cameraRig;

    const p = vehicleGroup.userData.physics || {
      maxSpeed: 120,
      acceleration: 42,
      brakeForce: 70,
      turnSpeed: 2.6,
      mass: 1500,
      driftFactor: 0.93
    };

    this.maxSpeed = p.maxSpeed;
    this.acceleration = p.acceleration;
    this.brakeForce = p.brakeForce;
    this.turnSpeed = p.turnSpeed;
    this.driftFactor = p.driftFactor;

    this.speed = 0; // units/sec (approx 1 unit = 1 meter, 1 mph = 0.447 m/s)
    this.steeringAngle = 0;
    this.heading = vehicleGroup.rotation.y;
    this.isDrifting = false;
    this.isAirborne = false;
    this.verticalVelocity = 0;
    this.airTime = 0;
    this.health = 100;
    this.sirenTimer = 0;
  }

  update(delta, input, isPlayer = false, gameState = null) {
    let throttle = 0;
    let steer = 0;
    let handbrake = false;
    let nitro = false;

    if (isPlayer && input) {
      if (input.isDown('KeyW') || input.isDown('ArrowUp')) throttle += 1;
      if (input.isDown('KeyS') || input.isDown('ArrowDown')) throttle -= 1;
      if (input.isDown('KeyA') || input.isDown('ArrowLeft')) steer += 1;
      if (input.isDown('KeyD') || input.isDown('ArrowRight')) steer -= 1;
      if (input.isDown('Space')) handbrake = true;
      if (input.isDown('ShiftLeft') || input.isDown('ShiftRight')) {
        if (gameState && gameState.nitro > 5) {
          nitro = true;
        }
      }
    }

    // Nitro handling
    let currentMaxSpeed = this.maxSpeed;
    let currentAccel = this.acceleration;
    if (nitro && gameState) {
      currentMaxSpeed *= 1.35;
      currentAccel *= 1.75;
      gameState.nitro = Math.max(0, gameState.nitro - delta * 30);
      gameState.nitroActive = true;
    } else if (gameState) {
      gameState.nitroActive = false;
    }

    // Speed regulation and presets lock
    if (gameState && gameState.activePreset === 'cover' && isPlayer) {
      this.speed = 42;
    } else if (gameState && gameState.activePreset === 'chase' && isPlayer) {
      this.speed = 64;
    } else if (throttle > 0) {
      if (this.speed < 0) {
        this.speed = Math.min(0, this.speed + this.brakeForce * delta);
      } else {
        this.speed = Math.min(currentMaxSpeed, this.speed + currentAccel * delta);
      }
    } else if (throttle < 0) {
      if (this.speed > 0) {
        this.speed = Math.max(0, this.speed - this.brakeForce * delta);
      } else {
        this.speed = Math.max(-currentMaxSpeed * 0.35, this.speed - currentAccel * 0.6 * delta);
      }
    } else {
      // Natural rolling friction
      this.speed *= Math.pow(0.96, delta * 60);
    }

    // Handbrake Drifting
    this.isDrifting = handbrake && Math.abs(this.speed) > 15;
    if (handbrake) {
      this.speed *= Math.pow(0.93, delta * 60);
    }

    // Steering
    const speedRatio = Math.min(1.0, Math.abs(this.speed) / 40);
    const targetSteer = steer * (this.isDrifting ? 1.4 : 1.0);
    this.steeringAngle = THREE.MathUtils.lerp(this.steeringAngle, targetSteer, delta * 10);

    if (Math.abs(this.speed) > 0.5) {
      const direction = this.speed >= 0 ? 1 : -1;
      const turnAmount = this.steeringAngle * this.turnSpeed * speedRatio * direction * delta;
      this.heading += turnAmount;
      this.vehicle.rotation.y = this.heading;
    }

    // Airborne & Suspension Physics
    const curPos = this.vehicle.position;
    const groundH = this.city.getGroundHeight(curPos.x, curPos.z);

    if (curPos.y > groundH + 0.1) {
      this.isAirborne = true;
      this.airTime += delta;
      this.verticalVelocity -= 28 * delta; // Gravity
      curPos.y += this.verticalVelocity * delta;

      if (curPos.y <= groundH) {
        // Landing
        curPos.y = groundH;
        this.isAirborne = false;
        if (this.airTime > 0.8 && isPlayer && gameState) {
          const reward = Math.round(this.airTime * 250);
          gameState.addCash(reward);
          gameState.setDialogue('Stunt Bonus!', `+$${reward} Big Air! (${this.airTime.toFixed(1)}s)`, 2.5);
          if (this.cameraRig) this.cameraRig.addShake(0.6, 0.4);
        }
        this.airTime = 0;
        this.verticalVelocity = 0;
      }
    } else {
      curPos.y = groundH;
      this.isAirborne = false;
    }

    // Translate along heading
    const moveDist = this.speed * delta;
    const forwardX = Math.sin(this.heading) * moveDist;
    const forwardZ = Math.cos(this.heading) * moveDist;

    const nextPos = curPos.clone();
    nextPos.x += forwardX;
    nextPos.z += forwardZ;

    // Check collisions with buildings / props
    if (this.city.checkCollision(nextPos, 1.4)) {
      // Impact!
      this.speed *= -0.3; // bounce back
      if (Math.abs(this.speed) > 10) {
        this.health = Math.max(0, this.health - 12);
        if (this.cameraRig) this.cameraRig.addShake(0.8, 0.35);
      }
    } else {
      curPos.copy(nextPos);
    }

    // Wheel spin & steer visuals
    const wheels = this.vehicle.userData.wheels;
    if (wheels && wheels.length >= 4) {
      const wheelRotDelta = (moveDist / 0.42);
      for (let i = 0; i < wheels.length; i++) {
        wheels[i].rotation.x += wheelRotDelta;
      }
      // Front wheels steering angle
      wheels[0].rotation.y = this.steeringAngle * 0.45;
      wheels[1].rotation.y = this.steeringAngle * 0.45;
    }

    // Police Flashing Lightbars
    const pLights = this.vehicle.userData.policeLights;
    if (pLights && pLights.length >= 4) {
      this.sirenTimer += delta * 12;
      const redFlash = Math.sin(this.sirenTimer) > 0;
      pLights[0].intensity = redFlash ? 3.0 : 0.2; // Red light
      pLights[1].intensity = redFlash ? 0.2 : 3.0; // Blue light
      pLights[2].material.emissiveIntensity = redFlash ? 2.5 : 0.3;
      pLights[3].material.emissiveIntensity = redFlash ? 0.3 : 2.5;
    }

    // Update speedometer in gameState
    if (isPlayer && gameState) {
      gameState.speedMph = Math.round(Math.abs(this.speed) * 1.8);
    }
  }
}
