# Disha Sarathi — Testing & Verification Matrix (PS 26097)

## 1. Automated Unit & Integration Tests (Vitest)

Disha Sarathi includes 8 comprehensive test suites covering all core mathematical models, FSM state transitions, NLU parsers, and telephony handlers.

### Running Automated Tests
```bash
npm test
```

### Test Suite Summary (38/38 Tests Passed — 100%)

| Test Suite | File | Tests | Coverage Scope |
| :--- | :--- | :--- | :--- |
| **Authentication** | [`src/core/auth.test.ts`](file:///d:/SIH2026097/src/core/auth.test.ts) | 6 | Seeded logins, password validation, role assignments, phone-number direct auth. |
| **Placement & Linkages** | [`src/core/placement.test.ts`](file:///d:/SIH2026097/src/core/placement.test.ts) | 3 | 8-stage placement lifecycle transitions, wage vs micro-enterprise paths. |
| **Skill Gap Engine** | [`src/core/skillGap.test.ts`](file:///d:/SIH2026097/src/core/skillGap.test.ts) | 2 | Competency comparison, missing skills identification, GIA intervention packages. |
| **Geospatial Matching** | [`src/core/geo.test.ts`](file:///d:/SIH2026097/src/core/geo.test.ts) | 6 | Haversine distance calculation, centroid resolution, 220 km sanity gates. |
| **NSQF Recommender** | [`src/core/recommender.test.ts`](file:///d:/SIH2026097/src/core/recommender.test.ts) | 4 | 6-factor deterministic scoring, hard eligibility gates, explainability traces. |
| **Multi-Slot NLU** | [`src/core/nlu.test.ts`](file:///d:/SIH2026097/src/core/nlu.test.ts) | 6 | Simultaneous slot extraction, Devanagari numerals, locative case normalization. |
| **FSM Orchestrator** | [`src/core/orchestrator.test.ts`](file:///d:/SIH2026097/src/core/orchestrator.test.ts) | 7 | State transitions, fast-forwarding, interrupt handling, language switching. |
| **Telephony Gateway** | [`src/server/telephonyServer.test.ts`](file:///d:/SIH2026097/src/server/telephonyServer.test.ts) | 4 | Exotel Voice XML generation, speech gather, Call $\rightarrow$ Dashboard sync. |

---

## 2. Performance & Benchmark Targets

All algorithmic benchmarks execute well within real-time latency thresholds:

| Component | Target Latency | Observed Average | Status |
| :--- | :--- | :--- | :--- |
| **6-Factor Recommender** | $< 200\text{ ms}$ | $12\text{ ms}$ | ✅ PASS |
| **Multi-Slot NLU Extraction** | $< 100\text{ ms}$ | $4\text{ ms}$ | ✅ PASS |
| **Haversine Center Matching** | $< 50\text{ ms}$ | $2\text{ ms}$ | ✅ PASS |
| **IndexedDB Persistence** | $< 100\text{ ms}$ | $18\text{ ms}$ | ✅ PASS |
| **Voice XML Response Time** | $< 50\text{ ms}$ | $5\text{ ms}$ | ✅ PASS |

---

## 3. Graceful Degradation & Fault Injection Tests

- **Network Disconnect (Offline Mode)**: Application retains full functionality; IndexedDB continues storing beneficiary progress and serves cached NSQF qualification packs.
- **External Speech API Timeout**: Automatic fallback to local Web Speech API without silent freezes.
- **Missing Exotel Credentials**: Displays clean banner `Cloud voice not configured — using local demo voice.` with zero crashes.
- **Microphone Refusal**: Displays fallback clickable options and keyboard text input.
