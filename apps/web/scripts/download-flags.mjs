#!/usr/bin/env node

/**
 * Download country flag images from flagcdn.com into public/flags/.
 * Run from apps/web/:
 *   node scripts/download-flags.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'flags');

const countries = [
  'cm', 'sn', 'ci', 'ga', 'cg', 'cd', 'ne', 'ml',
  'bf', 'tg', 'bj', 'gn', 'rw', 'ke', 'gh', 'ng',
  'za', 'fr', 'ca', 'us',
];

async function main() {
  await mkdir(outDir, { recursive: true });

  for (const code of countries) {
    const url = `https://flagcdn.com/256x192/${code}.png`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[FAIL] ${code}: ${res.status}`);
      continue;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(join(outDir, `${code}.png`), buffer);
    console.log(`[OK]   ${code}.png (${buffer.length} bytes)`);
  }

  console.log(`\nDone. Flags saved to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
