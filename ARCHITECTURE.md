# Disha Sarathi — Technical Architecture (PS 26097)

## 1. High-Level System Architecture

Disha Sarathi is designed around a **Two-Layer Hybrid Architecture** that combines absolute offline reliability in rural/low-connectivity environments (Layer A) with high-fidelity cloud telecom and neural speech enhancements (Layer B).

```
+-----------------------------------------------------------------------------+
|                             INCOMING CHANNELS                               |
|  1. PSTN Phone Call (Exotel ExoPhone)   2. Android Web/PWA (Conversational) |
|  3. WhatsApp Voice Note Simulator       4. IVR DTMF Fallback                |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                    LAYER A: CORE OFFLINE-FIRST ENGINE                       |
|                                                                             |
|  +------------------------+  +-------------------------------------------+  |
|  | Multi-Slot Indic NLU   |  | Pure FSM Orchestrator (12 Distinct States)|  |
|  | - Marathi/Hindi/English|  | - Smart Fast-Forwarding                   |  |
|  | - Oblique & Numeral    |  | - Session Persistence (IndexedDB)         |  |
|  +------------------------+  +-------------------------------------------+  |
|                                       |                                     |
|  +------------------------------------+----------------------------------+  |
|  |                                                                       |  |
|  v                                    v                                  v  |
| +-------------------------+ +-------------------------+ +-----------------+ |
| | 6-Factor Deterministic  | | Dedicated Skill Gap     | | 8-Stage         | |
| | Recommender             | | Engine (src/core/       | | Placement &     | |
| | - Explainability Trace  | | skillGap.ts)            | | Enterprise Track| |
| +-------------------------+ +-------------------------+ +-----------------+ |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | Local Knowledge Base: 40 NSQF Trades, District Demands, Centers       |  |
|  +-----------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                  LAYER B: CLOUD & TELEPHONY BRIDGES                         |
|  - Exotel Telephony Gateway (Webhooks, Voice XML, WebSocket Media Stream)   |
|  - Speech Synthesis (TTSProvider: WebSpeech, Bhashini, Sarvam, Telephony)   |
|  - Call -> Dashboard Real-Time Synchronization Engine                       |
+-----------------------------------------------------------------------------+
```

---

## 2. Shared Finite State Machine (FSM)

All channels (Phone Call, Web Voice, WhatsApp Simulator, IVR) interact with the exact same FSM orchestrator in [`src/core/orchestrator.ts`](file:///d:/SIH2026097/src/core/orchestrator.ts):

| State | Purpose | Spoken Prompt / Interaction |
| :--- | :--- | :--- |
| `LANG_SELECT` | Language Selection | "नमस्कार. दिशा सारथीमध्ये आपले स्वागत आहे..." |
| `CONSENT` | Privacy & Consent | Simple explanation of why data is collected + consent capture. |
| `LOCATION` | Location Capture | Identifies district/village (GPS, spoken district, or centroid). |
| `EDUCATION` | Education Level | Class 5, 8, 10, 12, ITI, Diploma, Graduate. |
| `FAMILY_OCCUPATION` | Traditional/Family Livelihood | Farming, Pottery, Carpentry, Masonry, Weaving. |
| `CURRENT_LIVELIHOOD` | Existing Work & Wage | Current occupation and daily wage status. |
| `SKILLS_INTEREST` | Skills & Trade Interests | Technical, mechanical, digital, craft skills. |
| `CONSTRAINTS` | Mobility & Travel Radius | Travel radius in km, shift preferences, physical constraints. |
| `EMPLOYMENT_PREFERENCE` | Career Aspiration | Wage Employment vs Self-Employment / Micro-enterprise. |
| `RECOMMENDATION` | NSQF Trade Recommendations | Spoken Top 3 ranked trades with explainability rationale. |
| `CENTER_AND_NEXT_STEPS` | Hyperlocal Training Center | Nearest center details, distance, and batch schedules. |
| `PLACEMENT_LINKAGE` | Post-Skilling Pathway | Employer linkage or Credit scheme referral. |
| `ASPIRATION_CARD` | Digital Identity Generation | Offline verifiable QR code and Canvas PNG download. |

---

## 3. Deterministic 6-Factor NSQF Recommendation Engine

The core recommendation logic is implemented in [`src/core/recommender.ts`](file:///d:/SIH2026097/src/core/recommender.ts). It executes locally in `<15ms` with zero dependency on external LLMs:

$$\text{Score}(t) = 0.32 \cdot I(t) + 0.20 \cdot T(t) + 0.16 \cdot E(t) + 0.16 \cdot D(t) + 0.10 \cdot P(t) + 0.06 \cdot A(t)$$

### Hard Gates & Eligibility Filters
1. **Education Gate**: If beneficiary education level is below the mandatory NSQF entry requirement for trade $t$, $E(t) = 0$ or trade is eliminated with explicit rationale.
2. **Physical Constraint Gate**: If the beneficiary specifies physical limitations conflicting with trade physical demands, the trade is filtered out with transparency.
3. **Accessibility Distance Gate**: If the nearest training center is outside the beneficiary's travel radius, an accessibility penalty ($0.6\times$) is applied.

---

## 4. Multi-Slot Indic Conversational NLU

Implemented in [`src/core/nlu.ts`](file:///d:/SIH2026097/src/core/nlu.ts), `extractAllProfileSlots` parses natural spoken Indic sentences:
- **Locative Case Suffixes**: Automatically stems Marathi/Hindi locative cases (e.g. `पुण्यात` $\rightarrow$ Pune, `सोलापुरात` $\rightarrow$ Solapur, `नांदेडमध्ये` $\rightarrow$ Nanded).
- **Numeral Devanagari Mappings**: Normalizes `१०वी`, `10 वी`, `दहावी`, `10th` to Class 10.
- **Multi-Slot Extraction**: Simultaneously extracts district, education, livelihood, interests, and career preference from a single utterance and fast-forwards the FSM.

---

## 5. Exotel PSTN Telephony Gateway & Call $\rightarrow$ Dashboard Synchronization

1. **Incoming Call**: The PSTN caller dials the Exotel virtual number (`+91 80 4718 2609`). Exotel posts to `/api/exotel/incoming`.
2. **Session Initialization**: `handleExotelIncomingCall` in [`src/server/telephonyServer.ts`](file:///d:/SIH2026097/src/server/telephonyServer.ts) creates a persistent `CallSession` mapped to the caller's phone number.
3. **Continuous Audio Gathering**: Exotel transcribes caller speech and submits to `/api/exotel/gather`.
4. **Real-Time Synchronization**: The profile, skill gaps, and recommendations generated during the phone call are immediately committed to the central store and visible on `/dashboard` and `/beneficiary`.
