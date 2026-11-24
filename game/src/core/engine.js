import * as THREE from 'three';

export class Engine {
  constructor(canvasContainer) {
    this.container = canvasContainer || document.body;
    this.scene = new THREE.Scene();
    this.scene.background = null;

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.2,
      2500
    );
    this.camera.position.set(0, 10, 25);

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      stencil: false,
      depth: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();
    this.updateCallbacks = [];
    this.renderCallbacks = [];
    this.isRunning = false;
    this.fps = 60;
    this.deltaTime = 0;

    window.addEventListener('resize', this.onResize.bind(this));
  }

  onResize() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  setResolution(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  addUpdateCallback(cb) {
    this.updateCallbacks.push(cb);
  }

  addRenderCallback(cb) {
    this.renderCallbacks.push(cb);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(this.animate.bind(this));

    let delta = this.clock.getDelta();
    if (delta > 0.1) delta = 0.1; // clamp frame spikes
    this.deltaTime = delta;

    for (let i = 0; i < this.updateCallbacks.length; i++) {
      this.updateCallbacks[i](delta);
    }

    this.renderer.render(this.scene, this.camera);

    for (let i = 0; i < this.renderCallbacks.length; i++) {
      this.renderCallbacks[i](delta);
    }
  }
}
