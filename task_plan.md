# Task Plan — gregmaxfield.com Site Readiness (TLC Launch · June 30 2026)

## Goal
Harden the author platform for *The Lund Covenant* launch (L-25 at 2026-06-05).
Conversion target = Kit newsletter signup + Amazon pre-order (ASIN B0H1XQCBPH).
Began with a quick win (custom 404); now tracking the full CTO site-review backlog.

---

## Phase: Launch Day Copy Flip (2026-06-29 — EXECUTING NOW)
**Status:** in_progress
**Goal:** Flip all pre-order/coming-soon copy to "Available Now" + live Amazon buy links across 3 pages.
**Amazon URL:** https://www.amazon.com/Lund-Covenant-novel-Greg-Maxfield/dp/B0H1XQCBPH
**Formats live:** Paperback & Hardcover (Kindle NOT ready — do not advertise)
**Prices:** $16.99 paperback (confirmed from GTM plan)

### Changes — the-lund-covenant.astro
- [ ] Hero badge: "Coming June 30, 2026" → "Available Now"
- [ ] Hero CTA primary: "Join the Launch List" (href=#early-access) → "Order on Amazon" (href=amazon)
- [ ] About the Book format line: "Paperback & Ebook · June 30, 2026" → "Paperback & Hardcover · Available Now"
- [ ] Order section tagline: "Available June 30, 2026 — pre-order now." → "Available now — order your copy today."
- [ ] Order button: "Pre-Order on Amazon" → "Order on Amazon"
- [ ] Early Access section: update heading + copy from pre-launch to post-launch language

### Changes — index.astro
- [ ] Book genre line: "Literary Fiction · June 30, 2026" → "Literary Fiction · Available Now"
- [ ] Add direct Amazon buy button alongside "Learn More" in book section
- [ ] Newsletter copy: update pre-launch language to post-launch

### Changes — books.astro
- [ ] Meta line: "Silver Sage Media · June 2026" → "Silver Sage Media · Available Now"
- [ ] Amazon KDP buy button: href="#" → real Amazon URL; label "Ebook & Paperback" → "Paperback & Hardcover"
- [ ] Newsletter copy: update pre-launch language

---

## Completed (prior sessions)
| Item | Notes |
|------|-------|
| Custom 404 page (`src/pages/404.astro`) | Branded, Base layout + tokens, 3 CTAs. Committed `15cabb5`. **Closes CTO review item F5.** |
| B4 — hide placeholder Praise | `the-lund-covenant.astro` gated behind `SHOW_PRAISE=false`. |
| B5 — fix format/date record | Hardcover→Paperback; July 2026→June 30 2026 across book page, index, llms.txt, **+ about.astro & blog post** (2 extra hits found). Zero "July 2026" left in `dist`. |
| F3 — gate /sneak-peek | `noindex,nofollow` meta (via new `noindex` prop on Base/BaseHead) + sitemap `filter` excludes it. |
| F1 — book-page email capture | Working Kit form ported into `#early-access` (markup + scoped CSS + submit script). Build verified. |
| B1 — scripts survive client-side nav | Rebind on `astro:page-load`. |
| B2 — GA4 loses pageviews | BaseHead nav tracking + sign_up event in unified Kit handler. |

## CTO Site Review Backlog — remaining
| ID | Item | Pri × Effort | Status |
|----|------|-------------|--------|
| B3 | `@vercel/analytics` wired but not disclosed | P2 × XS | todo |
| F2 | Contrast failures (WCAG AA) — darken `--color-accent` | P2 × S | todo |
| F4 | Blog index bypasses Base layout | P3 × S | todo |
| R1 | JSON-LD: Book+offers/ASIN, Person, Article | P2 × S | todo |
| R2 | Buy-links single data file (`src/data/retailers.ts`) | P2 × S | todo |

## Decisions
- 404 quick win: reuse Base layout + tokens, no new global CSS. (done)
- Backlog adopted from CTO review 2026-06-05; original IDs preserved for traceability.
- Canonical launch facts: **June 30 2026**, KDP ebook + IngramSpark paperback.
- Launch copy flip (2026-06-29): formats = Paperback & Hardcover (NO Kindle — not ready).

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| (none) | | |
