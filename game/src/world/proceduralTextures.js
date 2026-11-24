import * as THREE from 'three';

export class ProceduralTextures {
  constructor() {
    this.cache = new Map();
  }

  createAsphaltTexture() {
    if (this.cache.has('asphalt')) return this.cache.get('asphalt');

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base dark asphalt
    ctx.fillStyle = '#1c1e22';
    ctx.fillRect(0, 0, 512, 512);

    // Deterministic grain
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const noise = ((idx * 17) % 7 - 3) * 2;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Outer solid white lane boundary lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(35, 0);
    ctx.lineTo(35, 512);
    ctx.moveTo(477, 0);
    ctx.lineTo(477, 512);
    ctx.stroke();

    // Center yellow dashed double line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.setLineDash([48, 36]);
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(250, 512);
    ctx.moveTo(262, 0);
    ctx.lineTo(262, 512);
    ctx.stroke();
    ctx.setLineDash([]);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('asphalt', texture);
    return texture;
  }

  createBridgeRoadTexture() {
    if (this.cache.has('bridge_road')) return this.cache.get('bridge_road');

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#22252a';
    ctx.fillRect(0, 0, 512, 512);

    // Concrete expansion joints
    ctx.strokeStyle = '#14171a';
    ctx.lineWidth = 4;
    for (let y = 0; y < 512; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Yellow double lane dividers
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 5;
    ctx.setLineDash([40, 24]);
    ctx.beginPath();
    ctx.moveTo(256, 0);
    ctx.lineTo(256, 512);
    ctx.stroke();
    ctx.setLineDash([]);

    // Edge reflectors / white lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(30, 0);
    ctx.lineTo(30, 512);
    ctx.moveTo(482, 0);
    ctx.lineTo(482, 512);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('bridge_road', texture);
    return texture;
  }

  createSidewalkTexture() {
    if (this.cache.has('sidewalk')) return this.cache.get('sidewalk');

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 256, 256);

    // Tile grid
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 256; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y <= 256; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('sidewalk', texture);
    return texture;
  }

  createArtDecoFacadeTexture(color1 = '#fbcfe8', color2 = '#06b6d4', styleIndex = 0) {
    const key = `art_deco_${color1}_${color2}_${styleIndex}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base pastel color
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, 512, 512);

    // Decorative geometric Art Deco bands
    ctx.fillStyle = color2;
    ctx.fillRect(0, 480, 512, 32);
    ctx.fillRect(0, 0, 512, 28);
    ctx.fillRect(0, 240, 512, 16);

    // Vertical molding pilasters
    for (let x = 32; x < 512; x += 112) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x - 4, 0, 8, 512);
    }

    // Windows with sunshades and glow
    for (let y = 48; y < 460; y += 72) {
      for (let x = 48; x < 480; x += 112) {
        // Window frame
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, 72, 48);

        // Glass pane (warm interior glow or cool coastal reflection)
        const isLit = (x + y + styleIndex * 17) % 3 === 0;
        ctx.fillStyle = isLit ? '#fed7aa' : '#38bdf8';
        ctx.fillRect(x + 4, y + 4, 64, 40);

        // Deco eyebrow / awning
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x - 4, y - 6, 80, 6);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  createLitSkyscraperTexture(glassTint = '#0284c7', litColor = '#fef08a') {
    const key = `skyscraper_${glassTint}_${litColor}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep modern glass curtain wall
    ctx.fillStyle = '#091524';
    ctx.fillRect(0, 0, 512, 512);

    // Window grid
    const cols = 8;
    const rows = 16;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW;
        const y = r * cellH;

        // Dark window frame
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y, cellW, cellH);

        // Window pane
        const seed = (c * 13 + r * 37) % 100;
        if (seed > 60) {
          // Lit office interior
          ctx.fillStyle = litColor;
        } else if (seed > 30) {
          // Cyan sky reflection
          ctx.fillStyle = glassTint;
        } else {
          // Dim office
          ctx.fillStyle = '#1e293b';
        }
        ctx.fillRect(x + 3, y + 3, cellW - 6, cellH - 6);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set(key, texture);
    return texture;
  }

  createWarehouseWallTexture() {
    if (this.cache.has('warehouse')) return this.cache.get('warehouse');

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 256, 256);

    // Corrugated vertical stripes
    for (let x = 0; x < 256; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? '#334155' : '#64748b';
      ctx.fillRect(x, 0, 4, 256);
    }

    // Yellow / black safety hazard bottom stripe
    for (let x = -30; x < 280; x += 24) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(x, 256);
      ctx.lineTo(x + 16, 230);
      ctx.lineTo(x + 28, 230);
      ctx.lineTo(x + 12, 256);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(x + 12, 256);
      ctx.lineTo(x + 28, 230);
      ctx.lineTo(x + 40, 230);
      ctx.lineTo(x + 24, 256);
      ctx.closePath();
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('warehouse', texture);
    return texture;
  }

  createVillaWallTexture() {
    if (this.cache.has('villa')) return this.cache.get('villa');

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Bright Mediterranean whitewash stucco
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);

    // Stone base trim
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 240, 256, 16);

    // Arched terracotta window
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(128, 90, 40, Math.PI, 0, false);
    ctx.rect(88, 90, 80, 80);
    ctx.fill();

    // Blue glass
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(128, 90, 34, Math.PI, 0, false);
    ctx.rect(94, 90, 68, 74);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('villa', texture);
    return texture;
  }

  createSandTexture() {
    if (this.cache.has('sand')) return this.cache.get('sand');

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Warm golden sand
    ctx.fillStyle = '#fde047';
    ctx.fillRect(0, 0, 256, 256);

    // Subtle deterministic grain
    const imgData = ctx.getImageData(0, 0, 256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const v = ((idx * 31) % 9 - 4) * 2;
      data[i] = Math.min(255, Math.max(0, 240 + v));
      data[i + 1] = Math.min(255, Math.max(0, 205 + v));
      data[i + 2] = Math.min(255, Math.max(0, 120 + v));
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    this.cache.set('sand', texture);
    return texture;
  }

  createNeonSignTexture(text, colorHex = '#ec4899', subtitle = 'HOTEL & LOUNGE') {
    const key = `neon_${text}_${colorHex}`;
    if (this.cache.has(key)) return this.cache.get(key);

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Dark backing board
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);

    // Border glow
    ctx.strokeStyle = colorHex;
    ctx.lineWidth = 4;
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 18;
    ctx.strokeRect(8, 8, 496, 112);

    // Main Neon Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = colorHex;
    ctx.shadowBlur = 24;
    ctx.fillText(text, 256, 52);

    // Subtitle
    if (subtitle) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.fillText(subtitle, 256, 92);
    }

    const texture = new THREE.CanvasTexture(canvas);
    this.cache.set(key, texture);
    return texture;
  }
}
