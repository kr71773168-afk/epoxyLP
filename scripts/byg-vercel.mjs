/**
 * Bygger det hele til Vercel: hjemmesiden (Astro) i dist/ og gulvkataloget i dist/katalog/.
 *   node scripts/byg-vercel.mjs
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const kør = (cmd) => execSync(cmd, { stdio: 'inherit' });
kør('npx astro build');
kør('node katalog/byg.mjs');
fs.cpSync('katalog/dist', 'dist/katalog', { recursive: true });
fs.rmSync('dist/katalog/artifact.html', { force: true });
console.log('dist/ klar: hjemmesiden på / og kataloget på /katalog/');
