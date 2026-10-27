# Satark AI — Verification & Handoff

**Status:** Phase 5 verification plus the 2026-10-27 follow-up repairs are complete. Phases 1–4 remain implemented.
**Repository state:** All changes remain **uncommitted and unpushed** on `main`. No commit, push, reset, clean, or revert was performed.
**Environment:** Node.js `v18.19.1`; Next.js `14.2.35`; test runner `node --import tsx --test tests/*.test.ts`; ESLint `8.57.1` with `eslint-config-next` `14.2.35`.

---

## 1. Final results

| Check | Actual result |
|---|---|
| `npm test` | **240 passing, 0 failing, 40 suites**; 0 cancelled, 0 skipped |
| `npm run lint` | **passing** — no warnings or errors |
| `npm run typecheck` | **passing** (`tsc --noEmit`) |
| `npm run build` | **passing**; `/`, `/_not-found`, `/api/analyze-url`, `/api/evidence-pdf`, `/api/scan-ai`; homepage First Load JS **229 kB** |
| Production API smoke | **12/12 checks passed**, including safe validation failures, a valid PDF response, and live `https://example.com/` analysis |
| Aadhaar/core detection regressions | **18/18 passing** in `tests/detection-boundaries.test.ts` |
| URL SSRF/redirect tests | **41/41 passing** in `tests/url-analysis.test.ts` |
| Client-IP/rate-limit trust | **8/8 passing** across `tests/client-ip.test.ts` and `tests/rate-limit-trust.test.ts` |
| Firefox responsive checks | **45/45 passed** at true CSS viewports **390 × 844**, **768 × 1024**, and **1366 × 900** |
| Evidence PDF browser download | **Verified to disk**: 2 pages, PDF 1.7, 5,705 bytes; `pdftotext` found the expected name, reference, amount, description, and no-report disclaimer |
| Gemini live check | Key accepted; benign synthetic scan succeeded with `gemini-flash-lite-latest`. The current `.env.local` model `gemini-2.0-flash-lite` returns provider 404 and falls back correctly |
| Safe Browsing live | **Not configured** (no key); not treated as clean |
| URLhaus live | **Unavailable** anonymously; not treated as clean |
| RDAP/outbound URL live | **Working** against `https://example.com/`: HTTPS fetch and RDAP registration data succeeded |

The build route table and browser checks were rerun after the final code changes. The browser harness is temporary and is not part of `npm test`.

---

## 2. Repairs completed in this follow-up

### Message detection

- Added contextual Aadhaar/KYC handling in `src/lib/scanner/rules.ts`.
- Official onboarding copy mentioning UIDAI, `uidai.gov.in`, mAadhaar, 1947, authorised Aadhaar/UIDAI centres, or a bank branch no longer raises a fake-KYC signal by itself.
- The exemption is not blanket:
  - unofficial links,
  - UIDAI-like lookalike hostnames,
  - mobile-only contact routes,
  - pressure/deadline language,
  - active OTP/PIN/password or identity-document requests
  still raise risk.
- Fixed two genuine core false negatives:
  - YouTube/Telegram task job offers using “pay to unlock” wording now produce `JOB_TASK_TELEGRAM` + `CTX_JOB_EARNINGS_WITH_UPFRONT_FEE`.
  - CBI/legal coercion using “CBI notice”, “case has been filed”, “safe account”, or “arrested” now produces `URG_LEGAL_ARREST_EXTORTION`.
- Added `tests/detection-boundaries.test.ts` covering legitimate Aadhaar onboarding, ambiguous KYC reminders, KYC phishing, official-domain lookalikes, OTP theft, fake refunds, fraudulent jobs, bank impersonation, government impersonation, and an ordinary bank-branch reminder.

### Rate-limit trust model

- Added `src/lib/http/client-ip.ts` and applied it to the AI, URL, and evidence routes.
- Forwarded headers are **ignored by default**. Direct clients share the safe `direct` bucket.
- Trusted deployments can set:
  - `TRUST_PROXY_HEADERS=true`
  - `TRUST_PROXY_HOPS=1` (or the exact number of appended proxy hops)
- When enabled, the helper selects the hop from the right side of the chain, so a caller cannot rotate leftmost spoofed values to bypass limits.
- Added `tests/client-ip.test.ts` and `tests/rate-limit-trust.test.ts`; existing route tests now opt into trusted mode explicitly.

### UI and browser checks

- Recreated a Firefox WebDriver harness and used WebDriver BiDi `browsingContext.setViewport` to obtain a true **390 CSS px** viewport instead of Firefox's 500 px minimum window width.
- Checked 390, 768, and 1366 px:
  - true viewport width,
  - no horizontal page overflow,
  - scanner inputs fit,
  - mobile menu open/Escape,
  - sample tab switching,
  - URL/QR panel switching,
  - evidence tab and form usability.
- No layout or interaction regression was found at these widths.

### Evidence PDF

- Used Firefox download preferences with a directory the Snap-packaged browser can access.
- Submitted the evidence form through the browser at 390 px, received the success state, and confirmed the file was saved.
- Validated the downloaded file:
  - name: `satark-evidence-20261027-084313Z.pdf`
  - pages: 2
  - version: PDF 1.7
  - size: 5,705 bytes
  - title: `Satark AI - Incident Evidence Summary`
  - extracted text contained `Browser Test User`, `BROWSER-PDF-20261027`, amount `499`, the description, and `No report has been submitted by Satark AI`.
- The temporary download directory was used only for verification.

### Linting

- Added `.eslintrc.json` with `next/core-web-vitals`.
- Added compatible dev dependencies:
  - `eslint@^8.57.1`
  - `eslint-config-next@^14.2.35`
- Fixed the lint findings:
  - added keys to icon arrays in `src/app/page.tsx`;
  - renamed a non-hook helper in `src/components/help/PhoneCallChecker.tsx` so it is not mistaken for a React hook.
- `npm install` emitted `EBADENGINE` warnings for some transitive packages that prefer Node 20, but `npm run lint` and the full build pass on Node 18.19.1.

### Live integrations

- **Gemini:** the configured key is valid. A live benign synthetic scan using `gemini-flash-lite-latest` returned `success: true`, category `benign_communication`, and `no_strong_warning`.
- The current local `.env.local` sets `gemini-2.0-flash-lite`; Google returned **404** for that model. The route correctly returned `PROVIDER_ERROR` and preserved rules-only fallback.
- **Safe Browsing:** no key is configured. The live URL report returned `not_configured`.
- **URLhaus:** anonymous live lookup returned `unavailable`. The report does not treat that as clean.
- **RDAP/outbound:** live analysis of `https://example.com/` succeeded and returned IANA registrar data with a 1995 creation date.
- No live credentials were invented, exposed, or written to logs.

---

## 3. Security behavior rechecked

- URL validation rejects localhost, private, loopback, link-local, CGNAT, and mixed public/private DNS answers.
- Connections use DNS pinning and validate the connection-time lookup.
- Each redirect hop is revalidated before the request is made.
- Redirect-to-private is blocked, redirect loops are detected, and the redirect limit is enforced.
- URL responses can be inconclusive; no service is reported clean when unconfigured or unavailable.
- The default rate-limit path cannot be bypassed by rotating `X-Forwarded-For`.
- No security check was weakened to make a test pass.

---

## 4. Start and demo instructions

```bash
npm install
npm run build
PHASE2_DEMO_MODE=false npm start -- -p 3000
# http://localhost:3000/
```

For the built-in simulated URL samples only:

```bash
PHASE2_DEMO_MODE=true npm start -- -p 3000
```

Keep demo mode off in production. Do not enter real OTPs, passwords, Aadhaar numbers, card data, or UPI PINs.

For a trusted reverse proxy, set `TRUST_PROXY_HEADERS=true` and the correct `TRUST_PROXY_HOPS` before starting the server. Do not enable proxy trust when the app is directly exposed to the internet.

If Gemini returns a 404 provider error, set `GEMINI_MODEL=gemini-flash-lite-latest` or remove the variable so the app's default is used.

---

## 5. Manual browser checks for the user

1. **Legitimate Aadhaar onboarding**
   - Message Scanner → paste: `Your Aadhaar e-KYC verification is pending. Complete it at your nearest bank branch or uidai.gov.in.`
   - Expect low/no strong warning and no fake-KYC signal.
2. **Aadhaar phishing**
   - Paste: `Your Aadhaar KYC is pending. Update at https://uidai-kyc-verify.top/login`
   - Expect HIGH RISK with fake-KYC and lookalike-domain signals.
3. **Core scam regressions**
   - Paste the YouTube/Telegram task message and the CBI “safe account” message from `tests/detection-boundaries.test.ts`.
   - Expect HIGH RISK.
4. **Mobile layout**
   - Set the browser to 390 px CSS width using device emulation.
   - Open the header menu; confirm it opens, links are usable, and Escape closes it.
   - Switch the sample tabs and URL/QR tabs; confirm no horizontal scrolling.
5. **Tablet layout**
   - Repeat at 768 px; confirm the mobile menu is used below `xl`, content fits, and no overflow appears.
6. **Evidence PDF**
   - Open Help Hub → Evidence PDF.
   - Fill a description, amount, reference, and a harmless suspicious URL.
   - Click **Download evidence PDF**.
   - Confirm the browser saves a 2-page PDF and that it contains the entered details, the no-report disclaimer, and the Satark AI title.
7. **Live integrations**
   - With a valid Gemini model configured, run one benign message with AI enabled and confirm the AI badge/result.
   - In URL Scanner, analyze `https://example.com/` with demo mode off. Confirm RDAP/outbound data appears; Safe Browsing/URLhaus should show not configured/unavailable unless keys are supplied.

---

## 6. Known limitations

- **Aadhaar rule context is heuristic.** Official-channel wording reduces false positives, but a novel phishing message can still copy official language. A missing warning is not proof of safety.
- **Rules are English-tuned.** Hindi UI support does not guarantee equivalent Hindi message detection.
- **No live Safe Browsing/URLhaus verification** was possible without keys; URLhaus anonymous access was unavailable.
- **Current local Gemini model is stale.** The code default is valid; `.env.local` needs its model changed before the running app can use live AI.
- **Rate limits are in-memory.** They reset on restart and are not distributed. Direct deployments share one bucket; trusted-proxy configuration is required for per-client buckets.
- **PDF redaction/fonts are limited.** Redaction is best-effort and the PDF is English/Latin-only.
- **Browser evidence is bounded.** Real Firefox checks passed, but there was no screen-reader/axe audit or native-device test.
- **Demo mode is simulated.** It is not live verification and must be off in production.

---

## 7. Git state

Last known state: branch `main`, no new commit, no push. The working tree contains all prior Phase 1–5 application/test changes plus the new Aadhaar, client-IP, rate-limit, ESLint, and regression-test files. Keep the tree uncommitted unless the user explicitly requests a commit.
