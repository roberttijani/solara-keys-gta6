import { DISTRICTS } from '../world/districts.js';
import { STORY_MISSIONS } from '../missions/storyMissions.js';

export class WorldMapOverlay {
  constructor(container, gameState, roadNetwork) {
    this.container = container || document.getElementById('world-map-modal');
    this.canvas = document.getElementById('world-map-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.gameState = gameState;
    this.roadNetwork = roadNetwork;

    this.isOpen = false;
    this.initDOM();
  }

  initDOM() {
    if (!this.container) return;

    // Close button
    const closeBtn = document.getElementById('map-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.toggle(false));
    }

    if (this.canvas) {
      this.canvas.addEventListener('click', this.onMapClick.bind(this));
    }
  }

  toggle(force = null) {
    this.isOpen = force !== null ? force : !this.isOpen;
    this.gameState.isMapOpen = this.isOpen;

    if (this.container) {
      if (this.isOpen) {
        this.container.classList.remove('hidden');
        this.render();
      } else {
        this.container.classList.add('hidden');
      }
    }
  }

  onMapClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Convert pixel coordinates to world coordinates
    const scale = 0.85;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const worldX = (px - cx) / scale;
    const worldZ = (py - cy) / scale;

    this.gameState.activeWaypoint = {
      x: worldX,
      y: 0.1,
      z: worldZ,
      label: 'Custom User Waypoint'
    };
    this.render();
  }

  render(playerPos = null) {
    if (!this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2 - 10;
    const scale = 0.52;

    ctx.clearRect(0, 0, w, h);

    // Deep Ocean backdrop
    ctx.fillStyle = '#061727';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Mainland Archipelago Landmasses
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.fillRect(-380, -420, 640, 520);
    ctx.strokeRect(-380, -420, 640, 520);

    // South Outer Key
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-140, 220, 260, 200);
    ctx.strokeRect(-140, 220, 260, 200);

    // 2. Road Network Segments
    for (let i = 0; i < this.roadNetwork.segments.length; i++) {
      const seg = this.roadNetwork.segments[i];
      ctx.strokeStyle = seg.isBridge ? '#fbbf24' : '#64748b';
      ctx.lineWidth = seg.isBridge ? 9 : (seg.lanes * 4);
      ctx.beginPath();
      ctx.moveTo(seg.a.pos.x, seg.a.pos.z);
      ctx.lineTo(seg.b.pos.x, seg.b.pos.z);
      ctx.stroke();
    }

    // 3. District Bounding Highlights & Labels
    for (let i = 0; i < DISTRICTS.length; i++) {
      const d = DISTRICTS[i];
      ctx.strokeStyle = d.themeColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(d.bounds.minX, d.bounds.minZ, d.bounds.maxX - d.bounds.minX, d.bounds.maxZ - d.bounds.minZ);

      ctx.fillStyle = d.themeColor;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(d.name.toUpperCase(), d.center.x, d.center.z);
    }

    // 4. Landmarks Icons (Bank, Lighthouse, Chop-Shop, Safehouse)
    const landmarks = [
      { name: 'Solara Reserve Bank', pos: [-60, -320], col: '#06b6d4' },
      { name: 'Cruz Chop-Shop', pos: [-340, -200], col: '#ef4444' },
      { name: 'Cape Lighthouse', pos: [-420, 240], col: '#f59e0b' },
      { name: 'Marina Safehouse', pos: [180, 80], col: '#ec4899' }
    ];

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      ctx.fillStyle = lm.col;
      ctx.beginPath();
      ctx.arc(lm.pos[0], lm.pos[1], 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px sans-serif';
      ctx.fillText(lm.name, lm.pos[0], lm.pos[1] - 10);
    }

    // 5. Active Waypoint
    const wp = this.gameState.activeWaypoint;
    if (wp) {
      ctx.fillStyle = '#ec4899';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wp.x, wp.z, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fbcfe8';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(wp.label || 'OBJECTIVE', wp.x, wp.z + 18);
    }

    // 6. Player Blip
    const pX = playerPos ? playerPos.x : (this.gameState.activeWaypoint ? 176 : 0);
    const pZ = playerPos ? playerPos.z : -80;

    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(pX, pZ, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }
}
