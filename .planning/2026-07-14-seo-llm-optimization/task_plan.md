# Task Plan — gregmaxfield.com SEO & LLM-Search Optimization

## Goal
Ship additive SEO + LLM/AI-search improvements to the (already-launched) author site.
The site is NOT broken — it has canonical URLs, sitemap, RSS, OG/Twitter cards, GA4,
AI-friendly robots.txt, and llms.txt. The biggest gaps: **zero JSON-LD structured data**
and **no Q&A/FAQ surface** — the two things that most help Google rich results AND how
LLMs (ChatGPT, Perplexity, Google AI Overviews) understand and cite the site.

**Definition of done (epic):** JSON-LD validates in Google Rich Results Test for Person,
Book, Article, FAQPage; `og:type` correct per page type; llms.txt + all Substack links
internally consistent with the live site; at least one FAQ surface answering core reader questions.

**Source docs:** PM handoff + ticket backlog (Obsidian vault, `05_Projects/Greg_Maxfield_Author/`).
Backlog IDs (SEO-##, LLM-##, BUG-01) preserved for traceability.

---

## BLOCKERS — need Greg before the affected tickets ship
| # | Question | Blocks | Status |
|---|----------|--------|--------|
| Q1 | Canonical Substack URL for **The Unfolding Plot** | BUG-01 | ✅ RESOLVED → `gregmaxfield.substack.com` |
| Q2 | Does an X/Twitter handle exist? | SEO-04 (twitter:site/creator) | ✅ RESOLVED → `@Greg_Maxfield5` |
| Q3 | Book facts: ISBN(s)? current price? formats live? datePublished? | SEO-01 (Book) | ✅ RESOLVED → HC 979-8234136527, PB 979-8185358207 ($16.99), Kindle ASIN B0H7FPRFP3; pub 2026-06-30 |
| Q4 | `sameAs` profile URLs: Amazon author page, Goodreads, socials? | LLM-03 | OPEN (Substack + X wired; Amazon author + Goodreads still needed) |

**First-iteration scope CONFIRMED:** Phase 1 (quick wins) + Phase 2 (structured data) + LLM-01 (FAQ),
with SEO-03 pulled forward (shares BaseHead). SEO-05/07 + LLM-04/05 deferred to a later iteration.

**BUG-01 concrete edits (Q1 resolved):** change the 2 outlier refs to match the majority —
`llms.txt:10` and blog `the-book-leaves-home.md` → `gregmaxfield.substack.com`. Leave the 6 existing
`gregmaxfield.substack.com` refs as-is. Then verify all links resolve 200.

> Unblocked NOW: BUG-01, LLM-02, SEO-06, og:image dims (SEO-04 part), StructuredData component scaffold,
> BlogPosting/Article, WebSite+Organization, FAQ block, SEO-03.
> Still waiting: twitter:site value (Q2), Book schema fields (Q3), sameAs arrays (Q4).

---

## Phase 0 — Triage & blocker resolution
**Status:** complete
- [x] Read ticket backlog + PM handoff
- [x] Ground each ticket against current codebase (see findings.md)
- [x] Get Greg's answers: Q1 ✅ Q2 ✅ · Q3/Q4 trailing (Book fields, sameAs) — placeholders in code
- [x] Confirm first-iteration scope: Phase 1 + 2 + LLM-01 (+SEO-03)

## Phase 1 — Quick wins (S effort, high value/effort ratio)
**Status:** complete · **Tickets:** BUG-01, LLM-02, SEO-04, SEO-06
- [x] BUG-01 — TUP Substack unified to `gregmaxfield.substack.com` (fixed llms.txt + the-book-leaves-home). dist scan: zero `theunfoldingplot` left.
- [x] LLM-02 — llms.txt now "available now" + "Paperback, Hardcover & Kindle" (matches live site).
- [x] SEO-04 — og:image:width/height/alt + twitter:site/creator (`@Greg_Maxfield5`) + twitter:image:alt. File: BaseHead.astro
- [x] SEO-06 — `<meta name="author" content="Greg Maxfield">` added. File: BaseHead.astro
- [x] Build passes; tags verified in dist output

## Phase 2 — Structured-data foundation
**Status:** complete (sameAs partial) · **Tickets:** SEO-01, SEO-02, LLM-03
- [x] Reusable `src/components/StructuredData.astro` + central `src/data/schema.ts` (single source of truth)
- [x] SEO-01 — Person (home, /about, book page), Book (/the-lund-covenant + home), WebSite + Organization sitewide. All emit as one @graph via BaseHead. Verified valid JSON.
- [x] SEO-02 — BlogPosting on each post (headline, author, dates, image, mainEntityOfPage). File: BlogPost.astro
- [~] LLM-03 — sameAs has Substack + X now; **TODO(Q4): add Amazon author page + Goodreads** in schema.ts AUTHOR_SAME_AS
- [ ] Validate in Google Rich Results Test (manual, post-deploy — needs live URL)

## Phase 3 — AI-answer surface
**Status:** LLM-01 complete · **Tickets:** LLM-01, LLM-04
- [x] LLM-01 — visible FAQ block on homepage (#faq) + FAQPage JSON-LD, both from shared `FAQ_ITEMS` so they can't drift. 5 Qs. Verified visible + valid.
- [ ] LLM-04 — publish /llms-full.txt (deferred to next iteration)
- [x] FAQPage validates (JSON parses; RRT check post-deploy)

## Open TODOs before/at deploy
- ~~Q3: ISBNs~~ ✅ DONE — 3 workExample editions (HC/PB/Kindle) wired + verified in dist.
- **Q4:** Amazon author page + Goodreads URLs → `AUTHOR_SAME_AS` in schema.ts (only remaining input).
- Post-deploy: run Google Rich Results Test on live Person/Book/Article/FAQPage.
- OGF "Over 2,000 readers" figure in llms.txt left as-is (not verifiable; flag for Greg).

## Phase 4 — Longer plays (P1/P2 tail)
**Status:** todo · **Tickets:** SEO-03, SEO-05, SEO-07, LLM-05
- [ ] SEO-03 — ogType prop (default website, article for posts) + article:published_time/modified_time/author. Files: BaseHead.astro, BlogPost layout
- [ ] SEO-05 — sitemap lastmod via Astro sitemap serialize option. File: astro.config.mjs
- [ ] SEO-07 — cornerstone content + internal linking; clarify /books vs /the-lund-covenant canonical
- [ ] LLM-05 — instrument AI-crawler visibility in Vercel logs (ops, no code)

---

## Recommended first iteration (validate with Greg)
Per handoff + my triage: **Phase 1 (quick wins) + Phase 2 (structured-data foundation) + LLM-01 (FAQ)**.
Rationale: quick wins are near-zero-risk consistency fixes; the JSON-LD component is build-once/
reuse-many and unlocks the single biggest gap; the FAQ is the top LLM-citation lever.
SEO-03 folds naturally into Phase 2 since both touch BaseHead — consider pulling it forward.

## Decisions
- Isolated plan (`.planning/2026-07-14-seo-llm-optimization/`) so the completed June launch plan at repo root is preserved.
- All work is additive metadata/structured-data — no redesign, minimal copy change.
- Deploy safety: repo takes external pushes. Re-verify `git status`/`git log` immediately before any production push; stop if origin diverged.

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| (none) | | |
