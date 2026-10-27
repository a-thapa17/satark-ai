# Satark AI — Test Data & Sample Test Cases
**Validation Suite:** 269 Automated Unit & Regression Tests across 50 Suites  

---

## 1. Threat Detection Test Matrix

The following verified sample messages represent key Indian cyber scam modalities alongside expected heuristic outcomes:

| ID | Sample Input Text | Matched Category | Base Score | Modifiers / Penalties | Final Score | Expected Risk Tier |
|---|---|---|---|---|---|---|
| **TC-01** | *"Dear consumer, your electricity power connection will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately contact our electricity officer on 9811234567."* | `UTILITY_DISCONNECT` | 95 | Extreme Urgency (+10) | **100** | **CRITICAL** |
| **TC-02** | *"Notice from CBI Cyber Crime Branch: An arrest warrant has been issued in your name regarding narcotics seized in an illegal courier parcel. Join Skype video call immediately."* | `DIGITAL_ARREST_AUTHORITY` | 100 | Extreme Urgency (+10) | **100** | **CRITICAL** |
| **TC-03** | *"Dear SBI customer, your netbanking account will be blocked today due to pending PAN KYC. Update immediately at http://bit.ly/sbi-kyc-verify to avoid suspension."* | `KYC_SUSPENSION` | 90 | Urgency (+10), Shortener (+20) | **100** | **CRITICAL** |
| **TC-04** | *"Work from home part-time job: Earn Rs 3000 to 5000 daily income by simply liking YouTube videos and rating hotels on Google Maps. Contact HR on Telegram @EarnFastNow."* | `WFH_TASK_SCAM` | 95 | None | **95** | **CRITICAL** |
| **TC-05** | *"India Post Alert: Your package is held at customs clearance due to address missing. Pay Rs 49 re-delivery fee within 24 hours at https://indiapost-update.xyz"* | `CUSTOMS_PARCEL` | 90 | Urgency (+10), Risky TLD (+20) | **100** | **CRITICAL** |
| **TC-06** | *"Congratulations! You have been selected as KBC lucky draw winner of 25 Lakhs and free gift iPhone. Claim your prize now after deposit of tax fee."* | `LOTTERY_GIFT` | 95 | None | **95** | **CRITICAL** |
| **TC-07** | *"Traffic Police e-challan alert: Pending violation fine of Rs 1000 on your vehicle. Pay immediately to avoid court penalty at http://echallan-vahan.xyz"* | `FAKE_CHALLAN` | 85 | Urgency (+10), Penalty (+15), TLD (+20) | **100** | **CRITICAL** |
| **TC-08** | *"To complete mandatory banking security update, please download and install our official SBI_Security.apk file directly."* | `MALICIOUS_PAYLOAD` | 100 | None | **100** | **CRITICAL** |
| **TC-09** | *"Dear customer, your HDFC credit card reward points worth Rs 8,500 will expire today. Click the link below to claim cashback: https://forms.gle/reward850"* | `BANKING_REWARDS` | 85 | Free Hosting (+15), Coercion (+10) | **100** | **CRITICAL** |

---

## 2. False Positive Prevention & Benign Boundaries

Satark AI specifically differentiates legitimate notifications and transactional advisories from deceptive coercion:

| ID | Sample Input Text | Expected Behavior | Rationale |
|---|---|---|---|
| **BEN-01** | *"Hey Rohan, are we still meeting for lunch at 1 PM today near the office cafeteria? Let me know!"* | Score: **0**, **LOW** Risk | Routine peer-to-peer personal communication; no coercion, lures, or credential demands. |
| **BEN-02** | *"492019 is your OTP for login to your HDFC Netbanking account. Valid for 10 mins. Bank never asks for your OTP. Do not share your OTP with anyone."* | Score: **0**, **LOW** Risk | Matches `DEF_DO_NOT_SHARE` defensive indicator. Legitimate bank notification with protective security advisory. |
| **BEN-03** | *"Rs 1,250.00 debited from A/c XX4819 on 22-OCT-26 at ATM-SBI. Avail Bal Rs 18,400.00. SMS BLOCK to 567676 if not done by you."* | Score: **0**, **LOW** Risk | Matches `DEF_STANDARD_BANK_UPDATE`. Standard transactional SMS without demands to click unverified links. |
| **BEN-04** | *"Traffic advisory: You can view or pay legitimate traffic violation fines on the official portal at https://echallan.parivahan.gov.in."* | Score: **0**, **LOW** Risk | Explicitly whitelist-excluded from `FAKE_CHALLAN` rule due to authentic `parivahan.gov.in` domain. |
| **BEN-05** | *"Your UIDAI Aadhaar update request has been successfully processed. Download e-Aadhaar from https://uidai.gov.in or call 1947."* | Score: **0**, **LOW** Risk | Legitimate onboarding/service message featuring verified government domain and official 1947 helpline. |

---

## 3. SSRF Network Security Test Vectors

Validated against the `/api/scan-url` and `/api/analyze-url` endpoints:

| Attack Vector | Target Payload | Expected Response | Enforced Defense |
|---|---|---|---|
| **IPv4 Loopback** | `http://127.0.0.1/admin` | HTTP 400 (`INVALID_URL`) | Rejected by `isPublicIp()` check. |
| **Class A Private Network** | `http://10.0.0.1/internal-status` | HTTP 400 (`INVALID_URL`) | Blocked by RFC 1918 private range filter. |
| **Class C Private Network** | `http://192.168.1.1/router-login` | HTTP 400 (`INVALID_URL`) | Blocked by RFC 1918 private range filter. |
| **Cloud Metadata Service** | `http://169.254.169.254/latest/meta-data/` | HTTP 400 (`INVALID_URL`) | Blocked as link-local / cloud credential service. |
| **Internal Hostname** | `http://localhost:3000` | HTTP 400 (`INVALID_URL`) | Blocked by `isBlockedHostname()` check. |
| **GCP Metadata Internal** | `http://metadata.google.internal/` | HTTP 400 (`INVALID_URL`) | Blocked by internal cloud hostname filter. |
| **IPv6 Loopback** | `http://[::1]:8080` | HTTP 400 (`INVALID_URL`) | Rejected IPv6 loopback address. |
| **IPv4-Mapped IPv6** | `http://[::ffff:127.0.0.1]/` | HTTP 400 (`INVALID_URL`) | Normalized and rejected loopback address. |

---

## 4. PII Redaction Verification Samples

Ensures zero personally identifiable information leaks into logs or external AI prompts:

```text
// Input:
"Contact support@fake-sbi.com or call +91 98765 43210. Your OTP 849201 for card 4111 2222 3333 4444, Aadhaar 2345 6789 0123, PAN ABCDE1234F."

// Processed Output:
"Contact [MASKED_EMAIL] or call [MASKED_PHONE]. Your OTP [MASKED_OTP] for card [MASKED_CARD_NUMBER], Aadhaar [MASKED_AADHAAR], PAN [MASKED_PAN]."
```

---

## 5. Running the Automated Test Suite

To run all 269 automated tests covering these scenarios:

```bash
npm test
```
