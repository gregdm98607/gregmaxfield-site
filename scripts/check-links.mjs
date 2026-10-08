// Dead-link check for gregmaxfield.com (used by the weekly CoS site-upkeep task).
// Usage: node scripts/check-links.mjs [baseUrl=https://www.gregmaxfield.com] [--json out.json]
// Crawls the sitemap, extracts every link, checks each once. Exit 1 if any link is broken.
const base = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2].replace(/\/$/, '') : 'https://www.gregmaxfield.com';
const jsonOut = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
const UA = { 'user-agent': 'Mozilla/5.0 (gregmaxfield.com link check)' };
// Hosts that block bots (403/503/999) are reported as "unverified", never as broken.
const BOT_WALLED = /(^|\.)(amazon\.com|amzn\.to|goodreads\.com|linkedin\.com|x\.com|twitter\.com|kit\.com)$/;

const get = (u, method = 'GET') => fetch(u, { method, headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });

const smIndex = await (await get(`${base}/sitemap-index.xml`)).text();
const sitemaps = [...smIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://www.gregmaxfield.com', base));
const pages = new Set();
for (const sm of sitemaps) for (const m of (await (await get(sm)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)) pages.add(m[1].replace('https://www.gregmaxfield.com', base));

const links = new Map(); // url -> Set(pages)
for (const p of pages) {
  const html = await (await get(p)).text();
  for (const m of html.matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)) {
    const h = m[1];
    if (h.startsWith('#') || h.startsWith('mailto:') || h.startsWith('tel:') || h.startsWith('javascript:')) continue;
    const abs = new URL(h, p).href.split('#')[0];
    if (/\.(css|js|svg|ico|png|jpg|webp|xml)(\?|$)/.test(abs) && abs.startsWith(base)) continue;
    if (!links.has(abs)) links.set(abs, new Set());
    links.get(abs).add(new URL(p).pathname);
  }
}

const results = [];
for (const [u, on] of links) {
  let status, note = '';
  try {
    let r = await get(u, 'HEAD');
    if (r.status === 405 || r.status === 403 || r.status === 404) r = await get(u, 'GET');
    status = r.status;
  } catch (e) { status = 0; note = String(e.cause?.code || e.name); }
  const host = new URL(u).hostname;
  const verdict = status >= 200 && status < 400 ? 'ok' : (BOT_WALLED.test(host) && [0, 403, 429, 503, 999].includes(status) ? 'unverified' : 'broken');
  results.push({ url: u, status, verdict, note, on: [...on] });
}
const broken = results.filter((r) => r.verdict === 'broken');
const summary = { checked_at: new Date().toISOString(), base, pages: pages.size, links: results.length, broken: broken.length, unverified: results.filter((r) => r.verdict === 'unverified').length, broken_links: broken };
if (jsonOut) (await import('node:fs')).writeFileSync(jsonOut, JSON.stringify({ ...summary, results }, null, 2));
console.log(`${summary.pages} pages, ${summary.links} links: ${summary.broken} broken, ${summary.unverified} unverified (bot-walled).`);
for (const b of broken) console.log(`BROKEN ${b.status || b.note} ${b.url}  (on ${b.on.join(', ')})`);
process.exit(broken.length ? 1 : 0);
