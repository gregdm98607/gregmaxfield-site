# Progress Log — SEO & LLM Optimization

## Session 2026-07-14 — Phase 0 triage

### Status
- **Phase:** 0 — Triage & blocker resolution (in_progress)
- New isolated plan created; June launch plan at repo root left untouched.

### Actions taken
- Read PM handoff + ticket backlog (13 tickets: SEO-01..07, LLM-01..05, BUG-01).
- Grounded every ticket against current code (BaseHead.astro, llms.txt, Substack refs, JSON-LD grep).
- Key correction: BUG-01's real conflict is **The Unfolding Plot** (two live URLs), not OGF (consistent).
- Confirmed greenfield for JSON-LD; confirmed SEO-03/04/06 + LLM-02 all still open in code.
- Wrote task_plan.md (5 phases + blocker table) and findings.md (per-ticket ground truth).
- Identified 4 blocking questions (Q1–Q4) that are Greg's to answer.

### Answers received
- Q1 → `gregmaxfield.substack.com` (canonical TUP). Q2 → `@Greg_Maxfield5`. Scope → recommended cut.
- Q3 formats resolved by inspection (live site: Paperback, Hardcover & Kindle). ISBN still needed.

## Session 2026-07-14 (cont.) — Implemented Phase 1 + 2 + LLM-01 + SEO-03

### Actions taken
- **Phase 1 (quick wins):** BUG-01, LLM-02, SEO-04 (+twitter handle), SEO-06. Content + BaseHead edits.
- **Phase 2 (structured data):** created `src/data/schema.ts` (canonical entities + node builders) and
  `src/components/StructuredData.astro` (serializer → one @graph/page). Wired via BaseHead (sitewide
  WebSite+Organization always; page nodes append through new `jsonLd` prop threaded through Base.astro).
  - Person → home, /about, book page · Book → book page + home · BlogPosting → each post.
- **SEO-03** (pulled forward): `ogType` prop + article:published_time/modified_time/author for posts.
- **LLM-01:** homepage #faq visible block + FAQPage schema, both from shared `FAQ_ITEMS` (no drift).
- Files touched: BaseHead.astro, Base.astro, BlogPost.astro, index.astro, about.astro,
  the-lund-covenant.astro, public/llms.txt, blog/the-book-leaves-home.md, +2 new files.

### Test results
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| grep JSON-LD in src | none (pre) | none | ✓ greenfield |
| npm run build | clean | clean, 10 pages | ✓ |
| JSON-LD parse (home/book/about/post) | valid | all valid | ✓ |
| @graph types home | WebSite,Org,Person,Book,FAQPage | exact | ✓ |
| post og:type | article + published_time | present | ✓ |
| meta author / twitter:site | present | present (@Greg_Maxfield5) | ✓ |
| theunfoldingplot in dist | zero | zero | ✓ |
| FAQ visible (5 Qs) | rendered + in schema | both | ✓ |
| llms.txt availability | "available now" + formats | present | ✓ |

### Deferred / open
- LLM-04, SEO-05, SEO-07, LLM-05 → next iteration.
- TODO(Q3) ISBN editions · TODO(Q4) Amazon author + Goodreads sameAs. Placeholders marked in schema.ts.
- Not committed/pushed — awaiting Greg (repo takes external pushes; re-verify git state before any push).

## Session 2026-07-14 (cont.) — Q3 resolved: Book editions wired
- Added 3 `workExample` editions to `bookNode()`: Hardcover (ISBN 979-8234136527), Paperback
  (ISBN 979-8185358207, $16.99), Kindle (ASIN B0H7FPRFP3 → KINDLE_URL). Each with bookFormat + offer.
- Rebuilt clean (10 pages); verified editions in dist Book @graph. Only Q4 (Amazon author + Goodreads
  sameAs) remains as an input; everything else in scope is done + verified.
- **Committed to branch** `claude/gregmaxfield-site-seo-planning-731fc6` as `c79ad7f` (code + .planning).
  NOT pushed. origin/master unchanged at bb9c8df. Next: Google Rich Results Test (needs live/preview URL
  or paste-code), then Q4 sameAs follow-up.

### Errors
| Error | Resolution |
|-------|------------|
| (none) | |
