# Disha Sarathi (दिशा सारथी) — PS 26097
**AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under GIA Component of PM-AJAY**

---

## 📌 1. Project Overview & Mission

**Disha Sarathi** is a multilingual, voice-first livelihood counsellor and skilling recommendation platform developed for **Problem Statement 26097** under the **Grant-in-Aid (GIA) component of PM-AJAY** (Pradhan Mantri Anusuchit Jaati Abhyuday Yojana), Ministry of Social Justice and Empowerment, Government of India.

The platform addresses the socio-economic empowerment of Scheduled Caste (SC) youth, rural artisans, and wage workers through an accessible, hands-free conversational voice experience across two connected channels:
1. **PSTN Telephony Channel (Feature Phone / Mobile Call)** via Exotel Virtual Cloud Number (`ExoPhone`).
2. **Android-First Web / PWA Channel** with a responsive conversational voice interface.

Both channels share the **exact same backend business logic**, ensuring that telephone counseling sessions automatically synchronize with the web dashboards for beneficiaries and GIA coordinators.

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 Disha Sarathi Backend                  │
                  │  (Deterministic Recommender, Skill-Gap, Placement, NLU) │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    │                                                   │
        ┌───────────▼───────────┐                           ┌───────────▼───────────┐
        │   Channel 1: Phone    │                           │   Channel 2: Android  │
        │  (Exotel PSTN Gateway)│                           │       Web / PWA       │
        └───────────┬───────────┘                           └───────────┬───────────┘
                    │                                                   │
        • Real Virtual Number (+91 80 4718 2609)            • Conversational Voice Orb
        • Webhook & WebSocket Streaming Audio               • Hands-Free Continuous Loop
        • Server-Side Telephony TTS                         • Bulletproof Browser TTS + Bhashini
        • Real-Time Call → Dashboard Sync                   • Multi-Slot Spoken Indic NLU
```

---

## 🌟 2. Key Capabilities & Innovations

- 🗣️ **Conversational Voice Assistant (ChatGPT-Voice Style)**: Beneficiaries speak naturally in Marathi, Hindi, English, and regional languages. The assistant listens, extracts multi-slot profile data simultaneously, asks intelligent follow-ups, and speaks recommendations back without requiring button presses per turn.
- 🎯 **Deterministic 6-Factor NSQF Recommender**: Computes transparent, explainable suitability scores based on `Interest (0.32)`, `Skill Transfer (0.20)`, `Education (0.16)`, `Local Demand (0.16)`, `Employment Preference (0.10)`, and `Accessibility (0.06)`.
- ⚠️ **Dedicated Skill-Gap Analysis Engine**: Compares existing competencies against target trade standards and recommends tailored PM-AJAY GIA interventions (RPL, Standard Skilling, Foundation Skilling).
- 🏫 **Hyperlocal Training & Opportunity Linkage**: Calculates Haversine distances to the nearest PMKK/NSTI centers and matches beneficiaries to local wage jobs and micro-enterprise credit schemes (PM-SVANidhi, NSFDC, Stand-Up India).
- 💼 **8-Stage Placement & Enterprise Tracker**: Monitors the full lifecycle from Enrollment $\rightarrow$ Training $\rightarrow$ Completion $\rightarrow$ Referral $\rightarrow$ Interview $\rightarrow$ Placement / Self-Employment $\rightarrow$ Follow-up.
- 📊 **GIA Coordinator Command Center**: Interactive district planning map, District $\times$ Trade demand-capacity gap matrix, CSV export, and individual beneficiary explainability traces.
- 📴 **Offline-First Resilience (PWA)**: Full client-side execution capability in low-connectivity areas with local IndexedDB storage and offline verifiable Aspiration QR cards.

---

## 🚀 3. Quick Start & Execution

### Prerequisites
- Node.js (v18.0.0 or later)
- npm (v9.0.0 or later)

### Installation & Run
```bash
# 1. Clone repository and navigate to root
cd d:/SIH2026097

# 2. Install dependencies
npm install

# 3. Run automated unit test suite (38/38 Tests)
npm test

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

Open your browser at: **`http://localhost:5173`**

---

## 🔑 4. Demo Login Accounts

All demo accounts use the standard demo password: **`password123`**

| Role | Username | Password | Destination Dashboard |
| :--- | :--- | :--- | :--- |
| **Beneficiary** | `demo.beneficiary` | `password123` | `/beneficiary` (Personal Profile, Skill Gaps, Top 3 NSQF Trades, Placement Tracker, QR Card) |
| **GIA Coordinator** | `demo.coordinator` | `password123` | `/dashboard` (District Planning Map, Matrix, Capacity Gaps, CSV Export) |
| **Telephony Admin** | `demo.admin` | `password123` | `/admin` (Exotel Gateway Configuration, PSTN Call Simulator, Live Logs) |
| **Direct Mobile Login** | Any 10-digit number (e.g. `9876543210`) | *(OTP/Auto)* | Direct access to beneficiary's profile & synced phone calls |

---

## 🗺️ 5. Coherent Navigation & Routes

- `/` — **Landing Page**: Public portal overview, voice AI intro, telephony helpline info, and quick role access.
- `/talk` — **Natural Voice Assistant**: Hands-free conversational voice intake with glowing Voice Orb and dynamic audio visualizer.
- `/login` — **Authentication Portal**: 1-click seeded logins and phone login.
- `/beneficiary` — **Beneficiary Dashboard**: Profile, Skill Gaps, Top 3 Recommendations, Training Center details, Placement Tracker, and Aspiration Card.
- `/dashboard` — **GIA Coordinator Command Center**: Interactive district planning map, District $\times$ Trade matrix with CSV download, and capacity gap tracker.
- `/admin` — **Admin & Telephony Gateway**: Exotel virtual number provisioning guide, live call logs, and interactive PSTN simulator.
- `/diagnostics` — **System Diagnostics**: Health checks and 6-step automated end-to-end acceptance runner.
- `/channel/whatsapp` — **WhatsApp Voice-Note Simulator**: Multi-channel testing for WhatsApp voice audio.
- `/channel/ivr` — **IVR Telephony Simulator**: Keypad / DTMF fallback channel testing.

---

## 🛡️ 6. Documentation Index

- [ARCHITECTURE.md](file:///d:/SIH2026097/ARCHITECTURE.md) — Comprehensive technical architecture, state machines, and data flows.
- [EXOTEL_SETUP.md](file:///d:/SIH2026097/EXOTEL_SETUP.md) — Step-by-step guide for provisioning real Indian virtual phone numbers on Exotel.
- [VOICE_SETUP.md](file:///d:/SIH2026097/VOICE_SETUP.md) — Speech-to-text (STT) and text-to-speech (TTS) engine configuration and fallback protocols.
- [DATA_SOURCES.md](file:///d:/SIH2026097/DATA_SOURCES.md) — Data provenance for NSQF Qualification Packs, district centroids, and synthetic demo datasets.
- [DEMO_GUIDE.md](file:///d:/SIH2026097/DEMO_GUIDE.md) — Step-by-step walkthrough for hackathon evaluators.
- [TESTING.md](file:///d:/SIH2026097/TESTING.md) — Automated testing matrix, performance benchmarks, and fault-injection validation.
