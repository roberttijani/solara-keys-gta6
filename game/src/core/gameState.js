export class GameState {
  constructor() {
    this.listeners = new Map();

    // Core Player Stats
    this.health = 100;
    this.maxHealth = 100;
    this.armor = 100;
    this.maxArmor = 100;
    this.cash = 18450;
    this.wantedLevel = 0; // 0 to 5
    this.wantedDecayTimer = 0;

    // Movement & Vehicle State
    this.inVehicle = false;
    this.currentVehicle = null;
    this.speedMph = 0;
    this.nitro = 100;
    this.maxNitro = 100;
    this.nitroActive = false;

    // District & Location
    this.currentDistrict = 'Neon Promenade';
    this.currentDistrictId = 'neon_promenade';

    // Time of Day
    // Options: 'golden_hour', 'sunset', 'neon_dusk', 'midnight'
    this.timeOfDay = 'golden_hour';
    this.timeCycleSpeed = 0.005; // slow realistic progression
    this.timeValue = 17.5; // 17:30 (golden hour)

    // Weapons
    this.currentWeaponIndex = 1; // 0: Fists, 1: 9mm Pistol, 2: SMG, 3: Shotgun, 4: Carbine
    this.weapons = [
      { id: 'fists', name: 'Fists', ammo: Infinity, clip: Infinity, maxClip: 1 },
      { id: 'pistol', name: '9mm Coastal', ammo: 96, clip: 12, maxClip: 12, damage: 28 },
      { id: 'smg', name: 'Vance Micro-SMG', ammo: 240, clip: 30, maxClip: 30, damage: 22 },
      { id: 'shotgun', name: 'Tactical Breaker', ammo: 36, clip: 6, maxClip: 6, damage: 85 },
      { id: 'carbine', name: 'Apex Pulse Carbine', ammo: 180, clip: 30, maxClip: 30, damage: 38 }
    ];

    // Radio
    this.radioStations = [
      { id: 'synth', name: 'Solara Synth FM', genre: 'Outrun / Retrowave' },
      { id: 'bass', name: 'Coral Bassline', genre: 'Latin Wave / Electro Funk' },
      { id: 'midnight', name: 'Midnight Coast', genre: 'Dark Ambient / Synth' },
      { id: 'off', name: 'Radio Off', genre: 'Silence' }
    ];
    this.currentRadioIndex = 0;

    // Missions
    this.activeMission = null;
    this.activeMissionStep = 0;
    this.completedMissions = [];
    this.activeWaypoint = null; // { x, y, z, label, type }
    this.dialogueText = '';
    this.dialogueSpeaker = '';
    this.dialogueTimer = 0;

    // UI state
    this.isMapOpen = false;
    this.isPaused = false;
    this.contextPrompt = null; // e.g. "[E] Steal Super GT" or "[E] Safehouse Garage"

    // Presets check
    this.activePreset = this.detectPreset();
    this.applyPreset(this.activePreset);
  }

  detectPreset() {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('preset');
  }

  applyPreset(preset) {
    if (!preset) return;
    if (preset === 'cover') {
      this.timeOfDay = 'golden_hour';
      this.timeValue = 17.6;
      this.currentDistrict = 'Neon Promenade';
      this.currentDistrictId = 'neon_promenade';
      this.inVehicle = true;
      this.speedMph = 74;
      this.wantedLevel = 0;
      this.currentRadioIndex = 0;
      this.cash = 24850;
      this.activeWaypoint = { x: 120, y: 1.5, z: -80, label: 'Safehouse Marina Slip', type: 'mission' };
      this.dialogueSpeaker = 'Elena Vance';
      this.dialogueText = 'Mateo, drop the GT off at the Marina slip before Corales spot you.';
      this.dialogueTimer = 9999;
    } else if (preset === 'chase') {
      this.timeOfDay = 'neon_dusk';
      this.timeValue = 20.2;
      this.currentDistrict = 'Coral Causeway';
      this.currentDistrictId = 'coral_causeway';
      this.inVehicle = true;
      this.speedMph = 112;
      this.nitroActive = true;
      this.nitro = 75;
      this.wantedLevel = 4;
      this.cash = 38900;
      this.activeWaypoint = { x: -450, y: 2.0, z: 20, label: 'Evade SCPD Perimeter', type: 'escape' };
      this.dialogueSpeaker = 'SCPD Dispatch';
      this.dialogueText = 'All units: Air-1 is on visual. Deploy causeway spike strips immediately!';
      this.dialogueTimer = 9999;
    } else if (preset === 'combat') {
      this.timeOfDay = 'sunset';
      this.timeValue = 18.8;
      this.currentDistrict = 'Puerto Solara';
      this.currentDistrictId = 'puerto_solara';
      this.inVehicle = false;
      this.wantedLevel = 2;
      this.currentWeaponIndex = 2; // SMG
      this.health = 82;
      this.armor = 65;
      this.cash = 31200;
      this.contextPrompt = '[E] Hijack Muscle Coupe';
      this.activeWaypoint = { x: -160, y: 1.5, z: 180, label: 'Neutralize Guard Captain', type: 'combat' };
      this.dialogueSpeaker = 'Elena Vance';
      this.dialogueText = 'Two Corales enforcers behind the cargo crates! Clear them out!';
      this.dialogueTimer = 9999;
    } else if (preset === 'map') {
      this.timeOfDay = 'neon_dusk';
      this.timeValue = 21.0;
      this.currentDistrict = 'Downtown Spire';
      this.currentDistrictId = 'downtown_spire';
      this.isMapOpen = true;
      this.wantedLevel = 3;
      this.cash = 45000;
      this.activeWaypoint = { x: 0, y: 2.0, z: -350, label: 'The Solara Vault', type: 'heist' };
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      const cbs = this.listeners.get(event);
      for (let i = 0; i < cbs.length; i++) {
        cbs[i](data);
      }
    }
  }

  setDistrict(name, id) {
    if (this.currentDistrictId !== id) {
      this.currentDistrict = name;
      this.currentDistrictId = id;
      this.emit('districtChanged', { name, id });
    }
  }

  setWantedLevel(level) {
    level = Math.max(0, Math.min(5, Math.floor(level)));
    if (this.wantedLevel !== level) {
      this.wantedLevel = level;
      this.emit('wantedChanged', level);
    }
  }

  addCash(amount) {
    this.cash += amount;
    this.emit('cashChanged', this.cash);
  }

  takeDamage(amount) {
    if (this.armor > 0) {
      const absorbed = Math.min(this.armor, amount);
      this.armor -= absorbed;
      amount -= absorbed;
    }
    if (amount > 0) {
      this.health = Math.max(0, this.health - amount);
    }
    this.emit('healthChanged', { health: this.health, armor: this.armor });
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
    this.emit('healthChanged', { health: this.health, armor: this.armor });
  }

  restoreArmor(amount) {
    this.armor = Math.min(this.maxArmor, this.armor + amount);
    this.emit('healthChanged', { health: this.health, armor: this.armor });
  }

  cycleWeapon() {
    this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
    this.emit('weaponChanged', this.weapons[this.currentWeaponIndex]);
  }

  selectWeapon(index) {
    if (index >= 0 && index < this.weapons.length) {
      this.currentWeaponIndex = index;
      this.emit('weaponChanged', this.weapons[this.currentWeaponIndex]);
    }
  }

  getCurrentWeapon() {
    return this.weapons[this.currentWeaponIndex];
  }

  cycleRadio() {
    this.currentRadioIndex = (this.currentRadioIndex + 1) % this.radioStations.length;
    this.emit('radioChanged', this.radioStations[this.currentRadioIndex]);
  }

  setDialogue(speaker, text, duration = 5) {
    this.dialogueSpeaker = speaker;
    this.dialogueText = text;
    this.dialogueTimer = duration;
    this.emit('dialogue', { speaker, text });
  }

  update(delta) {
    // Update dialogue timer
    if (this.dialogueTimer > 0 && !this.activePreset) {
      this.dialogueTimer -= delta;
      if (this.dialogueTimer <= 0) {
        this.dialogueText = '';
        this.dialogueSpeaker = '';
        this.emit('dialogue', { speaker: '', text: '' });
      }
    }

    // Time of day update
    if (!this.activePreset) {
      this.timeValue = (this.timeValue + delta * this.timeCycleSpeed * 0.5) % 24;
      if (this.timeValue >= 6 && this.timeValue < 17) {
        this.timeOfDay = 'day';
      } else if (this.timeValue >= 17 && this.timeValue < 18.5) {
        this.timeOfDay = 'golden_hour';
      } else if (this.timeValue >= 18.5 && this.timeValue < 20) {
        this.timeOfDay = 'sunset';
      } else if (this.timeValue >= 20 && this.timeValue < 23) {
        this.timeOfDay = 'neon_dusk';
      } else {
        this.timeOfDay = 'midnight';
      }
    }

    // Nitro regeneration
    if (!this.nitroActive && this.nitro < this.maxNitro) {
      this.nitro = Math.min(this.maxNitro, this.nitro + delta * 15);
    }
  }
}
