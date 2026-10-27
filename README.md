# Satark AI 🛡️

**AI-powered scam detection and digital safety platform for India.**  
Stay Alert. Stay Protected.

> **Status (2026-10-26):** Phases 1–4 are implemented and Phase 5 validation is complete. All changes remain **uncommitted and unpushed** on `main`. See [`PROGRESS.md`](PROGRESS.md) for the verification report and handoff, and the [three-minute demo](#three-minute-demo-safe-no-keys) for a safe walkthrough.

---

## Overview

Satark AI helps users identify potential cyber scams in messages, links, QR codes, and UPI payment requests — SMS, WhatsApp forwards, emails, and more — using a hybrid analysis engine:

1. **Deterministic Rules Engine** (always runs, no external calls) — pattern-based detection for OTP theft, bank impersonation, UPI fraud, job/task scams, phishing, and more.
2. **Google Gemini AI Layer** (opt-in, sends only redacted text) — context-aware explanations, scam classification, evidence highlighting, and tailored recommendations.
3. **Phase 2 URL & QR Pipeline** — SSRF-safe URL validation and redirect tracing, RDAP domain registration lookup, optional Safe Browsing/URLhaus reputation checks, in-browser QR decoding, and inert UPI payment-request parsing.
4. **Phase 3 Help Layer** — time-ordered emergency guidance, six safety playbooks, local phone-format and call-script checks, and downloadable evidence PDFs with redaction and clear limitations. It never files a report or contacts an authority.
5. **Phase 4 Bilingual & Accessible Interface** — an additive English/Hindi interface, remembered language choice, responsive navigation at phone/tablet/desktop widths, keyboard-operable tabs and menus, visible focus, reduced-motion support, and a skippable first-visit introduction.

The rules engine is always the trusted baseline. The AI layer cannot downgrade a confirmed `HIGH_RISK` deterministic finding.

---

## Features

- 🔍 **Hybrid scanner**: deterministic rules + optional Gemini AI analysis
- 🪪 **Context-aware Aadhaar/KYC handling**: official UIDAI, mAadhaar, 1947, or bank-branch onboarding reminders stay low risk; unofficial links, mobile-only contact routes, pressure, and OTP/document demands still raise risk
- 🔒 **Privacy-first**: PII masking before any external request; original text never sent to Gemini
- ✅ **Opt-in AI**: user must explicitly enable AI analysis via an in-UI checkbox
- 📋 **Structured AI output**: category, risk assessment, evidence phrases, manipulation tactics, recommended actions, uncertainties
- 🚫 **Anti-hallucination check**: AI evidence phrases are validated against the actual submitted text
- 🔄 **Graceful fallback**: if API key is absent, quota is exhausted, or Gemini times out, the app continues with rules-only results
- 🇮🇳 **India-focused**: covers UPI fraud, KYC impersonation, Aadhaar/PAN leaks, digital arrest extortion, task scams
- 🌐 **Phase 2 URL analysis**: normalization, bounded redirect tracing, every-hop SSRF checks, DNS pinning, likely lookalike-brand detection, RDAP age, and optional Google Safe Browsing / URLhaus checks
- 📱 **Local QR decoding**: PNG/JPEG validation and `jsQR` decoding happen in browser memory; decoded URLs are submitted to the URL pipeline but are never opened automatically
- 💳 **UPI request parser**: displays payee, UPI ID, amount, currency, and transaction note without initiating a payment
- 🧪 **Labelled demo mode**: deterministic mock results for the built-in sample URLs when `PHASE2_DEMO_MODE=true`
- 🆘 **Emergency action plans**: five scenarios with immediate-safety steps, evidence preservation, account-security actions, reporting routes, and recovery limits
- 📚 **Six safety playbooks**: UPI/payment fraud, phishing links, account compromise, identity theft, online shopping fraud, and threats/extortion
- 📞 **Local call checker**: validates phone-number formatting with `libphonenumber-js` and highlights warning words in the user's description. It does not look up caller identity or reputation, and never labels a number from its format or country code
- 📄 **Evidence PDF export**: a validated, rate-limited server route produces a shareable PDF with separate user-provided and automated-analysis sections, timestamps, URLs, transaction references, next steps, official contacts, disclaimers, and best-effort redaction
- 🇮🇳 **Official Indian channels**: links and contact details for 112, 1930/cybercrime.gov.in, Sanchar Saathi, UIDAI 1947, RBI CMS, and the National Consumer Helpline 1915. Satark AI does not submit anything for the user
- 🗣️ **English + Hindi interface**: user-selectable language, stored locally as `satark_language`; English technical identifiers and severity labels stay stable, and scanner input/results survive a language change without a reload
- ♿ **Accessibility work**: keyboard-operable navigation and tabs, skip link, visible focus, `aria-live` status, non-colour severity labels, and `prefers-reduced-motion` handling (the intro is skipped and motion-safe effects are suppressed)
- 📐 **Responsive layouts**: checked at 390 px phone, 768 px tablet, and 1280 px desktop; the full desktop navigation appears at the `xl` breakpoint and uses non-wrapping labels

---

## Getting Started

### Prerequisites

- Node.js 18.18 or later
- npm 9 or later

### Installation

```bash
git clone https://github.com/a-thapa17/satark-ai.git
cd satark-ai
npm install
```

### Environment Configuration

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Phase 1 (optional AI layer)
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-flash-lite-latest

# Phase 2 (optional reputation services; keys stay server-side)
GOOGLE_SAFE_BROWSING_API_KEY=
URLHAUS_AUTH_KEY=

# Phase 2 limits (defaults shown)
URL_ANALYSIS_MAX_REDIRECTS=5
URL_ANALYSIS_HOP_TIMEOUT_MS=6000
URL_ANALYSIS_TOTAL_TIMEOUT_MS=15000

# Offline sample results only; never enable in production
PHASE2_DEMO_MODE=false

# Rate limiting behind a reverse proxy. Leave false when directly exposed.
# Enable only when a proxy you control overwrites/appends X-Forwarded-For.
TRUST_PROXY_HEADERS=false
# Number of trusted proxy hops in front of Next.js (default 1).
TRUST_PROXY_HOPS=1
```

**Rate-limit client identity and proxy trust:**

- Forwarded headers are client-controlled unless a trusted reverse proxy overwrites or appends them. By default, `TRUST_PROXY_HEADERS=false`, so the app does **not** trust `X-Forwarded-For` or `X-Real-IP`; direct clients share the safe `direct` rate-limit bucket.
- Behind a reverse proxy you control, set `TRUST_PROXY_HEADERS=true`. The app then reads the hop selected by `TRUST_PROXY_HOPS` (default `1`), counting from the right side of the forwarded chain. This prevents a caller from spoofing the leftmost values to rotate buckets.
- Increase `TRUST_PROXY_HOPS` only to match the exact number of proxies that append to the chain. If your proxy overwrites the header with one client address, keep it at `1`.
- The fallback is intentionally a shared bucket rather than an untrusted header. For per-client limits on a public deployment, put the app behind a trusted proxy and enable the setting explicitly.

**Phase 2 keys and fallbacks:**

- `GOOGLE_SAFE_BROWSING_API_KEY` is optional. Without it, Safe Browsing is reported as **Not configured**, which is not treated as a clean result.
- `URLHAUS_AUTH_KEY` is optional. The adapter attempts an anonymous URLhaus lookup, but abuse.ch may reject or rate-limit it. The UI reports that service as **Unavailable** rather than clean.
- RDAP domain registration data uses public endpoints and needs no key.
- `PHASE2_DEMO_MODE=true` returns clearly labelled **simulated** results for the three built-in sample URLs only. It is useful for a no-network demo; it must stay off in production.

The keys are read only in server-side route code and are never included in the client bundle.

**Phase 3 keys:** none. Emergency guidance, safety playbooks, and phone-format/script checks run locally. Evidence PDFs are assembled in memory by the app's own server route using `pdf-lib`; no third-party service, API key, database, or external submission is involved.

**Phase 4 keys:** none. English/Hindi copy, the language preference, the intro marker, and accessibility behavior are bundled/local. No translation API is called.

**Getting a free Gemini API key:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and paste it into `.env.local`

> **Note:** The free tier is sufficient for development and personal use. No billing setup required.

If Gemini returns a `404` provider error, the configured model ID is not available to your API key. Use `GEMINI_MODEL=gemini-flash-lite-latest`, or remove the variable to use the default. The app keeps the local deterministic result when the provider is unavailable.

If `GEMINI_API_KEY` is not set, message analysis runs entirely in rules-only mode. Phase 2 URL analysis may still make external network calls to the submitted URL, RDAP, and configured reputation services; QR image decoding remains local.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Three-minute demo (safe, no keys)

Use a private browser window so the first-visit intro is fresh. The demo deliberately uses the built-in sample URLs, sample QRs, and harmless text. Do not enter a real OTP, Aadhaar number, password, UPI PIN, or API key.

```bash
npm install
npm run build
PHASE2_DEMO_MODE=true npm start -- -p 3010
# open http://localhost:3010/
```

`PHASE2_DEMO_MODE=true` is required for the labelled mock URL threat result. It only affects the three built-in sample URLs. No AI or reputation key is required. Leave the AI toggle off.

| Time | Demo action | What to point out |
|---|---|---|
| 0:00–0:20 | Show the homepage, then click **Skip intro**. | **Phase 1–4 live**, free/no account, 112 and 1930 routes, and the “nothing is reported automatically” disclaimer. |
| 0:20–0:55 | In **Message Scanner**, paste a harmless scam-style sample such as `Your SBI account will be blocked. Share OTP 482913 and Aadhaar 234567890123.` and click **Scan message**. | Deterministic HIGH RISK result, OTP/Aadhaar masked in the displayed analysis, actionable safe steps, and the original text staying in the local input. |
| 0:55–1:25 | In **URL & QR Scanner**, click **Mock threat match**, then **Scan a QR image** → **UPI sample**. | Labelled demo result, malicious match shown as inert text, no auto-open; decoded UPI details, no payment, no PIN request. |
| 1:25–2:00 | In **Help Hub**, switch tabs with the arrow keys, run the **Bank KYC / OTP call** example in **Phone check**, then show **Evidence PDF**. | Keyboard tabs work; “format valid” is not a trust score; no caller-reputation lookup; PDF route produces a redacted, two-page summary and files nothing. |
| 2:00–2:30 | Switch to **हिन्दी**. | Hero/help copy changes without reload; scanner input and result remain; English severity/technical identifiers stay stable. Toggle AI to show the localized “AI unavailable” fallback if time allows. |
| 2:30–3:00 | Resize to phone width, open the menu, and use keyboard focus/reduced-motion if desired. | No horizontal overflow, usable mobile menu, visible focus, and motion reduction. Close with the limitations: estimate, not proof; recovery is not guaranteed; no automatic report. |

Fallbacks if a demo step misbehaves:

- If the URL result is not the labelled mock, confirm the server was started with `PHASE2_DEMO_MODE=true` and restart it. The reserved demo domain may otherwise be checked live.
- If a QR sample cannot decode, use the other built-in sample or the generated image in `public/images/`; QR decoding is local.
- If PDF download is blocked by the browser, show the verified API result from [Evidence PDF API](#evidence-pdf-api) and explain that the route returns the file directly.
- If the AI fallback does not appear, leave AI off; the rules-only result is the reliable default. No key is required for the demo.

**Repeat demo:** use a new private window, or clear `satark_intro_seen`, `satark_language`, and the page’s in-memory scanner state. Never use this demo with real financial or identity details.

---

## Usage

1. **Choose English or हिन्दी** in the header. The choice is stored in `localStorage` under `satark_language`. Changing language does not submit, discard, or reload the current scanner text/result.
2. Paste or type a suspicious message into the Message Scanner.
3. *(Optional, Phase 1)* Enable **AI analysis** to send only the masked message to Google Gemini for contextual interpretation. Leave it off for a key-free demo.
4. Click **Scan message**.
5. Review the results:
   - **Risk level** and **rule-based findings** (always shown)
   - **AI insights panel** — category, summary, evidence, tactics, recommendations, uncertainties (shown when AI analysis is enabled and succeeds)

### Sample Prompts

| Scenario | Expected Behavior |
|---|---|
| `"Your SBI account will be blocked. Share OTP immediately."` | HIGH_RISK, bank impersonation, OTP theft evidence |
| `"Earn ₹5,000/day liking videos. Pay ₹499 to unlock tasks."` | HIGH_RISK, job/task scam, upfront payment evidence |
| `"Hi Rahul, I'll bring your DBMS notes tomorrow."` | No strong warning signs, benign communication |

### URL & QR Scanner (Phase 2)

**URL analysis**

1. Open the **URL & QR Scanner** section.
2. Enter a URL such as `example.com` or `https://example.com/path`.
3. Click **Analyze URL**.
4. Review the four-part result: URL verdict, redirect chain, RDAP domain registration data, and threat-service check status.
5. The result distinguishes **confirmed threat**, **suspicious**, **no known threat**, and **inconclusive**. “Unavailable” and “Not configured” services are never displayed as clean.

**QR scanning**

1. Switch to **Scan a QR image**.
2. Upload a PNG or JPEG QR image (maximum 5 MB, maximum 4096×4096 and 16 MP).
3. The image is validated and decoded locally in your browser. It is not uploaded.
4. If the QR contains an HTTP/HTTPS URL, only that URL is sent to the server-side URL analyzer. It is displayed as inert text and is **never opened automatically**.
5. If the QR contains a UPI payment URI, the payee, UPI ID, amount, currency, and note are displayed. The app never initiates a payment and never asks for a UPI PIN.

Demo QR images are included at `public/images/phase2-demo-url-qr.png` and `public/images/phase2-demo-upi-qr.png`, or you can use the **URL sample** / **UPI sample** buttons.

| Sample URL | Purpose |
|---|---|
| `https://example.com/` | Reserved documentation domain, safe live example |
| `https://onlinesbi-kyc-portal.secure-banking-support.in/login` | Demonstrates lookalike-brand and new-domain warnings |
| `https://malware-demo.satark.example/download` | Reserved demo domain for a simulated confirmed threat match |

With `PHASE2_DEMO_MODE=true`, these three URLs return labelled simulated reports. Other URLs still use real checks.

### Emergency Help, Playbooks & Evidence (Phase 3)

The **Emergency Help** section adds guidance and evidence tools without changing the Phase 1 or Phase 2 scanners. It never calls a number, sends a message, files a complaint, or contacts a bank or authority for you.

**Emergency guidance**

1. Choose the situation: money or financial details taken, online scam, account compromise, identity theft, or threats/extortion.
2. Answer the short safety questions, including whether anyone is in immediate danger and whether money has already left an account.
3. Review the time-ordered plan: immediate actions, evidence to preserve, and reporting options. Use the linked playbooks for separate accounts-to-secure and mistakes-to-avoid checklists.

If there is immediate danger, the plan puts **112** first. For financial cyber fraud in India, it directs users to **1930** and [cybercrime.gov.in](https://cybercrime.gov.in/). Reporting quickly can help a bank act, but **recovery is not guaranteed**. Satark AI never claims that a report was submitted or an acknowledgement was received.

**Six safety playbooks**

- UPI, payment, and banking fraud
- Phishing links and messages
- Account compromise and unauthorized access
- Identity theft and misuse of Aadhaar/PAN details
- Online shopping and seller fraud
- Threats, extortion, and sextortion

Each playbook covers immediate actions, evidence preservation, accounts to secure, reporting options, and mistakes to avoid. The content is general safety guidance, not legal advice.

**Phone / call checker**

1. Enter a number and describe what the caller said.
2. The checker validates the number's formatting locally with `libphonenumber-js` and highlights warning words in your description, such as requests for OTPs, remote-access apps, gift cards, or secrecy.
3. It works without a network request and does not query a carrier, a caller-ID service, or any reputation database.

A **format-valid** result means only that the number is structurally possible. It is not a trust score. The checker does not identify the caller, verify that the number belongs to a bank or agency, or infer fraud from the number, country code, or line type. A caller can use a valid Indian mobile number and still be a scammer.

**Evidence PDF builder**

1. Choose an incident type and add the incident date/time, amount, transaction/UTR reference, and suspicious URLs where available.
2. Add a factual description and, optionally, findings that you copied from the message or URL scanner. Scanner findings are clearly labelled as **user-recorded automated analysis**, not re-run or re-verified by the PDF route.
3. Download the PDF and review it before sharing.

The PDF separates:

- **A.** User-provided incident details
- **B.** User-recorded automated analysis (not re-run or re-verified)
- **C.** Recommended next steps
- **D.** Evidence to preserve
- **E.** Reporting options with official contact details
- **F.** Important limitations

It includes generation and incident timestamps, URLs, transaction references, and disclaimers. The route validates input, rejects unsafe URLs, and applies best-effort redaction before rendering. It does **not** persist the form, call an external service, or submit a complaint. See [Evidence PDF API](#evidence-pdf-api) for limits and error codes.

> Redaction is best-effort, not a guarantee. Do not enter OTPs, passwords, full card numbers, or Aadhaar numbers. Review the PDF before sharing it. PDF fonts are English/Latin-only; other characters are replaced with `?`.

**Official Indian channels** *(verified 2026-10-26; always confirm on the official site)*

| Channel | Use it for | Contact |
|---|---|---|
| Emergency Response Support System (ERSS) | Immediate danger, a crime in progress, fire, or medical emergency | **112** — [112.gov.in](https://112.gov.in/) |
| National Cyber Fraud Helpline | Financial cyber fraud in India, especially money already taken or a misused bank/UPI account | **1930** — [cybercrime.gov.in](https://cybercrime.gov.in/) |
| National Cyber Crime Reporting Portal | Filing the official cybercrime/financial-fraud complaint | [cybercrime.gov.in](https://cybercrime.gov.in/) |
| Sanchar Saathi / Chakshu | Reporting suspected fraud calls, SMS, or WhatsApp messages; spoofed international calls | [sancharsaathi.gov.in](https://sancharsaathi.gov.in/) |
| UIDAI Aadhaar Helpline | Aadhaar-related help and identity-misuse concerns | **1947** — [uidai.gov.in](https://uidai.gov.in/) |
| RBI Complaint Management System | An unresolved complaint about a bank or regulated financial entity | [cms.rbi.org.in](https://cms.rbi.org.in/) |
| National Consumer Helpline | Consumer grievances such as a paid order not delivered or a misleading seller | **1915** — [consumerhelpline.gov.in](https://consumerhelpline.gov.in/) |

Do not call 112 for a routine scam report when no one is in immediate danger. Sanchar Saathi is for suspected fraud communication and spam, not for recovering money or filing a financial-fraud complaint.

### Language, accessibility, and responsive behavior (Phase 4)

The interface can be switched between **English** and **हिन्दी** from the header. The choice is stored locally as `satark_language`; no language data is sent to a server. UI chrome, guidance, scanner labels, and help content have Hindi variants, while technical identifiers and uppercase severity tokens such as `HIGH_RISK` remain stable for support and testing.

- The current scanner input and result stay in memory when the language changes; there is no reload or resubmission.
- The first-visit cinematic introduction is a session-only enhancement (`satark_intro_seen`). It always exposes **Skip intro** and a direct **112** link, and is skipped automatically when reduced motion is requested.
- Help Hub tabs and the URL/QR tabs support roving focus with Arrow keys, Home, and End. The mobile menu moves focus to its first link and Escape returns focus to the menu button.
- The skip link, visible focus rings, `aria-live` result/status regions, labelled form controls, and non-colour severity text are part of the automated tests and were also exercised in Firefox.
- Layouts were checked with true CSS viewports of 390 px (phone), 768 px (tablet), and 1366 px (desktop) using Firefox's BiDi viewport override. The full desktop navigation appears at the `xl` breakpoint with non-wrapping labels; below that, the compact menu is used. No horizontal overflow was found at the tested widths.

Limitations: this is an automated-markup and real-browser keyboard/focus check, **not** a screen-reader or native-device audit. Hindi coverage is additive and may lag newer AI-generated copy. AI output can remain English; the deterministic rules are currently tuned for English text. The evidence PDF remains English/Latin-only.

### URL Analysis API

`POST /api/analyze-url`

```json
{ "url": "https://example.com/" }
```

A successful request returns `{ "success": true, "report": { ... } }`. Validation and SSRF failures return a 4xx response with:

```json
{ "success": false, "code": "INVALID_URL", "message": "…" }
```

The route enforces a small JSON body limit and an in-memory limit of 10 URL scans per minute per client IP. It uses the Node.js runtime because redirect tracing, DNS validation, and connection pinning require Node network APIs.

### Evidence PDF API

`POST /api/evidence-pdf`

Creates an incident evidence summary PDF. This endpoint validates, redacts, and renders the supplied details in memory. It does **not** contact a bank, platform, police station, or authority, and it does **not** submit a report.

```json
{
  "incidentType": "financial_fraud",
  "incidentAt": "2026-10-25T19:45",
  "name": "Asha Verma",
  "contact": "asha@example.in",
  "amount": "INR 4,500",
  "transactionRef": "UTR-445566778899",
  "description": "A caller claimed to be from my bank and asked me to approve a UPI collect request. After I approved it, INR 4,500 left my account.",
  "scannerFindings": "Deterministic scanner: HIGH_RISK — bank impersonation and urgency.",
  "suspiciousUrls": ["https://example.com/fake-bank-login"]
}
```

`incidentType` must be one of `financial_fraud`, `online_scam`, `account_compromise`, `identity_theft`, `threats_extortion`, or `other`. `description` is required. The optional fields are `playbookId`, `incidentAt`, `name`, `contact`, `amount`, `transactionRef`, `scannerFindings`, and `suspiciousUrls`.

`playbookId` selects the guidance used in Sections C–E. Valid values are `upi_payment_fraud`, `phishing_links`, `account_compromise`, `identity_theft`, `shopping_fraud`, and `threats_extortion`. When omitted, the route picks a default for the incident type.

Limits:

- Request body: **24,576 bytes**
- Description: **3,000 characters**
- Scanner findings: **2,500 characters**
- Suspicious URLs: **5**, each at most **2,048 characters**; only `http://` and `https://` are accepted
- Name **80**, contact **120**, amount **40**, transaction reference **128**, incident date/time **40** characters
- **8 PDF requests per minute per client IP**, enforced in memory

A successful response is a PDF attachment with `Content-Type: application/pdf`, `Content-Disposition: attachment`, and `Cache-Control: no-store`.

Errors use a JSON body:

```json
{ "success": false, "code": "INVALID_URL", "message": "…" }
```

| Status | Meaning |
|---|---|
| `400` | Invalid JSON, malformed field, missing description, invalid/unsafe URL, or overlong field |
| `413` | Request body exceeds 24 KB |
| `429` | Per-IP PDF rate limit reached |
| `500` | PDF generation failed; nothing was filed or saved |

The route uses the Node.js runtime because PDF generation uses `pdf-lib`. Redaction is applied before rendering, but it is best-effort; users should not enter secrets at all. PDF text uses standard Helvetica fonts, so non-Latin characters are replaced with `?`.

---

## Architecture

```
User submits message
        │
        ▼
 Input Validation
        │
        ▼
Deterministic Rules Engine ──────────────────────────────────────┐
        │                                                        │
        ▼                                                        │
  PII Masking                                                    │
  (Aadhaar, PAN, card, OTP, phone, email)                       │
        │                                                        │
        ▼                                                        │
  AI Enabled? ──No──► Display rules-only result ◄───────────────┘
        │Yes                                                     ▲
        ▼                                                        │
  POST /api/scan-ai                                              │
  (server-side, masked text only)                               │
        │                                                        │
        ▼                                                        │
  Gemini API call                                               │
  (structured JSON schema, 25s timeout)                         │
        │                                                        │
        ▼                                                        │
  Response Validation                                           │
  - Allowed category/verdict                                    │
  - Evidence phrase verification (anti-hallucination)          │
        │                                                        │
        ▼                                                        │
  combineWithAi()                                               │
  HIGH_RISK rule verdict preserved                              │
        │                                                        │
        ▼                                                        │
  Display combined result ◄───── Error/Timeout ────────────────┘
```

### Phase 2 URL & QR Architecture

```
URL input ──► Normalize + static validation
                    │
                    ▼
             DNS resolution check (all answers must be public)
                    │
                    ▼
       Pinned-DNS request (revalidated at connect time)
                    │
                    ▼
       Redirect 3xx? ──yes──► Validate every destination + SSRF check
          │no                         │
          ▼                           ▼
       Final URL ◄──────────── bounded chain / loop detection
          │
          ├──► Google Safe Browsing (if key configured)
          ├──► URLhaus (optional Auth-Key)
          ├──► RDAP domain registration
          └──► Local URL/redirect heuristics
                    │
                    ▼
       MALICIOUS | SUSPICIOUS | NO_KNOWN_THREAT | INCONCLUSIVE

QR image ──► type/size/header validation (browser)
                    │
                    ▼
          jsQR decode in browser memory
                    │
        ┌───────────┼────────────┐
        ▼           ▼            ▼
   HTTP(S) URL   UPI payment   plain text
        │           │            │
        ▼           ▼            ▼
   URL pipeline   UPI parser   inert display
   (server-side)  (no payment) (no execution)
```

**SSRF and redirect protections**

- Only `http://` and `https://` URLs on standard ports 80/443 are accepted.
- Direct IP literals must be globally routable. Hostnames must have multiple labels and cannot end in `.local`, `.internal`, `.lan`, `.localhost`, and similar internal suffixes.
- DNS answers are checked before each request; if **any** answer is private, loopback, link-local, CGNAT, multicast, documentation, or otherwise reserved, the destination is blocked.
- The same DNS lookup used for the check pins the connection address. This closes the validation-to-connection rebinding window.
- Redirects are followed manually with a configurable limit. Every destination is statically validated and DNS-checked before it is requested. Redirect loops and HTTPS→HTTP downgrades are flagged.
- Response bodies are not downloaded during redirect tracing.
- Threat-service and RDAP calls use timeouts and fail closed into explicit **Unavailable** / **Not configured** / **Error** states.

### Phase 3 Help & Evidence Architecture

```
Help Hub (client tabs)
   │
   ├── Emergency guidance
   │      └── Deterministic scenario routing
   │            ├── 112 first when immediate danger
   │            ├── evidence + account-security steps
   │            └── verified official reporting resources
   │
   ├── Six safety playbooks (static, reviewed content)
   │
   ├── Phone / call checker
   │      ├── libphonenumber-js formatting validation (local)
   │      └── warning-word analysis of the user's description (local)
   │            └── no carrier/reputation lookup; format ≠ trust
   │
   └── Evidence PDF form
          │
          ▼
   POST /api/evidence-pdf
          │
          ├── 24 KB body limit + in-memory 8/min rate limit
          ├── field/date/URL validation
          ├── best-effort redaction (OTP, password, token, PIN,
          │   card, Aadhaar, PAN, bank account, URL secrets)
          ├── separate user-provided vs automated-analysis sections
          ├── report content + limitations + official contacts
          └── pdf-lib render in memory
                 │
                 ▼
          attachment download (no-store)
          No database, no external service, no report submitted
```

### Phase 4 Interface Architecture

```
LanguageProvider (client)
   ├── localStorage: satark_language
   ├── English/Hindi copy modules
   └── re-render in place (scanner input/result kept in memory)
        │
        ├── SiteHeader: compact menu < xl, full nav at xl
        ├── CinematicIntro: session marker + reduced-motion skip + 112 link
        ├── HelpHub / Phase2 tabs: roving focus (Arrows/Home/End)
        └── skip link, focus rings, aria-live status, non-colour labels
```

### Key Files

| File | Purpose |
|---|---|
| `src/lib/scanner/engine.ts` | Deterministic rules engine + `combineWithAi()` |
| `src/lib/scanner/rules.ts` | Rule definitions (patterns, weights, categories) |
| `src/lib/scanner/masking.ts` | PII masking (Aadhaar, PAN, card, OTP, phone, email) |
| `src/lib/scanner/types.ts` | TypeScript types for `ScanReport`, `AiAnalysisReport` |
| `src/app/api/scan-ai/route.ts` | Server-side Gemini integration with rate limiting |
| `src/components/MessageScanner.tsx` | UI: input, opt-in toggle, dual-stage results panel |
| `src/lib/url/validation.ts` | URL normalization, port/credential checks, DNS public-address validation |
| `src/lib/url/safe-request.ts` | Pinned-DNS HTTP requests, redirect tracing, timeouts and limits |
| `src/lib/url/ip.ts` | Public/reserved IP classification via `ipaddr.js` |
| `src/lib/url/heuristics.ts` | Lookalike-brand, TLD, shortener, redirect, and new-domain warnings |
| `src/lib/url/threats.ts` | Google Safe Browsing and URLhaus adapters |
| `src/lib/url/rdap.ts` | RDAP registration lookup with SSRF-safe redirects |
| `src/lib/url/analyze.ts` | URL analysis orchestration and verdict composition |
| `src/app/api/analyze-url/route.ts` | Phase 2 API route with body limits and rate limiting |
| `src/lib/qr/decode.ts` | QR file/type/size/dimension validation and local decoding |
| `src/lib/qr/upi.ts` | Inert UPI payment URI parser |
| `src/lib/qr/classify.ts` | QR content classification (URL, UPI, plain text) |
| `src/components/Phase2Scanner.tsx` | URL/QR scanner UI, sample buttons, client-side flow |
| `src/components/phase2/UrlResultCard.tsx` | URL result rendering using Phase 1 design language |
| `src/components/phase2/UpiResultCard.tsx` | UPI details with trust and no-payment warnings |
| `src/lib/help/resources.ts` | Verified official Indian channels and scope limits |
| `src/lib/help/scenarios.ts` | Five emergency scenarios and deterministic plan routing |
| `src/lib/help/playbooks.ts` | Six safety playbooks with actions, evidence, reporting, and mistakes |
| `src/lib/help/phone.ts` | Local phone-format validation and script warning-word analysis |
| `src/lib/help/evidence.ts` | Evidence validation, redaction, report content, and filename generation |
| `src/lib/help/pdf.ts` | A4 PDF layout and `pdf-lib` rendering |
| `src/app/api/evidence-pdf/route.ts` | Validated, rate-limited evidence PDF API |
| `src/components/help/HelpHub.tsx` | Accessible four-tab help hub |
| `src/components/help/EmergencyAssistant.tsx` | Emergency scenario questions and action plan |
| `src/components/help/PlaybookLibrary.tsx` | Six-playbook browser with detail view |
| `src/components/help/PhoneCallChecker.tsx` | Local number/script checker UI |
| `src/components/help/EvidencePdfBuilder.tsx` | Evidence form, client validation, PDF download |
| `src/components/help/HelpPrimitives.tsx` | Shared help UI primitives and official-resource links |
| `src/components/LanguageSwitcher.tsx` | English/Hindi switcher, persistent choice, accessible labels |
| `src/components/SiteHeader.tsx` | Responsive header, `xl` full-navigation breakpoint, mobile-menu focus handling |
| `src/lib/i18n/LanguageProvider.tsx` | Client language provider and persisted `satark_language` state |
| `src/lib/i18n/site.ts`, `landing.ts`, `scanner.ts`, `phase2.ts`, `help-ui.ts` | Additive English/Hindi UI copy |
| `src/lib/a11y/tab-navigation.ts` | Tested roving-tabindex keyboard helper |
| `src/lib/intro.ts` | Intro seen/reduced-motion decision helpers |
| `src/components/CinematicIntro.tsx` | Skippable, keyboard-safe first-visit intro with 112 access |
| `tests/phase4-accessibility.test.ts` | Tabs, responsive nav, labels, focus CSS, reduced motion, skip link, live status, non-colour severity, intro guards |
| `tests/phase4-i18n.test.ts` | Hindi coverage and scanner-state preservation |
| `tests/phase5-validation.test.ts` | Message cases, unformatted Aadhaar masking, masking-before-AI, inert QR/URL, UPI parsing, PDF redaction, no-auto-report and no-recovery claims |

---

## Testing

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The full suite runs on Node.js `v18.19.1` with `node --import tsx --test tests/*.test.ts`. It covers Phase 1 rules and masking, Phase 1.5 AI integration, Phase 2 URL/SSRF, redirects, QR/UPI, route validation and result rendering, Phase 3 help content, emergency routing, phone checks, evidence redaction and PDF generation, Phase 4 bilingual UI and accessibility helpers, and Phase 5 end-to-end validation. Tests use injected DNS/HTTP responses, mocked threat services, generated QR pixels, and harmless sample text; no real external API calls or personal data are used. PDF tests parse the generated document with `pdf-lib` and verify structured content and extracted text.

**Final verification (2026-10-27):**

| Check | Actual result |
|---|---|
| `npm test` | **240 passing, 0 failing, 40 suites**; 0 cancelled, 0 skipped |
| `npm run lint` | **passing** — ESLint `8.57.1` with `eslint-config-next` `14.2.35`; `.eslintrc.json` uses `next/core-web-vitals` |
| `npm run typecheck` | **passing** (`tsc --noEmit`) |
| `npm run build` | **passing**; `/`, `/_not-found`, `/api/analyze-url`, `/api/evidence-pdf`, `/api/scan-ai`; homepage First Load JS **229 kB** |
| Production API smoke | **12/12** checks passed: homepage, 404, URL invalid JSON/private address/`javascript:` scheme, AI missing consent/empty text/invalid JSON, PDF invalid JSON/missing description/valid PDF, and live `https://example.com/` analysis |
| Detection regressions | **18/18** tests for legitimate Aadhaar onboarding, bare/ambiguous KYC reminders, KYC phishing, UIDAI-lookalike hosts, OTP theft, fake refunds, job scams, bank impersonation, and CBI/legal coercion |
| URL SSRF and redirects | **41/41** URL analysis tests passing, including private/link-local targets, mixed DNS answers, connection-time lookup, redirect-to-private blocking, redirect loops, and redirect limits |
| Rate-limit trust | **8/8** helper/integration tests passing; default mode ignores spoofed forwarded headers, and trusted-proxy hop selection is covered |
| Firefox responsive run | **45/45** checks passed at true CSS viewports **390 px**, **768 px**, and **1366 px**: true viewport, no horizontal overflow, scanner controls fit, mobile menu open/Escape, sample tabs, URL/QR tabs, evidence tab, and usable form widths |
| Evidence PDF browser download | Firefox saved the PDF to disk: **2 pages**, PDF **1.7**, **5,705 bytes**. `pdfinfo`/`pdftotext` confirmed the title, `Browser Test User`, `BROWSER-PDF-20261027`, the amount `499`, the description, and the no-report disclaimer |
| Live Gemini | Key accepted; a live benign synthetic scan succeeded with **`gemini-flash-lite-latest`** (benign, no strong warning). The local `.env.local` still sets an unavailable `gemini-2.0-flash-lite` model, which returned provider **404** and correctly fell back to rules-only results |
| Live URL integrations | Live `https://example.com/` analysis succeeded: outbound HTTPS and RDAP worked (registrar and 1995 creation date retrieved). Safe Browsing was **not configured**; anonymous URLhaus was **unavailable**. Neither is reported as clean |
| Gemini/RDAP error handling | Timeout, network, quota, provider-error, and unavailable-service paths are covered by tests and route fallbacks |

The browser pass used Firefox's WebDriver BiDi viewport override, so the mobile checks are true 390 CSS pixels rather than a resized 500 px window. It is a temporary harness, not part of `npm test`; no screen-reader/axe audit or native-device test was performed. See [Limitations & Disclaimer](#limitations--disclaimer).

```bash
npm run generate:demo-qr
```

Regenerates the two sample QR images in `public/images/` using the `qrcode` development dependency.

---

## Privacy

When AI analysis is **disabled** (default):
- No data leaves your browser.
- Analysis is performed entirely by the local rules engine.

When AI analysis is **enabled**:
- The text is PII-masked in the browser before the AI request, and the server re-applies masking before calling Gemini (phone, email, Aadhaar, PAN, card numbers, and OTPs are replaced with placeholders).
- Only the **masked text** is sent to Google Gemini.
- The original unredacted text is never transmitted externally.
- No messages or API payloads are stored in application logs or a database.
- Masking is best-effort and may not catch every form of sensitive data.
- Google's standard API [privacy policy](https://policies.google.com/privacy) applies to the masked text.

### Phase 2 data flows

- **QR images stay local.** File validation and `jsQR` decoding run in browser memory. The uploaded image is not sent to the server.
- **Only extracted URLs leave the browser.** A URL found in a QR code, or a URL you type, is sent to the server-side analyzer. The analyzer may forward it to Google Safe Browsing and/or URLhaus when those services are configured, and it sends the registrable domain to public RDAP endpoints.
- **No page content is downloaded.** Redirect tracing requests headers only; it does not fetch or render page bodies, scripts, or downloads.
- **No scan history is stored.** The URL route uses an in-memory rate-limit counter and does not persist submitted URLs.
- **Keys stay server-side.** `GOOGLE_SAFE_BROWSING_API_KEY`, `URLHAUS_AUTH_KEY`, and `GEMINI_API_KEY` are never included in client code.

### Phase 3 data flows

- **Emergency guidance and playbooks stay local.** Scenario choices and playbook browsing are handled in the browser with static, reviewed content. No report is sent anywhere.
- **The phone checker stays local.** The number and description are processed in browser memory with `libphonenumber-js` and local text checks. They are not posted to Satark AI, a carrier, a caller-ID service, or a reputation database.
- **Evidence details are sent only when you request a PDF.** The form posts to `/api/evidence-pdf` over the same origin. The server validates and redacts the fields, builds the report in memory, and returns the PDF with `Cache-Control: no-store`.
- **No evidence history is stored.** The evidence route does not write the form, report, or PDF to a database, disk, or application log, and it does not send them to a third party. The in-memory rate limiter keeps a short-lived client IP counter with a one-minute window; stale entries are swept periodically.
- **Nothing is filed automatically.** The PDF is a user-created summary, not a complaint acknowledgement. Satark AI does not contact a bank, platform, police station, or authority on your behalf.
- **Redaction is best-effort.** The evidence route masks common secrets before rendering, but users should not enter OTPs, passwords, full card numbers, or Aadhaar numbers. Review the PDF before sharing it.

### Phase 4 data flows

- **Language choice stays local.** The selected language is stored in `localStorage` as `satark_language`. The intro marker is stored in `sessionStorage` as `satark_intro_seen`. Neither contains scan text or personal data.
- **No translation service is called.** English and Hindi strings ship with the application. Switching languages does not upload the current message, result, phone number, or form fields.
- **Scanner state is in memory.** A language change re-renders the current scanner state without a reload or new analysis request.
- **Reduced motion is a local preference.** The browser’s `prefers-reduced-motion` setting is read locally to skip the intro and suppress motion-safe effects.

---

## Limitations & Disclaimer

- **This tool does not guarantee safety.** A message with no suspicious indicators may still be a scam; a flagged message may be legitimate.
- Scammers constantly change tactics. The rules engine may not detect novel patterns.
- PII masking is heuristic and imperfect. Do not submit messages with highly sensitive data.
- AI analysis reflects the model's probabilistic interpretation, not a legal or authoritative verdict.
- The Gemini free-tier quota is limited. If quota is exhausted, the app falls back to rules-only mode.
- **URL results are point-in-time.** A no-known-threat result is not a guarantee. Threat services can be unavailable, rate-limited, or missing a new campaign.
- **Page contents are not executed.** The URL pipeline does not render JavaScript, inspect downloads, take screenshots, or detect malware on the destination page.
- **Redirect coverage is bounded.** Long chains, loops, DNS failures, and timeouts are reported as suspicious or inconclusive rather than silently treated as safe.
- **UPI details are self-declared.** The parser only describes the request encoded in the URI. It does not verify the payee, contact NPCI or a bank, or initiate a payment.
- **The phone checker is not a reputation service.** It validates formatting and highlights warning words in your own description. It does not identify the caller, verify ownership of a number, query a carrier or caller-ID database, or infer fraud from a number, country code, or line type. A format-valid result is **not** a safety verdict.
- **Evidence PDFs are user-created summaries, not complaints.** Satark AI does not submit anything, issue an acknowledgement, provide legal advice, or guarantee recovery. A PDF may contain errors or omissions, and official links/phone numbers can change; verify them before acting.
- **PDF redaction and fonts are limited.** Redaction is pattern-based and best-effort, so omit secrets rather than relying on it. Standard Helvetica fonts support Latin text only; non-Latin characters are replaced with `?`. The Phase 4 interface is bilingual, but the evidence PDF is still generated in English with Latin text only.
- **Hindi coverage is additive.** The header, navigation, main scanner, help UI, and bundled guidance have Hindi variants, but AI-generated output may remain English and the deterministic rules are currently tuned for English text. There is no automatic language detection.
- **Accessibility evidence is bounded.** Automated markup tests and real Firefox keyboard/focus checks passed, but no screen-reader walkthrough, `axe` audit, or native mobile-device test was performed. Treat the accessibility work as tested but not certified.
- **Rate limits are in-memory and deployment-aware.** URL and PDF limits are per running instance and are not distributed across replicas; restarting the server clears them. Forwarded headers are ignored by default, so direct clients share one safe bucket. Behind a trusted proxy, enable `TRUST_PROXY_HEADERS` and set `TRUST_PROXY_HOPS` correctly to get per-client buckets.
- **Optional reputation services are not always available.** Safe Browsing remains **Not configured** without a key, and anonymous URLhaus may be **Unavailable**; neither state is treated as a clean result. Live provider behaviour can change independently of this app.
- **Gemini model IDs change.** If the configured model returns `404`, the route keeps the deterministic result. Use a model available to your key, such as `gemini-flash-lite-latest`.
- **Demo mode is not live verification.** `PHASE2_DEMO_MODE=true` produces clearly labelled simulated URL results for the built-in samples only. It must be off in production, where a no-known-threat result still does not prove safety.
- **Safety guidance can become outdated.** Official resources were checked on 2026-10-26. Helplines, portals, and procedures can change, and general guidance may not fit every situation.
- **No automatic contact.** The help layer does not call, message, email, or file a report with any bank, platform, police station, or authority.
- Do not submit confidential URLs. URL analysis necessarily discloses the URL to the server and, when enabled, to reputation services.

---

## Roadmap

- **Phase 1 delivered**: deterministic rules engine plus opt-in Gemini analysis with local PII masking and anti-hallucination checks.
- **Phase 2 delivered**: SSRF-safe URL analysis, redirect tracing, RDAP and optional reputation checks, local QR decoding, and inert UPI parsing.
- **Phase 3 delivered**: emergency guidance, six safety playbooks, local phone-format/script checks, and downloadable evidence PDFs with redaction, official contacts, and clear limitations.
- **Phase 4 delivered**: English/Hindi interface with persisted language choice, state-preserving switching, keyboard-accessible tabs/menu, reduced-motion support, and responsive layouts.
- **Phase 5 delivered**: end-to-end validation, production API/PDF smoke tests, real Firefox checks, documentation, and a safe three-minute demo script. All work remains uncommitted and unpushed.
- **Next (future phases)**: screenshot OCR, community-reported scam patterns, deeper Hindi/regional-language coverage, and a real, disclosed phone-reputation source if one can be responsibly integrated. Format or country code must never be used as proof of identity or fraud.
- **Not planned**: automatic complaints/contact with authorities, recovery guarantees, or silent background checks.

---

## License

MIT
