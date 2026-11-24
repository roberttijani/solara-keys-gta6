export class ShopAndGarageUI {
  constructor(gameState, saveSystem) {
    this.gameState = gameState;
    this.saveSystem = saveSystem;

    this.modal = document.getElementById('shop-garage-modal');
    this.isOpen = false;
    this.currentTab = 'weapons'; // 'weapons', 'garage', 'savehouse'

    this.initDOM();
  }

  initDOM() {
    if (!this.modal) return;

    const closeBtn = document.getElementById('shop-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const tabWeapons = document.getElementById('tab-btn-weapons');
    const tabGarage = document.getElementById('tab-btn-garage');
    const tabSafe = document.getElementById('tab-btn-savehouse');

    if (tabWeapons) tabWeapons.addEventListener('click', () => this.switchTab('weapons'));
    if (tabGarage) tabGarage.addEventListener('click', () => this.switchTab('garage'));
    if (tabSafe) tabSafe.addEventListener('click', () => this.switchTab('savehouse'));
  }

  open(tab = 'weapons') {
    this.isOpen = true;
    this.currentTab = tab;
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.render();
    }
  }

  close() {
    this.isOpen = false;
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }

  switchTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  buyAmmo(weaponId, cost, amount) {
    if (this.gameState.cash >= cost) {
      this.gameState.cash -= cost;
      const w = this.gameState.weapons.find((item) => item.id === weaponId);
      if (w) {
        w.ammo += amount;
        this.gameState.emit('weaponChanged', w);
        this.gameState.emit('cashChanged', this.gameState.cash);
      }
      this.render();
    }
  }

  buyArmor() {
    if (this.gameState.cash >= 500) {
      this.gameState.cash -= 500;
      this.gameState.restoreArmor(100);
      this.gameState.emit('cashChanged', this.gameState.cash);
      this.render();
    }
  }

  paintVehicle(colorHex) {
    if (this.gameState.currentVehicle && this.gameState.cash >= 1000) {
      this.gameState.cash -= 1000;
      this.gameState.emit('cashChanged', this.gameState.cash);
      // Update chassis color
      const chassis = this.gameState.currentVehicle.group.children[0];
      if (chassis && chassis.material) {
        chassis.material.color.setHex(colorHex);
      }
      this.render();
    }
  }

  saveGameSlot(slot) {
    this.saveSystem.save(slot, this.gameState.currentVehicle ? this.gameState.currentVehicle.group : null);
    this.render();
  }

  loadGameSlot(slot) {
    this.saveSystem.load(slot, this.gameState.currentVehicle ? this.gameState.currentVehicle.group : null);
    this.render();
  }

  render() {
    const content = document.getElementById('shop-tab-content');
    if (!content) return;

    if (this.currentTab === 'weapons') {
      content.innerHTML = `
        <div class="shop-grid">
          <div class="shop-item">
            <h4>Tactical Kevlar Vest</h4>
            <p>100 Armor Protection</p>
            <button class="shop-buy-btn" id="buy-armor-btn">$500</button>
          </div>
          <div class="shop-item">
            <h4>9mm Pistol Mag (+24)</h4>
            <p>Standard High-Velocity</p>
            <button class="shop-buy-btn" id="buy-ammo-pistol">$150</button>
          </div>
          <div class="shop-item">
            <h4>SMG Ammo Drum (+60)</h4>
            <p>Rapid Cycle Vance Pack</p>
            <button class="shop-buy-btn" id="buy-ammo-smg">$350</button>
          </div>
          <div class="shop-item">
            <h4>12-Gauge Buckshot (+18)</h4>
            <p>Tactical Breaker Shells</p>
            <button class="shop-buy-btn" id="buy-ammo-shotgun">$400</button>
          </div>
          <div class="shop-item">
            <h4>Pulse Carbine Ammo (+60)</h4>
            <p>High-Velocity Armor Piercing</p>
            <button class="shop-buy-btn" id="buy-ammo-carbine">$600</button>
          </div>
        </div>
      `;
      document.getElementById('buy-armor-btn')?.addEventListener('click', () => this.buyArmor());
      document.getElementById('buy-ammo-pistol')?.addEventListener('click', () => this.buyAmmo('pistol', 150, 24));
      document.getElementById('buy-ammo-smg')?.addEventListener('click', () => this.buyAmmo('smg', 350, 60));
      document.getElementById('buy-ammo-shotgun')?.addEventListener('click', () => this.buyAmmo('shotgun', 400, 18));
      document.getElementById('buy-ammo-carbine')?.addEventListener('click', () => this.buyAmmo('carbine', 600, 60));

    } else if (this.currentTab === 'garage') {
      content.innerHTML = `
        <div class="shop-grid">
          <div class="shop-item">
            <h4>Neon Cyan Respray</h4>
            <p>Solara Coastal Gloss</p>
            <button class="shop-buy-btn" id="paint-cyan">$1,000</button>
          </div>
          <div class="shop-item">
            <h4>Sunset Magenta Respray</h4>
            <p>Promenade Pearl Metallic</p>
            <button class="shop-buy-btn" id="paint-magenta">$1,000</button>
          </div>
          <div class="shop-item">
            <h4>Sunset Gold Respray</h4>
            <p>Golden Hour Luxury Finish</p>
            <button class="shop-buy-btn" id="paint-gold">$1,000</button>
          </div>
          <div class="shop-item">
            <h4>Stealth Matte Obsidian</h4>
            <p>SCPD Radar Evader Finish</p>
            <button class="shop-buy-btn" id="paint-stealth">$1,000</button>
          </div>
        </div>
      `;
      document.getElementById('paint-cyan')?.addEventListener('click', () => this.paintVehicle(0x06b6d4));
      document.getElementById('paint-magenta')?.addEventListener('click', () => this.paintVehicle(0xec4899));
      document.getElementById('paint-gold')?.addEventListener('click', () => this.paintVehicle(0xf59e0b));
      document.getElementById('paint-stealth')?.addEventListener('click', () => this.paintVehicle(0x0f172a));

    } else if (this.currentTab === 'savehouse') {
      const slots = this.saveSystem.listSlots();
      content.innerHTML = `
        <div class="save-slot-list">
          ${slots.map((s) => `
            <div class="save-slot-card">
              <div class="slot-info">
                <h4>${s.label}</h4>
                <p>${s.occupied ? `${s.district} • $${s.cash?.toLocaleString()} • Saved` : 'Empty Slot'}</p>
              </div>
              <div class="slot-actions">
                <button class="slot-btn save-btn" data-slot="${s.id}">SAVE</button>
                ${s.occupied ? `<button class="slot-btn load-btn" data-slot="${s.id}">LOAD</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      `;
      content.querySelectorAll('.save-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => this.saveGameSlot(Number(e.target.dataset.slot)));
      });
      content.querySelectorAll('.load-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => this.loadGameSlot(Number(e.target.dataset.slot)));
      });
    }
  }
}
