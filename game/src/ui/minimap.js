export class Minimap {
  constructor(canvas, roadNetwork, gameState) {
    this.canvas = canvas || document.getElementById('minimap-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.roadNetwork = roadNetwork;
    this.gameState = gameState;
    this.radius = 80;
    this.zoom = 0.55; // scale units to pixels
    this.policeBlinkTimer = 0;
  }

  update(delta, playerPos, playerHeading, policeUnits = []) {
    if (!this.ctx || !playerPos) return;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    this.policeBlinkTimer += delta * 8;
    const policeFlash = Math.sin(this.policeBlinkTimer) > 0;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Save and clip to circular radar
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius, 0, Math.PI * 2);
    ctx.clip();

    // Ocean background
    ctx.fillStyle = '#082f49';
    ctx.fillRect(0, 0, w, h);

    // Apply rotation & translation relative to player
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-playerHeading);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-playerPos.x, -playerPos.z);

    // 1. Draw Island Landmasses
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-380, -390, 600, 500); // Mainland
    ctx.fillRect(-140, 210, 260, 220);  // South Key

    // 2. Draw Road Network
    for (let i = 0; i < this.roadNetwork.segments.length; i++) {
      const seg = this.roadNetwork.segments[i];
      ctx.strokeStyle = seg.isBridge ? '#fbbf24' : '#64748b';
      ctx.lineWidth = seg.isBridge ? 8 : (seg.lanes * 3.5);
      ctx.beginPath();
      ctx.moveTo(seg.a.pos.x, seg.a.pos.z);
      ctx.lineTo(seg.b.pos.x, seg.b.pos.z);
      ctx.stroke();
    }

    // 3. Draw Police Blips
    for (let i = 0; i < policeUnits.length; i++) {
      const u = policeUnits[i];
      const p = u.group.position;
      ctx.fillStyle = policeFlash ? '#ef4444' : '#3b82f6';
      ctx.beginPath();
      ctx.arc(p.x, p.z, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw Waypoint Beacon
    const wp = this.gameState.activeWaypoint;
    if (wp) {
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(wp.x, wp.z, 6.0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // restore translated world

    // 5. Player Marker in Center
    ctx.fillStyle = '#06b6d4';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 6, cy + 7);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(cx - 6, cy + 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore(); // restore clip

    // Radar border & North indicator
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, this.radius - 1.5, 0, Math.PI * 2);
    ctx.stroke();

    // North Compass Pip
    const nx = cx + Math.sin(playerHeading) * (this.radius - 8);
    const ny = cy - Math.cos(playerHeading) * (this.radius - 8);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', nx, ny);
  }
}
