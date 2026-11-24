import * as THREE from 'three';

export class SkyAndLighting {
  constructor(scene) {
    this.scene = scene;

    // Atmospheric Fog
    this.fog = new THREE.FogExp2(0xfb923c, 0.0012);
    this.scene.fog = this.fog;

    // Hemisphere Light (sky / ground bounce)
    this.hemiLight = new THREE.HemisphereLight(0xffedd5, 0x7c2d12, 0.85);
    this.scene.add(this.hemiLight);

    // Directional Sun / Moon
    this.sunLight = new THREE.DirectionalLight(0xffedd5, 2.2);
    this.sunLight.position.set(240, 110, 280);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 1000;
    const d = 260;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.scene.add(this.sunLight);

    // Sun target
    this.sunTarget = new THREE.Object3D();
    this.sunTarget.position.set(0, 0, 0);
    this.scene.add(this.sunTarget);
    this.sunLight.target = this.sunTarget;

    // Ambient fill
    this.ambientLight = new THREE.AmbientLight(0x38bdf8, 0.45);
    this.scene.add(this.ambientLight);

    // Sky Dome Mesh
    this.createSkyDome();
  }

  createSkyDome() {
    const geo = new THREE.SphereGeometry(1400, 32, 24);

    this.skyUniforms = {
      uZenithColor: { value: new THREE.Color(0x0284c7) },
      uHorizonColor: { value: new THREE.Color(0xfb923c) },
      uGroundColor: { value: new THREE.Color(0x1e1b4b) },
      uSunPos: { value: new THREE.Vector3(0.6, 0.25, 0.7).normalize() },
      uSunColor: { value: new THREE.Color(0xffedd5) },
      uNightFactor: { value: 0.0 }
    };

    const vertexShader = `
      varying vec3 vViewDir;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vViewDir = normalize(worldPosition.xyz - cameraPosition);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      uniform vec3 uZenithColor;
      uniform vec3 uHorizonColor;
      uniform vec3 uGroundColor;
      uniform vec3 uSunPos;
      uniform vec3 uSunColor;
      uniform float uNightFactor;

      varying vec3 vViewDir;

      void main() {
        vec3 dir = vViewDir;
        float h = dir.y;

        // Gradient from ground to horizon to zenith
        vec3 skyColor = mix(uHorizonColor, uZenithColor, clamp(pow(max(h, 0.0), 0.5), 0.0, 1.0));
        if (h < 0.0) {
          skyColor = mix(uHorizonColor, uGroundColor, clamp(-h * 2.5, 0.0, 1.0));
        }

        // Sun disc + atmospheric glow
        float sunDot = max(dot(dir, uSunPos), 0.0);
        float sunDisc = smoothstep(0.998, 0.9995, sunDot);
        float sunGlow = pow(sunDot, 12.0) * 0.75 + pow(sunDot, 48.0) * 1.1;
        vec3 finalColor = skyColor + uSunColor * (sunDisc * 4.0 + sunGlow * 1.5);

        // Night stars
        if (uNightFactor > 0.1 && h > 0.05) {
          float star = sin(dir.x * 240.0) * sin(dir.y * 310.0) * cos(dir.z * 270.0);
          if (star > 0.985) {
            finalColor += vec3(0.9, 0.95, 1.0) * uNightFactor * (star - 0.985) * 55.0;
          }
        }

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyDome = new THREE.Mesh(geo, mat);
    this.scene.add(this.skyDome);
  }

  setTimeOfDay(timeOfDay, timeValue = 17.5) {
    if (timeOfDay === 'golden_hour') {
      // Warm golden glow, long shadows
      this.skyUniforms.uZenithColor.value.setHex(0x0284c7);
      this.skyUniforms.uHorizonColor.value.setHex(0xfb923c);
      this.skyUniforms.uGroundColor.value.setHex(0x1e1b4b);
      this.skyUniforms.uSunColor.value.setHex(0xffedd5);
      this.skyUniforms.uNightFactor.value = 0.0;

      this.sunLight.color.setHex(0xffedd5);
      this.sunLight.intensity = 2.4;
      this.sunLight.position.set(240, 110, 280);

      this.hemiLight.color.setHex(0xffedd5);
      this.hemiLight.groundColor.setHex(0x7c2d12);
      this.hemiLight.intensity = 0.9;

      this.ambientLight.color.setHex(0x0284c7);
      this.ambientLight.intensity = 0.55;

      this.fog.color.setHex(0xfb923c);
      this.fog.density = 0.0012;

    } else if (timeOfDay === 'sunset') {
      // Fiery orange / violet skyline
      this.skyUniforms.uZenithColor.value.setHex(0x312e81);
      this.skyUniforms.uHorizonColor.value.setHex(0xec4899);
      this.skyUniforms.uGroundColor.value.setHex(0x090514);
      this.skyUniforms.uSunColor.value.setHex(0xf97316);
      this.skyUniforms.uNightFactor.value = 0.2;

      this.sunLight.color.setHex(0xf97316);
      this.sunLight.intensity = 2.0;
      this.sunLight.position.set(300, 70, 240);

      this.hemiLight.color.setHex(0xf43f5e);
      this.hemiLight.groundColor.setHex(0x1e1b4b);
      this.hemiLight.intensity = 0.8;

      this.ambientLight.color.setHex(0x8b5cf6);
      this.ambientLight.intensity = 0.55;

      this.fog.color.setHex(0xc026d3);
      this.fog.density = 0.0015;

    } else if (timeOfDay === 'neon_dusk') {
      // Midnight violet with bright cyan/magenta rooftop contrast
      this.skyUniforms.uZenithColor.value.setHex(0x0f172a);
      this.skyUniforms.uHorizonColor.value.setHex(0x4c1d95);
      this.skyUniforms.uGroundColor.value.setHex(0x020617);
      this.skyUniforms.uSunColor.value.setHex(0x38bdf8);
      this.skyUniforms.uNightFactor.value = 0.65;

      this.sunLight.color.setHex(0x38bdf8);
      this.sunLight.intensity = 1.2;
      this.sunLight.position.set(-160, 180, -220);

      this.hemiLight.color.setHex(0xc084fc);
      this.hemiLight.groundColor.setHex(0x0284c7);
      this.hemiLight.intensity = 0.7;

      this.ambientLight.color.setHex(0x06b6d4);
      this.ambientLight.intensity = 0.7;

      this.fog.color.setHex(0x1e1b4b);
      this.fog.density = 0.0016;

    } else { // Midnight
      this.skyUniforms.uZenithColor.value.setHex(0x020617);
      this.skyUniforms.uHorizonColor.value.setHex(0x0f172a);
      this.skyUniforms.uGroundColor.value.setHex(0x000000);
      this.skyUniforms.uSunColor.value.setHex(0x93c5fd);
      this.skyUniforms.uNightFactor.value = 1.0;

      this.sunLight.color.setHex(0x93c5fd);
      this.sunLight.intensity = 0.6;
      this.sunLight.position.set(-120, 240, -100);

      this.hemiLight.color.setHex(0x1e293b);
      this.hemiLight.groundColor.setHex(0x090d16);
      this.hemiLight.intensity = 0.5;

      this.ambientLight.color.setHex(0x0284c7);
      this.ambientLight.intensity = 0.5;

      this.fog.color.setHex(0x090d16);
      this.fog.density = 0.0018;
    }

    const sunDir = this.sunLight.position.clone().normalize();
    this.skyUniforms.uSunPos.value.copy(sunDir);
  }

  updateFollow(targetPos) {
    if (targetPos) {
      this.skyDome.position.copy(targetPos);
      this.sunTarget.position.copy(targetPos);
    }
  }
}
