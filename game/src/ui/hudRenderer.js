export class HUDRenderer {
  constructor(gameState) {
    this.gameState = gameState;

    // Cache DOM elements
    this.elCash = document.getElementById('hud-cash');
    this.elDistrict = document.getElementById('hud-district');
    this.elDistrictSub = document.getElementById('hud-district-sub');
    this.elWantedStars = document.querySelectorAll('.wanted-star');
    this.elHealthBar = document.getElementById('hud-health-fill');
    this.elArmorBar = document.getElementById('hud-armor-fill');
    this.elNitroBar = document.getElementById('hud-nitro-fill');
    this.elWeaponName = document.getElementById('hud-weapon-name');
    this.elAmmo = document.getElementById('hud-ammo');
    this.elSpeedometer = document.getElementById('hud-speedometer');
    this.elSpeedVal = document.getElementById('hud-speed-val');
    this.elRadioToast = document.getElementById('hud-radio-toast');
    this.elMissionBanner = document.getElementById('hud-mission-banner');
    this.elMissionTitle = document.getElementById('hud-mission-title');
    this.elMissionObjective = document.getElementById('hud-mission-obj');
    this.elDialogue = document.getElementById('hud-dialogue');
    this.elDialogueSpeaker = document.getElementById('hud-dialogue-speaker');
    this.elDialogueText = document.getElementById('hud-dialogue-text');
    this.elContextPrompt = document.getElementById('hud-context-prompt');

    this.flashTimer = 0;
  }

  update(delta) {
    // 1. Cash
    if (this.elCash) {
      this.elCash.textContent = `$${this.gameState.cash.toLocaleString()}`;
    }

    // 2. District
    if (this.elDistrict) {
      this.elDistrict.textContent = this.gameState.currentDistrict.toUpperCase();
    }

    // 3. Wanted Stars (0-5)
    this.flashTimer += delta * 6;
    const isFlashing = Math.sin(this.flashTimer) > 0;
    const wanted = this.gameState.wantedLevel;

    if (this.elWantedStars) {
      this.elWantedStars.forEach((star, idx) => {
        if (idx < wanted) {
          star.classList.add('active');
          if (isFlashing) star.classList.add('flash');
          else star.classList.remove('flash');
        } else {
          star.classList.remove('active', 'flash');
        }
      });
    }

    // 4. Health, Armor, Nitro
    if (this.elHealthBar) {
      this.elHealthBar.style.width = `${Math.max(0, this.gameState.health)}%`;
    }
    if (this.elArmorBar) {
      this.elArmorBar.style.width = `${Math.max(0, this.gameState.armor)}%`;
    }
    if (this.elNitroBar) {
      this.elNitroBar.style.width = `${Math.max(0, this.gameState.nitro)}%`;
    }

    // 5. Weapon & Ammo
    const weapon = this.gameState.getCurrentWeapon();
    if (weapon) {
      if (this.elWeaponName) this.elWeaponName.textContent = weapon.name;
      if (this.elAmmo) {
        if (weapon.ammo === Infinity) {
          this.elAmmo.textContent = '∞';
        } else {
          this.elAmmo.textContent = `${weapon.clip} / ${weapon.ammo}`;
        }
      }
    }

    // 6. Speedometer
    if (this.elSpeedometer) {
      if (this.gameState.inVehicle) {
        this.elSpeedometer.classList.remove('hidden');
        if (this.elSpeedVal) this.elSpeedVal.textContent = this.gameState.speedMph;
      } else {
        this.elSpeedometer.classList.add('hidden');
      }
    }

    // 7. Radio Toast
    if (this.elRadioToast) {
      const curRadio = this.gameState.radioStations[this.gameState.currentRadioIndex];
      this.elRadioToast.textContent = `${curRadio.name} • ${curRadio.genre}`;
    }

    // 8. Mission Banner
    if (this.elMissionBanner) {
      if (this.gameState.activeMission) {
        this.elMissionBanner.classList.remove('hidden');
        if (this.elMissionTitle) this.elMissionTitle.textContent = this.gameState.activeMission.title;
        if (this.elMissionObjective && this.gameState.activeWaypoint) {
          this.elMissionObjective.textContent = this.gameState.activeWaypoint.label || 'Reach the objective beacon';
        }
      } else {
        this.elMissionBanner.classList.add('hidden');
      }
    }

    // 9. Comms Dialogue Subtitles
    if (this.elDialogue) {
      if (this.gameState.dialogueText) {
        this.elDialogue.classList.remove('hidden');
        if (this.elDialogueSpeaker) this.elDialogueSpeaker.textContent = this.gameState.dialogueSpeaker;
        if (this.elDialogueText) this.elDialogueText.textContent = this.gameState.dialogueText;
      } else {
        this.elDialogue.classList.add('hidden');
      }
    }

    // 10. Context Prompt
    if (this.elContextPrompt) {
      if (this.gameState.contextPrompt) {
        this.elContextPrompt.classList.remove('hidden');
        this.elContextPrompt.textContent = this.gameState.contextPrompt;
      } else {
        this.elContextPrompt.classList.add('hidden');
      }
    }
  }
}
