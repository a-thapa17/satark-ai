# Satark AI 🛡️

**AI-powered scam detection and digital safety platform for India.**  
Stay Alert. Stay Protected.

---

## Overview

Satark AI helps users identify potential cyber scams in messages — SMS, WhatsApp forwards, emails, and more — using a hybrid analysis engine:

1. **Deterministic Rules Engine** (always runs, no external calls) — pattern-based detection for OTP theft, bank impersonation, UPI fraud, job/task scams, phishing, and more.
2. **Google Gemini AI Layer** (opt-in, sends only redacted text) — context-aware explanations, scam classification, evidence highlighting, and tailored recommendations.

The rules engine is always the trusted baseline. The AI layer cannot downgrade a confirmed `HIGH_RISK` deterministic finding.

---

## Features

- 🔍 **Hybrid scanner**: deterministic rules + optional Gemini AI analysis
- 🔒 **Privacy-first**: PII masking before any external request; original text never sent to Gemini
- ✅ **Opt-in AI**: user must explicitly enable AI analysis via an in-UI checkbox
- 📋 **Structured AI output**: category, risk assessment, evidence phrases, manipulation tactics, recommended actions, uncertainties
- 🚫 **Anti-hallucination check**: AI evidence phrases are validated against the actual submitted text
- 🔄 **Graceful fallback**: if API key is absent, quota is exhausted, or Gemini times out, the app continues with rules-only results
- 🇮🇳 **India-focused**: covers UPI fraud, KYC impersonation, Aadhaar/PAN leaks, digital arrest extortion, task scams

---

## Getting Started

### Prerequisites

- Node.js 18 or later
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
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash-lite
```

**Getting a free Gemini API key:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key and paste it into `.env.local`

> **Note:** The free tier is sufficient for development and personal use. No billing setup required.

If `GEMINI_API_KEY` is not set, the app runs entirely in rules-only mode — no external network calls are made.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage

1. Paste or type a suspicious message into the Message Scanner.
2. *(Optional)* Enable the **"Enhanced AI analysis"** checkbox to send the redacted message to Google Gemini for contextual interpretation.
3. Click **Analyze**.
4. Review the results:
   - **Risk level** and **rule-based findings** (always shown)
   - **AI insights panel** — category, summary, evidence, tactics, recommendations, uncertainties (shown when AI analysis is enabled and succeeds)

### Sample Prompts

| Scenario | Expected Behavior |
|---|---|
| `"Your SBI account will be blocked. Share OTP immediately."` | HIGH_RISK, bank impersonation, OTP theft evidence |
| `"Earn ₹5,000/day liking videos. Pay ₹499 to unlock tasks."` | HIGH_RISK, job/task scam, upfront payment evidence |
| `"Hi Rahul, I'll bring your DBMS notes tomorrow."` | No strong warning signs, benign communication |

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

### Key Files

| File | Purpose |
|---|---|
| `src/lib/scanner/engine.ts` | Deterministic rules engine + `combineWithAi()` |
| `src/lib/scanner/rules.ts` | Rule definitions (patterns, weights, categories) |
| `src/lib/scanner/masking.ts` | PII masking (Aadhaar, PAN, card, OTP, phone, email) |
| `src/lib/scanner/types.ts` | TypeScript types for `ScanReport`, `AiAnalysisReport` |
| `src/app/api/scan-ai/route.ts` | Server-side Gemini integration with rate limiting |
| `src/components/MessageScanner.tsx` | UI: input, opt-in toggle, dual-stage results panel |

---

## Testing

```bash
npm test
```

Runs both the Phase 1 scanner tests and Phase 1.5 AI integration tests (26 tests total, all mocked — no real API calls in tests).

```bash
npm run build
```

Verifies a production-ready build.

---

## Privacy

When AI analysis is **disabled** (default):
- No data leaves your browser.
- Analysis is performed entirely by the local rules engine.

When AI analysis is **enabled**:
- The submitted text is PII-masked server-side (phone, email, Aadhaar, PAN, card numbers, OTPs are replaced with placeholders).
- Only the **masked text** is sent to Google Gemini.
- The original unredacted text is never transmitted externally.
- No messages or API payloads are stored in application logs or a database.
- Masking is best-effort and may not catch every form of sensitive data.
- Google's standard API [privacy policy](https://policies.google.com/privacy) applies to the masked text.

---

## Limitations & Disclaimer

- **This tool does not guarantee safety.** A message with no suspicious indicators may still be a scam; a flagged message may be legitimate.
- Scammers constantly change tactics. The rules engine may not detect novel patterns.
- PII masking is heuristic and imperfect. Do not submit messages with highly sensitive data.
- AI analysis reflects the model's probabilistic interpretation, not a legal or authoritative verdict.
- The Gemini free-tier quota is limited. If quota is exhausted, the app falls back to rules-only mode.
- URL and link safety are **not** verified. Do not click links in suspicious messages.

---

## Roadmap

- **Phase 2**: URL reputation scanning, QR code analysis, phone number reputation
- **Phase 3**: Community-reported scam patterns, regional language support

---

## License

MIT
