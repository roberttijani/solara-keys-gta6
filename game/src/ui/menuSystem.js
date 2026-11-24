export class MenuSystem {
  constructor(gameState, saveSystem, audioEngine, radio) {
    this.gameState = gameState;
    this.saveSystem = saveSystem;
    this.audio = audioEngine;
    this.radio = radio;

    this.startScreen = document.getElementById('start-screen');
    this.pauseMenu = document.getElementById('pause-menu');
    this.controlsModal = document.getElementById('controls-modal');

    this.isPaused = false;
    this.hasStarted = !!this.gameState.activePreset;

    this.initDOM();
  }

  initDOM() {
    // Start button
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    // Preset quick launchers on start screen
    const presetBtns = document.querySelectorAll('.btn-preset-launch');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const p = e.target.dataset.preset;
        if (p) {
          window.location.search = `?preset=${p}`;
        }
      });
    });

    // Pause menu buttons
    document.getElementById('btn-resume')?.addEventListener('click', () => this.togglePause(false));
    document.getElementById('btn-controls')?.addEventListener('click', () => this.showControls(true));
    document.getElementById('controls-close-btn')?.addEventListener('click', () => this.showControls(false));
    document.getElementById('btn-time-cycle')?.addEventListener('click', () => this.cycleTimeOfDay());

    // If preset is active, auto-hide start screen
    if (this.hasStarted && this.startScreen) {
      this.startScreen.classList.add('hidden');
    }
  }

  startGame() {
    this.hasStarted = true;
    if (this.startScreen) {
      this.startScreen.classList.add('hidden');
    }
    if (this.audio) {
      this.audio.init();
      this.audio.ensureContext();
    }
    if (this.radio) {
      this.radio.start();
    }
  }

  togglePause(force = null) {
    if (!this.hasStarted) return;
    this.isPaused = force !== null ? force : !this.isPaused;
    this.gameState.isPaused = this.isPaused;

    if (this.pauseMenu) {
      if (this.isPaused) {
        this.pauseMenu.classList.remove('hidden');
      } else {
        this.pauseMenu.classList.add('hidden');
      }
    }
  }

  showControls(show) {
    if (this.controlsModal) {
      if (show) this.controlsModal.classList.remove('hidden');
      else this.controlsModal.classList.add('hidden');
    }
  }

  cycleTimeOfDay() {
    const times = ['golden_hour', 'sunset', 'neon_dusk', 'midnight'];
    const curIdx = times.indexOf(this.gameState.timeOfDay);
    const nextIdx = (curIdx + 1) % times.length;
    this.gameState.timeOfDay = times[nextIdx];
    this.gameState.emit('timeChanged', this.gameState.timeOfDay);
  }
}
