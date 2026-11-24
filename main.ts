import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

mkdirSync(outDir, { recursive: true });

// Copy game/ and screenshots/ deterministically
cpSync(resolve('game'), resolve(outDir, 'game'), { recursive: true });
cpSync(resolve('screenshots'), resolve(outDir, 'screenshots'), { recursive: true });

// Build dossier
const dossierBytes = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});

writeFileSync(resolve(outDir, 'dossier.json'), dossierBytes);
console.log(`Successfully built dossier.json (${dossierBytes.length} bytes) to ${outDir}`);
