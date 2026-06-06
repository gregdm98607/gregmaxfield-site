# Progress Log

## Session 2026-06-05 — Quick win: custom 404 page

- Explored site structure (Astro 6 author site for *The Lund Covenant*).
- Audited common quick-win gaps; confirmed only the 404 page was missing.
- Decision: implement a branded `src/pages/404.astro`.
- Created planning files (task_plan, findings, progress).
- Wrote `src/pages/404.astro` (Base layout, design tokens, author-voice copy, 3 CTAs).
- Verified: `npm run build` ✓ passed; `/404.html` emitted as a static route.
- Confirmed copy present in `dist/404.html` (headline, 404 numeral, book CTA).
- Committed `15cabb5` on branch `add-404-page`; fast-forward merged to `master`; branch deleted.
- `master` is ahead of `origin/master` by 1 — **merged locally, not pushed** (push decision pending).

## Session 2026-06-05 (cont.) — CTO site review backlog added

- Read CTO review `gregmaxfield-site_Review_2026-06-05.md` (20 items + 3 quick wins).
- Added full backlog to task_plan.md (IDs B1-B5, F1-F5, R1-R5, W1-W5 preserved) with suggested sequencing.
- **F5 (no custom 404) already closed** by this session's commit.
- Captured key technical facts + canonical launch facts (June 30 2026, KDP ebook + IS paperback) in findings.md.
- No implementation done yet — backlog is planning-only, awaiting direction on what to build next.

## Session 2026-06-05 (cont.) — Implemented quick wins + F1

- User chose "Quick wins + F1". Implemented B4, B5, F3, F1.
- **B4** — gated placeholder Praise behind `SHOW_PRAISE=false` (the-lund-covenant.astro).
- **B5** — Hardcover→Paperback; July 2026→June 30 2026. Fixed the 3 review-named spots
  PLUS 2 extra hits found via `dist` scan (about.astro, blog post). `dist` now has zero "July 2026".
- **F3** — added reusable `noindex` prop to Base.astro + BaseHead.astro; set on /sneak-peek;
  added sitemap `filter` to exclude it. Verified `noindex,nofollow` in output + absent from sitemap.
- **F1** — ported working Kit form (markup + scoped CSS + submit script) into `#early-access`;
  hero CTA now resolves to a real capture. Noted B1 (page-load rebind) + R3 (3rd key copy) debt in-code.
- `npm run build` ✓ clean (×2). Next: commit, merge to master, push.
