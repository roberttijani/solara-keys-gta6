export class ProceduralRadio {
  constructor(audioEngine, gameState) {
    this.audio = audioEngine;
    this.gameState = gameState;
    this.isPlaying = false;
    this.currentStation = 0; // 0: Synth, 1: Bassline, 2: Midnight, 3: Off
    this.stepIndex = 0;
    this.intervalId = null;

    this.gameState.on('radioChanged', (station) => {
      this.setStation(this.gameState.currentRadioIndex);
    });
  }

  setStation(index) {
    this.currentStation = index;
    if (this.currentStation === 3) {
      // Off
      this.stop();
    } else {
      if (!this.isPlaying) {
        this.start();
      }
    }
  }

  start() {
    this.audio.ensureContext();
    if (!this.audio.ctx) return;
    this.isPlaying = true;

    if (this.intervalId) clearInterval(this.intervalId);
    // 120 BPM sixteenth notes = 125ms per tick
    this.intervalId = setInterval(this.tick.bind(this), 125);
  }

  stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tick() {
    if (!this.isPlaying || !this.audio.ctx || this.audio.isMuted) return;
    const ctx = this.audio.ctx;
    const t = ctx.currentTime;
    const step = this.stepIndex % 16;
    this.stepIndex++;

    if (this.currentStation === 0) {
      // Solara Synth FM (120 BPM Outrun Synth)
      // Driving bass arp: A1, A1, C2, E2, F1, F1, A1, C2
      const bassNotes = [55, 55, 65.4, 82.4, 43.6, 43.6, 55, 65.4, 55, 55, 65.4, 82.4, 49.0, 49.0, 55, 65.4];
      this.playSynthNote(bassNotes[step], 'sawtooth', 0.12, 0.08, 300);

      // Drums
      if (step % 4 === 0) this.playKick(t);
      if (step % 8 === 4) this.playSnare(t);
      if (step % 2 === 0) this.playHiHat(t);

      // Lead melody
      if (step === 0 || step === 6 || step === 10) {
        const leadNotes = [220, 261.6, 329.6, 392.0];
        const note = leadNotes[(step + Math.floor(this.stepIndex / 16)) % leadNotes.length];
        this.playSynthNote(note, 'sine', 0.22, 0.06, 1200);
      }

    } else if (this.currentStation === 1) {
      // Coral Bassline (Funk Groove)
      const funkBass = [65.4, 0, 65.4, 77.78, 0, 87.3, 0, 65.4, 0, 58.2, 0, 65.4, 77.78, 0, 87.3, 98.0];
      if (funkBass[step] > 0) {
        this.playSynthNote(funkBass[step], 'triangle', 0.18, 0.12, 450);
      }
      if (step % 4 === 0) this.playKick(t);
      if (step === 4 || step === 12) this.playSnare(t);
      this.playHiHat(t);

    } else if (this.currentStation === 2) {
      // Midnight Coast (Dark Ambient)
      if (step === 0) {
        this.playSynthNote(43.6, 'sawtooth', 1.8, 0.08, 160); // Low F sub-bass
        this.playSynthNote(174.6, 'sine', 1.8, 0.04, 600); // Ethereal pad
      }
      if (step % 8 === 0) this.playKick(t);
    }
  }

  playSynthNote(freq, type, duration, gainAmount, filterFreq) {
    try {
      const ctx = this.audio.ctx;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, t);

      gain.gain.setValueAtTime(gainAmount, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + duration);
    } catch (e) {}
  }

  playKick(t) {
    try {
      const ctx = this.audio.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(32, t + 0.12);
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  playSnare(t) {
    try {
      const ctx = this.audio.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch (e) {}
  }

  playHiHat(t) {
    try {
      const ctx = this.audio.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(6500, t);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }
}
