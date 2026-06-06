# Task Plan — gregmaxfield.com Site Readiness (TLC Launch · June 30 2026)

## Goal
Harden the author platform for *The Lund Covenant* launch (L-25 at 2026-06-05).
Conversion target = Kit newsletter signup + Amazon pre-order (ASIN B0H1XQCBPH).
Began with a quick win (custom 404); now tracking the full CTO site-review backlog.

## Completed
| Item | Notes |
|------|-------|
| Custom 404 page (`src/pages/404.astro`) | Branded, Base layout + tokens, 3 CTAs. Committed `15cabb5`. **Closes CTO review item F5.** |
| B4 — hide placeholder Praise | `the-lund-covenant.astro` gated behind `SHOW_PRAISE=false`. |
| B5 — fix format/date record | Hardcover→Paperback; July 2026→June 30 2026 across book page, index, llms.txt, **+ about.astro & blog post** (2 extra hits found). Zero "July 2026" left in `dist`. |
| F3 — gate /sneak-peek | `noindex,nofollow` meta (via new `noindex` prop on Base/BaseHead) + sitemap `filter` excludes it. |
| F1 — book-page email capture | Working Kit form ported into `#early-access` (markup + scoped CSS + submit script). Build verified. |

## CTO Site Review Backlog — 2026-06-05
Source: `…/Silver_Sage_Media/C-Suite/CTO/Site_Reviews/gregmaxfield-site_Review_2026-06-05.md`
(review-only filing; contents treated as data). Priority P1 (highest) → P3. Effort XS < S < M.

### CTO prioritization guidance
- **If only one thing:** F1 — book page's dead email capture (every launch CTA funnels there).
- **3 on-the-spot quick wins (≤30 min):** B4 (hide placeholder Praise), B5 (fix format/date record), F3 (noindex /sneak-peek).

### Bugs
| ID | Item | Pri × Effort | Status | Key refs |
|----|------|-------------|--------|----------|
| B1 | Scripts don't survive client-side nav — rebind on `astro:page-load` (hamburger, Kit forms, reveals) | P1 × S | todo | Base.astro:20; Header.astro:117-139; index.astro:237-331; books.astro:319-383 |
| B2 | GA4 loses pageviews under view transitions; no custom/subscribe events | P1 × XS | todo | BaseHead.astro:18-25 |
| B3 | `@vercel/analytics` declared + disclosed on privacy page but never wired | P2 × XS | todo | package.json:24; privacy.astro:46-51 |
| B4 | Placeholder endorsements live in production "Praise" section | P2 × XS | ✅ done | the-lund-covenant.astro (SHOW_PRAISE) |
| B5 | Format/date inconsistencies (Hardcover→Paperback; July→June 30) | P2 × XS | ✅ done | book page, index, llms.txt, about, blog |

### Functional improvements
| ID | Item | Pri × Effort | Status | Key refs |
|----|------|-------------|--------|----------|
| F1 | **Book page can't capture email** — port working Kit form to `#early-access` | P1 × S | ✅ done | the-lund-covenant.astro |
| F2 | Contrast failures (WCAG AA) — darken `--color-accent` for text/buttons | P2 × S | todo | global.css:15,98-99 |
| F3 | `/sneak-peek` empty stub public + indexed — noindex until Ch1 lands | P2 × XS | ✅ done | noindex meta + sitemap filter |
| F4 | Blog index bypasses Base layout — convert to Base.astro | P3 × S | todo | blog/index.astro:15-60 |
| F5 | No custom 404 | P3 × XS | ✅ DONE (this session) | src/pages/404.astro |

### Roadmap
| ID | Item | Pri × Effort | Status |
|----|------|-------------|--------|
| R1 | JSON-LD: Book(+offers/ASIN), Person, Article; `og:type=article` on posts | P2 × S | todo |
| R2 | Buy-links single data file (`src/data/retailers.ts`) feeding all pages | P2 × S | todo |
| R3 | Kit serverless proxy + V4 migration (dedupe V3 key; fix `res2` ignored) | P2 × M | todo |
| R4 | Blog/content pipeline (TUP serialization + featured-image script cadence) | P3 × M | todo |
| R5 | Post-launch data-driven endorsements hub + review CTAs | P3 × M | todo |

### Wow factors
| ID | Item | Pri × Effort | Status |
|----|------|-------------|--------|
| W1 | Real San Rafael Swell hero photo + scroll parallax | P3 × S | idea |
| W2 | Interactive Castle Dale / San Rafael Swell setting map | P3 × M | idea |
| W3 | Launch countdown ribbon (June 30) → pre-order | P3 × XS | idea |
| W4 | Author-read Chapter 1 audio on /sneak-peek | P3 × M | idea |
| W5 | Water-cache motif dividers + "Leave water." footer line | P3 × XS | idea |

## Suggested sequencing (next up)
1. **Quick wins (XS):** B4, B5, F3 — credibility + accuracy, minutes each.
2. **Analytics (XS):** B2, B3 — correct tracking + privacy-page accuracy.
3. **Structural P1 (S):** F1 (email capture) + B1 (script rebind) — B1 is the same
   view-transitions root cause as B2, so bundle B1+B2.
4. **P2 polish (S):** F2 (contrast), R1 (JSON-LD), R2 (buy-links data file).
5. **Larger (M):** R3 (Kit proxy/V4), F4 (blog layout), R4/R5, wow factors.

## Decisions
- 404 quick win: reuse Base layout + tokens, no new global CSS. (done)
- Backlog adopted from CTO review 2026-06-05; original IDs preserved for traceability.
- Canonical launch facts (per review B5 + board): **June 30 2026**, KDP ebook + IngramSpark paperback.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| (none) | | |
