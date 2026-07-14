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

## Session 2026-06-06 — B1+B2 view-transitions fix

- **B1**: All scripts now survive ClientRouter navigation via `astro:page-load`.
  - Header.astro: wrapped in astro:page-load with AbortController for scroll listener.
  - Base.astro: added unified reveal observer + unified Kit form handler (replaces 3 per-page copies).
  - index.astro: trimmed to homepage-only section observer, wrapped in astro:page-load.
  - books.astro + the-lund-covenant.astro: removed per-page reveal/Kit scripts entirely.
  - Kit form handler uses `.kit-form` class selector (no ID collisions), `dataset.kitBound` guard.
- **B2**: GA4 pageview tracking + subscribe conversion event.
  - BaseHead.astro: added module script that fires `page_view` on every `astro:page-load` after the first.
  - Unified Kit handler fires `window.gtag('event', 'sign_up', { method: 'Kit' })` on successful subscribe.
- Side benefit: Kit form code deduplicated (3 copies → 1 in Base.astro). R3 debt annotated.
- `npm run build` ✓ clean. Verified: `astro:page-load` in 10 files, Kit key in 7 (unified), GA4 events in 9.

## Session 2026-07-14 — Security review + ticket capture (CSO lens)

- Full-tree security audit of the static site (src/, scripts/, public/, CI, deploy config, deps).
  Branch diff vs `master` was empty → audited whole codebase per request.
- Wrote standalone handoff doc `SECURITY_REVIEW_2026-07-14.md` (for PM): exec summary, risk register,
  per-finding location/impact/fix, prioritization, and a "verified clean" coverage section.
- **No critical/high findings.** No server attack surface (static SSG), no hardcoded privileged secrets,
  no `set:html`/`eval`, CI uses `pull_request` (not `pull_request_target`) so fork PRs are unprivileged.
- Captured **7 tickets SEC-01…SEC-07** into task_plan.md (new "Security Hardening" phase) with
  Pri × Effort + acceptance criteria. Top two before launch traffic: SEC-01 (proxy Kit key),
  SEC-02 (headers/CSP). Both quick.
- Key nuance recorded: the exposed Kit value is the **public** V3 `api_key` — abuse/list-pollution risk,
  NOT a subscriber-data breach (the `api_secret` is correctly absent). Confirm with Kit; rotate only if secret leaked.
- No code changed this session — review + planning only.
