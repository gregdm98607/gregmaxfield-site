# Security Review — gregmaxfield.com

**Prepared for:** Product Manager
**Reviewed by:** Security review (CSO lens)
**Date:** 2026-07-14
**Scope:** Full source tree of `gregmaxfield-site` (Astro static site) — `src/`, `scripts/`, `public/`, CI workflow, deploy configuration, dependencies.
**Application type:** Static site (Astro SSG, no server adapter). Deployed to Vercel. No server-side routes, no database, no authentication.

---

## Executive Summary

The site is a low-risk static marketing/author site. There is **no server-side attack surface** (no API routes, no SSR, no user accounts, no stored data), which caps the blast radius of most issues. Content is author-controlled, and no hardcoded credentials for privileged services were found.

The review surfaced **7 findings**: none are critical. The two most material items are (1) a third-party newsletter API key embedded in client-side code — already flagged in-code as tech debt — and (2) the absence of HTTP security headers / Content-Security-Policy. Both are straightforward to remediate and are recommended before the book-launch traffic ramp.

| ID | Finding | Severity | Effort to fix |
|----|---------|----------|---------------|
| SEC-01 | ConvertKit/Kit V3 API key exposed in client-side JS | **Medium** | Medium |
| SEC-02 | No HTTP security headers / Content-Security-Policy | **Medium** | Low |
| SEC-03 | Content-only auto-deploy does not account for MDX script injection | **Medium** | Low |
| SEC-04 | "Sneak peek" chapter gated only by `noindex` (security-through-obscurity) | Low | Low |
| SEC-05 | Third-party scripts loaded without Subresource Integrity (SRI) | Low | Low |
| SEC-06 | Image script accepts API key as a CLI argument | Low | Low |
| SEC-07 | No automated dependency vulnerability scanning in CI | Low / Info | Low |

---

## Findings

### SEC-01 — ConvertKit/Kit V3 API key exposed in client-side JavaScript — **Medium**

**Location:** [`src/layouts/Base.astro:50`](src/layouts/Base.astro) (also used lines 81–97)

```js
const KIT_API_KEY = '1DPMCQ3iN_j0o-HFQ_sRLA';
```

The newsletter signup handler embeds the Kit (ConvertKit) **V3 `api_key`** directly in the page HTML, so it ships to every visitor and is trivially readable via "View Source." The code comment already acknowledges this: *"public V3 key — consolidate via serverless proxy later."*

**What the key can and cannot do.** This is the *public* `api_key`, not the `api_secret`. It therefore **cannot** read your subscriber list or export subscriber data (those endpoints require `api_secret`, which is correctly absent from the repo). It **can** be used by anyone to:
- Subscribe arbitrary email addresses to your tags/forms/sequences (list pollution, spam sign-ups, and — depending on your Kit plan — inflated subscriber counts / cost).
- Enumerate your forms, tags, and sequences.

**Impact:** Newsletter list integrity and potential billing abuse — not a subscriber-data breach. Realistic worst case is an automated script mass-subscribing junk addresses, degrading deliverability and inflating counts ahead of launch.

**Recommendation:**
1. Move the subscribe call behind a lightweight serverless function (Vercel Function / edge route) that holds the key server-side and adds a rate limit + basic bot check (honeypot or Turnstile). This is the fix the code comment anticipates.
2. Alternatively, use Kit's hosted/embedded form, which does not expose the key in your own bundle.
3. Confirm with Kit that this value is the public `api_key`; if there is any chance the `api_secret` was ever pasted here or into history, **rotate it**.

---

### SEC-02 — No HTTP security headers / Content-Security-Policy — **Medium**

**Location:** Repository-wide — there is no `vercel.json`, no header configuration, and no CSP `<meta>` tag in [`src/components/BaseHead.astro`](src/components/BaseHead.astro).

The site sends no defensive HTTP headers. Missing:
- **Content-Security-Policy** — the primary mitigation against XSS and unauthorized script injection. Notable because the site runs inline scripts plus third-party scripts (Google Analytics, Google Fonts).
- **X-Frame-Options / `frame-ancestors`** — clickjacking protection.
- **X-Content-Type-Options: nosniff**, **Referrer-Policy**, **Permissions-Policy**.

(Vercel serves HSTS on custom domains by default; the rest are the site's responsibility.)

**Impact:** Defense-in-depth gap. On a static author site the immediate exploitability is low, but a CSP is the single highest-leverage control and clickjacking protection is cheap. Worth having in place before launch-week traffic.

**Recommendation:** Add a `vercel.json` `headers` block (or a CSP meta tag) setting `Content-Security-Policy`, `X-Frame-Options: DENY` (or `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`. Build the CSP allowlist to cover the known third parties: `googletagmanager.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, and `api.convertkit.com`. **Note:** `astro.config.mjs` is a `sensitive_file` in the deploy guard but `vercel.json` is only listed as sensitive and does not yet exist — creating it will trigger the intended human-review lane.

---

### SEC-03 — Content-only auto-deploy does not account for MDX script injection — **Medium (governance)**

**Location:** [`.autorelease`](.autorelease), [`.deployconfig.yml`](.deployconfig.yml), [`.deployguard`](.deployguard); content loaded from `src/content/blog/**/*.{md,mdx}` per [`src/content.config.ts:7`](src/content.config.ts).

The deploy pipeline auto-releases ("Lane 1") for **content-only** changes without human review, and the sensitive-file guard covers `.env*`, `astro.config.mjs`, `src/pages/api/**`, `vercel.json`, `netlify.toml` — but **not** `src/content/`. The content collection accepts **MDX**, and MDX permits embedded JSX/HTML/`<script>`. A content change is therefore not automatically a safe change: a malicious or compromised MDX file could introduce executing script into the site with no human in the loop.

**Impact:** If an attacker gains write access to the content directory (or a bad commit slips through), the "content-only = safe, auto-deploy" assumption lets script reach production unreviewed. Today the blog contains only trusted `.md`, so this is a latent process risk rather than an active exploit.

**Recommendation:** Either (a) restrict the auto-deploy lane to `.md` only and route any `.mdx` change through human review, or (b) add a build-time lint that rejects raw `<script>`/JSX in content, or (c) enforce a CSP (SEC-02) strong enough that injected inline script cannot execute. Document the decision in `.deployguard`.

---

### SEC-04 — "Sneak peek" chapter gated only by `noindex` — **Low**

**Location:** [`src/pages/sneak-peek.astro:5`](src/pages/sneak-peek.astro); sitemap exclusion in [`astro.config.mjs:10`](astro.config.mjs).

The chapter-preview page is excluded from the sitemap and marked `noindex`, but it is a fully public URL — `noindex` is a crawler hint, not access control. Anyone with the link reaches it.

**Impact:** Currently none (the page holds only placeholder text). The risk is **future**: the TODO indicates real Chapter 1 manuscript text will be pasted in. At that point, any content intended to be "gated" (e.g., email-gated free chapters) will in fact be fully public to anyone who knows or guesses the URL.

**Recommendation:** Treat `noindex` as SEO hygiene, not a gate. If the free-chapter offer is meant to require an email, implement real gating (server function + token, or Kit-delivered content). If the preview is intentionally open, no action needed — just make the "gated vs. public" decision explicit before manuscript text goes in.

---

### SEC-05 — Third-party scripts loaded without Subresource Integrity — **Low**

**Location:** [`src/components/BaseHead.astro`](src/components/BaseHead.astro) — `googletagmanager.com/gtag/js`, Google Fonts stylesheet.

External scripts/stylesheets are loaded without `integrity` (SRI) pinning. If a third-party CDN were compromised, arbitrary code could execute in visitors' browsers.

**Impact:** Supply-chain risk. Low and largely accepted industry-wide for Google Analytics/Fonts (their URLs are versionless and SRI is impractical for gtag). Noted for completeness.

**Recommendation:** Accept as residual risk for gtag/Fonts, but let a Content-Security-Policy (SEC-02) bound what a compromised third party could do. Apply SRI to any self-hostable or version-pinned third-party asset added later.

---

### SEC-06 — Image-generation script accepts API key as a CLI argument — **Low**

**Location:** [`scripts/generate_featured_images.py:107`](scripts/generate_featured_images.py) (`--api-key`).

The script reads the Gemini key from the `GEMINI_API_KEY` env var (good) but also accepts `--api-key YOUR_KEY` on the command line. CLI arguments are visible in shell history and in the process list (`ps`) to other users on the same machine.

**Impact:** Minor, developer-local. The default env-var path is the secure one; no key is hardcoded in the repo.

**Recommendation:** Prefer env var / `.env` only; if the CLI flag is kept for convenience, add a note discouraging its use on shared machines. No repo-level secret exposure exists today.

---

### SEC-07 — No automated dependency vulnerability scanning — **Low / Informational**

**Location:** [`.github/workflows/frontend-check.yml`](.github/workflows/frontend-check.yml); no Dependabot config.

CI runs `npm ci` + `npm run build` but no `npm audit` (or equivalent), and there is no Dependabot/renovate configuration. Dependencies (`astro`, `sharp`, `@astrojs/*`) will not be automatically checked for known CVEs.

**Impact:** Vulnerable transitive dependencies could go unnoticed. `sharp` in particular is a native image library that has historically had CVEs.

**Recommendation:** Enable GitHub Dependabot alerts + version updates (a few lines in `.github/dependabot.yml`), and optionally add a non-blocking `npm audit --audit-level=high` step to CI.

---

## Verified Clean / Good Practices Observed

The following were checked and found sound — recorded to document coverage:

- **No hardcoded privileged secrets.** No `api_secret`, private keys, passwords, or tokens in source. The Gemini key is env-sourced; `.env` / `.env.production` are correctly git-ignored.
- **No dangerous rendering.** No `set:html`, `innerHTML`, `eval`, or `dangerouslySetInnerHTML` anywhere in `src/`. Blog content renders through Astro's default-escaping `render()`.
- **No server attack surface.** Static output — no API routes (`src/pages/api/**` does not exist), no SSR, no DB, no auth to misconfigure.
- **CI is not fork-exploitable.** The workflow triggers on `pull_request` (not `pull_request_target`) and defines no secrets, so untrusted fork PRs run unprivileged with nothing to steal or inject. Actions are pinned to major versions.
- **User input is minimal and offloaded.** The only user input (newsletter email + first name) is sent directly to Kit's API; it is never reflected into the page or stored, so classic injection/XSS via the form is not applicable (see SEC-01 for the key-exposure caveat).
- **Analytics IDs and site-verification tokens** (GA4 `G-…`, Bing/impact verification) are public by design — not findings.

---

## Recommended Prioritization

1. **Before launch traffic:** SEC-02 (headers/CSP) and SEC-01 (proxy the Kit key). Both are quick and directly reduce abuse/injection exposure during the highest-visibility window.
2. **Process hygiene, near-term:** SEC-03 (tighten the auto-deploy lane) and SEC-07 (Dependabot).
3. **Decide before manuscript text lands:** SEC-04 (is the sneak peek gated or public?).
4. **Low-priority cleanup:** SEC-05, SEC-06.

*No critical or high-severity vulnerabilities were identified. The overall posture is appropriate for a static marketing site; the recommendations above are hardening and governance improvements rather than urgent fixes.*
