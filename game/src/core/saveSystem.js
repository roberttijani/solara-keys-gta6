export class SaveSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.storageKeyPrefix = 'solara_keys_save_slot_';
    this.memoryFallback = new Map();
  }

  isStorageAvailable() {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const test = '__solara_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  save(slotIndex = 0, playerObj = null) {
    const isAvail = this.isStorageAvailable();
    const data = {
      slotIndex,
      savedAt: '2026-11-24T18:00:00Z', // deterministic or readable ISO
      cash: this.gameState.cash,
      health: this.gameState.health,
      armor: this.gameState.armor,
      wantedLevel: this.gameState.wantedLevel,
      currentDistrict: this.gameState.currentDistrict,
      currentDistrictId: this.gameState.currentDistrictId,
      timeValue: this.gameState.timeValue,
      timeOfDay: this.gameState.timeOfDay,
      currentWeaponIndex: this.gameState.currentWeaponIndex,
      activeMissionId: this.gameState.activeMission ? this.gameState.activeMission.id : null,
      activeMissionStep: this.gameState.activeMissionStep,
      completedMissions: [...this.gameState.completedMissions],
      playerPosition: playerObj && playerObj.position ? {
        x: playerObj.position.x,
        y: playerObj.position.y,
        z: playerObj.position.z
      } : { x: 0, y: 1.5, z: 0 }
    };

    const json = JSON.stringify(data);
    const key = `${this.storageKeyPrefix}${slotIndex}`;

    if (isAvail) {
      try {
        window.localStorage.setItem(key, json);
      } catch (e) {
        this.memoryFallback.set(key, json);
      }
    } else {
      this.memoryFallback.set(key, json);
    }

    return true;
  }

  load(slotIndex = 0, playerObj = null) {
    const key = `${this.storageKeyPrefix}${slotIndex}`;
    let json = null;

    if (this.isStorageAvailable()) {
      try {
        json = window.localStorage.getItem(key);
      } catch (e) {}
    }

    if (!json) {
      json = this.memoryFallback.get(key);
    }

    if (!json) return false;

    try {
      const data = JSON.parse(json);
      this.gameState.cash = data.cash || 0;
      this.gameState.health = data.health || 100;
      this.gameState.armor = data.armor || 100;
      this.gameState.wantedLevel = data.wantedLevel || 0;
      this.gameState.currentDistrict = data.currentDistrict || 'Neon Promenade';
      this.gameState.currentDistrictId = data.currentDistrictId || 'neon_promenade';
      this.gameState.timeValue = data.timeValue || 17.5;
      this.gameState.timeOfDay = data.timeOfDay || 'golden_hour';
      this.gameState.currentWeaponIndex = data.currentWeaponIndex || 1;
      this.gameState.completedMissions = data.completedMissions || [];
      this.gameState.activeMissionStep = data.activeMissionStep || 0;

      if (playerObj && data.playerPosition) {
        playerObj.position.set(data.playerPosition.x, data.playerPosition.y, data.playerPosition.z);
      }

      this.gameState.emit('stateLoaded', data);
      return true;
    } catch (e) {
      console.warn('Failed to parse save slot', e);
      return false;
    }
  }

  listSlots() {
    const slots = [
      { id: 0, label: 'Auto-Save' },
      { id: 1, label: 'Manual Slot 1' },
      { id: 2, label: 'Manual Slot 2' },
      { id: 3, label: 'Manual Slot 3' }
    ];

    return slots.map((s) => {
      const key = `${this.storageKeyPrefix}${s.id}`;
      let json = null;
      if (this.isStorageAvailable()) {
        try {
          json = window.localStorage.getItem(key);
        } catch (e) {}
      }
      if (!json) json = this.memoryFallback.get(key);

      if (json) {
        try {
          const data = JSON.parse(json);
          return {
            ...s,
            occupied: true,
            district: data.currentDistrict,
            cash: data.cash,
            savedAt: data.savedAt
          };
        } catch (e) {}
      }
      return { ...s, occupied: false };
    });
  }
}
