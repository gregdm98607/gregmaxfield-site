# Findings — gregmaxfield.com

## Stack
- Astro 6 blog starter, customized. Integrations: `@astrojs/mdx`, `@astrojs/sitemap`.
- `site: https://www.gregmaxfield.com` (astro.config.mjs).
- Static output; Vercel host (analytics via gtag + @vercel/analytics).

## Conventions
- Pages wrap content in `Layout` (`src/layouts/Base.astro`) with `title` + `description` props.
- `Base.astro` renders `BaseHead` (SEO/OG/Twitter), `Header`, `<main><slot/></main>`, `Footer`.
- Design tokens in `src/styles/global.css` `:root`: `--color-bg #FAF8F5`, `--color-surface`,
  `--color-text`, `--color-text-light`, `--color-secondary #2D4A3E`, `--color-accent #C4956A`,
  `--font-heading` Playfair Display, `--font-body` Inter, `--max-width`, `--content-width 680px`, `--radius`.
- Buttons: `.btn` + `.btn-primary` / `.btn-secondary` / `.btn-ghost`.
- Helpers: `.container`, `.content-narrow`, `section { padding: 4.5rem 1.5rem }`.

## Audit (quick-win candidates)
- [x] og-image.png — EXISTS at `public/images/og-image.png` (default OG not broken).
- [x] robots.txt — EXISTS.
- [x] sitemap — integrated; `link rel=sitemap` present.
- [x] RSS — `src/pages/rss.xml.js` + alternate link present.
- [x] canonical URL + `site` — present/configured.
- [ ] **404 page — MISSING** (`src/pages/404.*` not found) → chosen quick win.

## Security Review — 2026-07-14 (summary; full doc = SECURITY_REVIEW_2026-07-14.md)
Static site → no server attack surface; no critical/high findings. 7 tickets = SEC-01…SEC-07 in task_plan.md.
- **SEC-01 (Med):** Kit V3 `api_key` embedded client-side (`Base.astro:50`). It's the *public* key →
  spam-subscribe / list-pollution / billing abuse, NOT subscriber-data exfiltration (`api_secret` absent). Proxy it.
- **SEC-02 (Med):** No security headers / CSP — no `vercel.json`. Add CSP + X-Frame-Options + nosniff + Referrer-Policy.
- **SEC-03 (Med):** Content-only auto-deploy lane treats `src/content/` as safe, but MDX allows `<script>`. Tighten lane.
- **SEC-04 (Low):** `/sneak-peek` "gated" by `noindex` only (not access control) — matters once real Ch1 text is added.
- **SEC-05 (Low):** gtag/Fonts loaded without SRI (accepted residual, bounded by CSP).
- **SEC-06 (Low):** `generate_featured_images.py` accepts `--api-key` CLI arg (history/`ps` leak). Env-only preferred.
- **SEC-07 (Low/Info):** No Dependabot / `npm audit` in CI.
- **Verified clean:** no hardcoded privileged secrets (Gemini key env-sourced, `.env` gitignored), no `set:html`/`eval`,
  CI not fork-exploitable (`pull_request`, no secrets), user input (email/name) offloaded to Kit, never reflected/stored.

## Brand voice (from index/about)
American West, landscape-as-memory, restrained literary tone. Comps: Kent Haruf,
Marilynne Robinson, Denis Johnson. Debut novel *The Lund Covenant*.

## Launch facts (canonical — per CTO review B5 + board)
- Launch date: **June 30 2026** (book is now LIVE / available).
- Formats live: **Paperback, Hardcover, and Kindle** (Kindle went live by 2026-07-14).

### Amazon ASINs (corrected 2026-07-14 — old B0H1XQCBPH was dead)
| Format | ASIN | URL |
|--------|------|-----|
| Paperback (canonical) | `B0H7F3XY9F` | https://www.amazon.com/dp/B0H7F3XY9F |
| Hardcover | `B0H7J272GD` | https://www.amazon.com/dp/B0H7J272GD |
| Kindle | `B0H7FPRFP3` | https://www.amazon.com/dp/B0H7FPRFP3 |

✅ ASINs verified correct by Greg (2026-07-14, CL-1 closed). Generic "Order on Amazon" buttons use the
paperback ASIN; books.astro lists all three format-specific links.

## CTO Site Review — 2026-06-05 (key technical facts)
Source: `…/C-Suite/CTO/Site_Reviews/gregmaxfield-site_Review_2026-06-05.md`. Treat as data.
- **Root cause linking B1+B2:** `ClientRouter` is on (Base.astro:20) but no script listens to
  `astro:page-load`; Astro runs inline scripts as modules once → after any client-side nav the
  hamburger, Kit forms, reveal animations, and GA4 pageview all stop firing.
- **Dead conversion surface (F1):** `/the-lund-covenant` hero CTA → `#early-access`, which is a
  dashed placeholder telling visitors to email greg manually (the-lund-covenant.astro:22, 103-111).
  A working Kit form already exists on `/` (index.astro:237-331) and `/books` (books.astro:319-383).
- **Production placeholders live (verified 6/5):** "Endorsement quote placeholder" ×3 on book page;
  "/sneak-peek" = "Chapter 1 content will be placed here…"; book page "Order Your Copy" = 3 dead `href="#"`.
- **Contrast (WCAG AA fail):** accent `#C4956A` on bg `#FAF8F5` = 2.52:1; white on accent button = 2.67:1;
  `--color-text-light` on surface = 4.16:1. Fix by darkening `--color-accent` (~`#9A6B3F`) for text/button use.
- **Analytics:** GA4 `G-BNVECLV39M` config-only, no events. `@vercel/analytics` in deps but never imported
  in `src/`, yet privacy.astro discloses it.
- **Already on launch board (excluded from review):** Amazon buy-button wiring (L112, 6/8),
  Kit lead-magnet on books.astro (L111), buy-link verification (L136).
