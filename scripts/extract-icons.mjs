import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const collection = require('@iconify-json/fluent-emoji-flat/icons.json');

const names = ['trophy', 'ship', 'collision', 'water-wave', 'bomb'];

const output = {};
for (const name of names) {
  const parent = collection.aliases?.[name]?.parent;
  const icon = collection.icons[name] ?? (parent ? collection.icons[parent] : undefined);
  if (!icon) throw new Error(`Missing icon: ${name}`);
  if (/\sid="/.test(icon.body)) throw new Error(`Icon uses element ids: ${name}`);
  output[name] = icon.body;
}

const target = new URL('../src/lib/icons/fluent.json', import.meta.url);
await writeFile(target, `${JSON.stringify(output, null, 0)}\n`);
console.log(`${Object.keys(output).length} icons written to ${target.pathname}`);
