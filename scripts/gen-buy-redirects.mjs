// Generates the /buy/<item>/<placement> redirects in vercel.json from src/data/books.json.
// Every Amazon buy link on the site points at /buy/... so attribution tags live in ONE place.
// A placement whose tag is "PLACEHOLDER" (or empty) redirects to the clean Amazon URL.
// Usage: npm run gen:buy   (CI-safe: `node scripts/gen-buy-redirects.mjs --check` exits 1 if vercel.json is stale)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const books = JSON.parse(readFileSync(new URL('../src/data/books.json', import.meta.url), 'utf8'));
const placements = Object.entries(books.attribution).filter(([k]) => !k.startsWith('_'));

const items = [];
for (const [fmt, f] of Object.entries(books.tlc.formats)) items.push([`tlc-${fmt}`, f.asin]);
for (const wb of books.workbooks) if (wb.amazon_asin) items.push([`wb${wb.volume}`, wb.amazon_asin]);

const redirects = [];
for (const [key, asin] of items) {
  for (const [placement, tag] of placements) {
    const live = tag && !String(tag).startsWith('PLACEHOLDER');
    redirects.push({
      source: `/buy/${key}/${placement}`,
      destination: `https://www.amazon.com/dp/${asin}${live ? `?${tag}` : ''}`,
      permanent: false,
    });
  }
}

const path = new URL('../vercel.json', import.meta.url);
const current = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
const next = { ...current, redirects };
const out = JSON.stringify(next, null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (!existsSync(path) || readFileSync(path, 'utf8') !== out) {
    console.error('vercel.json /buy redirects are stale — run `npm run gen:buy`.');
    process.exit(1);
  }
  console.log(`vercel.json up to date (${redirects.length} /buy redirects).`);
} else {
  writeFileSync(path, out);
  console.log(`wrote ${redirects.length} /buy redirects to vercel.json`);
}
