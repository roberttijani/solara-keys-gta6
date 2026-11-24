import * as THREE from 'three';

export class OceanWater {
  constructor(size = 2800) {
    this.geometry = new THREE.PlaneGeometry(size, size, 128, 128);
    this.geometry.rotateX(-Math.PI / 2);

    this.uniforms = {
      uTime: { value: 0 },
      uSunDirection: { value: new THREE.Vector3(0.6, 0.4, 0.7).normalize() },
      uSunColor: { value: new THREE.Color(0xffedd5) },
      uDeepColor: { value: new THREE.Color(0x0c4a6e) },
      uShallowColor: { value: new THREE.Color(0x06b6d4) },
      uFoamColor: { value: new THREE.Color(0xf0fdfa) }
    };

    const vertexShader = `
      uniform float uTime;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveHeight;

      void main() {
        vec3 pos = position;
        
        // Multi-frequency coastal wave displacement
        float w1 = sin(pos.x * 0.04 + uTime * 1.8) * cos(pos.z * 0.04 + uTime * 1.4) * 0.45;
        float w2 = sin(pos.x * 0.12 - uTime * 2.2 + pos.z * 0.08) * 0.22;
        float w3 = cos(pos.z * 0.2 + uTime * 3.1) * 0.10;
        
        float wave = w1 + w2 + w3;
        pos.y += wave;
        vWaveHeight = wave;

        // Approximate wave normal
        float dX = 0.04 * cos(pos.x * 0.04 + uTime * 1.8) * cos(pos.z * 0.04 + uTime * 1.4) * 0.45;
        float dZ = -0.04 * sin(pos.x * 0.04 + uTime * 1.8) * sin(pos.z * 0.04 + uTime * 1.4) * 0.45;
        vNormal = normalize(vec3(-dX, 1.0, -dZ));

        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform vec3 uSunDirection;
      uniform vec3 uSunColor;
      uniform vec3 uDeepColor;
      uniform vec3 uShallowColor;
      uniform vec3 uFoamColor;

      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vWaveHeight;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);

        // Fresnel reflection factor
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.0);
        fresnel = clamp(fresnel, 0.15, 0.85);

        // Water depth color blend
        vec3 waterColor = mix(uDeepColor, uShallowColor, clamp(vWaveHeight * 1.5 + 0.4, 0.0, 1.0));

        // Sun specular highlight
        vec3 halfVec = normalize(uSunDirection + viewDir);
        float spec = pow(max(dot(normal, halfVec), 0.0), 128.0);
        vec3 specular = uSunColor * spec * 2.5;

        // Foam crests
        float foam = smoothstep(0.4, 0.65, vWaveHeight + sin(vWorldPosition.x * 0.5 + uTime * 2.0) * 0.1);
        vec3 finalColor = mix(waterColor, uFoamColor, foam * 0.7);
        finalColor += specular;
        finalColor = mix(finalColor, uShallowColor * 1.2, fresnel * 0.4);

        gl_FragColor = vec4(finalColor, 0.90);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = -0.4; // Just below ground level
    this.mesh.receiveShadow = true;
  }

  update(delta, sunDir = null, sunColor = null) {
    this.uniforms.uTime.value += delta;
    if (sunDir) this.uniforms.uSunDirection.value.copy(sunDir);
    if (sunColor) this.uniforms.uSunColor.value.copy(sunColor);
  }
}
