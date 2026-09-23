# Exotel Voicebot WebSocket Integration Setup & Verification Guide
**Disha Sarathi (PS 26097) — PM-AJAY GIA Component**

---

## 1. Exotel Voicebot Architecture Overview

Disha Sarathi connects to an **Exotel Virtual Number (`ExoPhone`)** through Exotel's bidirectional **Voicebot WebSocket Applet**. This allows beneficiaries on feature phones or smartphones to have real-time, natural spoken conversations over the telecom network.

```
Beneficiary Mobile Phone (PSTN)
        ↓
Exotel Telecom Infrastructure
        ↓ (Bidirectional WebSocket)
Public WSS Endpoint (wss://<generated-ngrok-domain>/api/voice/exotel)
        ↓
Disha Sarathi Voicebot Gateway (Node.js & ws on Port 8080)
        ↓
Speech-to-Text (STT Provider: Bhashini / Google / MockSTT)
        ↓
Conversation Engine / Pure FSM (orchestrator.ts + nlu.ts)
        ↓
Beneficiary Profile Extraction (Multi-Slot Indic NLU)
        ↓
6-Factor NSQF Recommendation Engine (recommender.ts)
        ↓
Text-to-Speech (TTS Provider: Sarvam / Bhashini / MockTTS)
        ↓ (16-bit Linear PCM Audio Chunks via WebSocket)
Disha Sarathi Voicebot Gateway
        ↓
Exotel
        ↓
Beneficiary Hears Spoken Response
```

---

## 2. Verification Status & Capability Levels

| Milestone / Capability | Status | Notes |
|:---|:---:|:---|
| **Local Voicebot Gateway** | `[PASS] LOCAL TEST PASSED` | HTTP Server & WebSocket Server listening on `0.0.0.0:8080`. |
| **Health Endpoint Contract** | `[PASS] LOCAL TEST PASSED` | `GET /api/voice/exotel/health` returns valid JSON contract. |
| **Local WebSocket Handshake** | `[PASS] LOCAL TEST PASSED` | `ws://localhost:8080/api/voice/exotel` handshake & frame streaming verified. |
| **Free ngrok Public Tunnel** | `[PASS] PUBLIC WSS PASSED` | Free ngrok tunnel running via `ngrok http 8080` (no custom subdomains). |
| **Public Secure WSS Endpoint** | `[PASS] PUBLIC WSS PASSED` | `wss://<generated-ngrok-domain>/api/voice/exotel` TLS handshake & bidirectional audio verified. |
| **Mock STT & Mock TTS** | `[PASS] MOCK STT/TTS PASSED` | Synthetic 16-bit PCM & conversational transcript parsing for automated testing. |
| **Exotel Console Configuration** | `[PENDING] EXOTEL CONFIGURED` | Waiting for ExoPhone binding to current public WSS endpoint in Exotel Console. |
| **Real Phone Call Connection** | `[PENDING] EXOTEL CALL CONNECTED` | Requires placing call from mobile phone to configured ExoPhone number. |
| **Real Inbound Audio Stream** | `[PENDING] REAL INBOUND AUDIO` | Verified once live caller speech PCM frames arrive from Exotel. |
| **Real Production STT** | `[PENDING] REAL STT PASSED` | Verified once Bhashini / Google STT transcribes live caller audio with credentials. |
| **Real Production TTS** | `[PENDING] REAL TTS PASSED` | Verified once Sarvam / Bhashini TTS synthesizes neural speech with credentials. |
| **Real Two-Way Spoken Call** | `[PENDING] REAL TWO-WAY VOICE PASSED` | Final end-to-end milestone with caller hearing synthetic response on phone. |

---

## 3. Required Environment Variables (`.env`)

Add the following to your root `.env` file:

```env
# ====================================================================
# EXOTEL VOICEBOT & TELEPHONY GATEWAY CONFIGURATION
# ====================================================================
EXOTEL_ACCOUNT_SID=your_exotel_account_sid
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_TOKEN=your_exotel_api_token
EXOTEL_PHONE_NUMBER=09513886363

# Gateway Port & WebSocket Path
VOICEBOT_PORT=8080
EXOTEL_VOICEBOT_WS_PATH=/api/voice/exotel

# STT Provider Selection ('mock' | 'bhashini' | 'google')
STT_PROVIDER=mock

# TTS Provider Selection ('mock' | 'sarvam' | 'bhashini')
TTS_PROVIDER=mock

# Optional Production Indic AI API Credentials
BHASHINI_API_KEY=
BHASHINI_USER_ID=
SARVAM_API_KEY=
GOOGLE_STT_API_KEY=
```

> [!CAUTION]
> **SECURITY DIRECTIVE**: Never expose API keys, tokens, or personal phone numbers in logs or push `.env` to version control.

---

## 4. Starting the Voicebot Server

### Command:
```bash
npm run voicebot
```

### Dev / Watch Mode:
```bash
npm run voicebot:dev
```

Expected startup log:
```
[EXOTEL_VOICEBOT] Server listening on http://0.0.0.0:8080
[EXOTEL_VOICEBOT] WebSocket Voicebot endpoint: ws://0.0.0.0:8080/api/voice/exotel
[EXOTEL_VOICEBOT] Health check endpoint: http://0.0.0.0:8080/api/voice/exotel/health
```

---

## 5. Starting the Public ngrok Tunnel (Free Plan)

> [!IMPORTANT]
> **CRITICAL RULE FOR FREE NGROK ACCOUNTS**:
> Do NOT use `--domain`, `--subdomain`, `--hostname`, or custom URLs. The free plan will reject custom domains with:
> *"Only paid plans may create endpoints with custom subdomains."*

### Command:
```bash
ngrok http 8080
```

### Finding the Forwarding URL:
Check the ngrok terminal output or query ngrok's local API:
```bash
curl http://127.0.0.1:4040/api/tunnels
```

Example Forwarding URL:
`https://kick-subpanel-asleep.ngrok-free.dev`

Corresponding Public WSS Endpoint:
`wss://kick-subpanel-asleep.ngrok-free.dev/api/voice/exotel`

*(Note: Free ngrok domains change when the tunnel restarts. Update the Exotel Applet URL whenever the tunnel restarts.)*

---

## 6. Health Endpoint Specification

### Request:
```http
GET http://localhost:8080/api/voice/exotel/health
```
*(or via public HTTPS: `GET https://<ngrok-domain>/api/voice/exotel/health`)*

### Response Structure:
```json
{
  "service": "Disha Sarathi Exotel Voicebot Gateway",
  "version": "2.0.0",
  "status": "ok",
  "port": 8080,
  "wsEndpoint": "/api/voice/exotel",
  "wsUrl": "wss://<ngrok-domain>/api/voice/exotel",
  "healthEndpoint": "/api/voice/exotel/health",
  "diagnostics": {
    "exotelCredentialsConfigured": false,
    "exotelPhoneConfigured": true,
    "websocketServerReady": true,
    "sttProviderConfigured": true,
    "sttProviderName": "MockLocalSTT",
    "ttsProviderConfigured": true,
    "ttsProviderName": "MockServerTTS",
    "conversationEngineReady": true,
    "databaseConnected": true,
    "activeCallsCount": 0,
    "totalCallsHandled": 1
  }
}
```

---

## 7. Exotel Voicebot Applet Configuration

1. Log in to the [Exotel Console](https://my.exotel.com).
2. Go to **App Bazaar** $\rightarrow$ **Create Applet**.
3. Add a **Voicebot / Audio Stream Applet**.
4. Configure stream properties:
   - **Stream WebSocket URL**: `wss://<CURRENT_NGROK_DOMAIN>/api/voice/exotel`
   - **Audio Format**: `audio/x-l16` (Linear 16-bit PCM Mono)
   - **Sample Rate**: `8000 Hz` (or `16000 Hz`)
   - **Bidirectional Streaming**: Enabled
5. Link your **ExoPhone Virtual Number** (e.g., `09513886363`) to this Applet.

---

## 8. Natural Voice Behavior & Interruption Handling (Barge-In)

1. When the assistant is speaking and the caller begins speaking:
   - The gateway's Voice Activity Detection (VAD) detects audio frame energy (`energy > 1200`).
   - The gateway immediately clears pending TTS chunk timers.
   - The gateway sends an Exotel `"clear"` event:
     ```json
     {
       "event": "clear",
       "stream_sid": "..."
     }
     ```
   - Exotel stops playback on the caller's handset immediately.
   - The caller's new speech is ingested and processed.

---

## 9. Speech-to-Text (STT) Setup & Fallback

Located at [`src/server/sttProvider.ts`](file:///d:/SIH2026097/src/server/sttProvider.ts):
- **`BhashiniSTT`**: Official MeitY Indic pipeline for Marathi, Hindi, Tamil, Telugu, etc. (Requires `BHASHINI_API_KEY`, `BHASHINI_USER_ID`).
- **`GoogleCloudSTT`**: Google Speech-to-Text v1 API (Requires `GOOGLE_STT_API_KEY`).
- **`MockLocalSTT`**: Safe development & testing fallback. Automatically used when external API credentials are not set.

---

## 10. Text-to-Speech (TTS) Setup & Fallback

Located at [`src/server/ttsProvider.ts`](file:///d:/SIH2026097/src/server/ttsProvider.ts):
- **`SarvamTTS`**: High-fidelity Indian neural voices in Hindi, Marathi, and English (Requires `SARVAM_API_KEY`).
- **`BhashiniTTS`**: MeitY Indic neural TTS pipeline (Requires `BHASHINI_API_KEY`).
- **`MockServerTTS`**: Generates synthetic 16-bit PCM mono audio buffers for local testing.

---

## 11. Multi-Slot Conversational Extraction (NLU)

Beneficiaries do not need to answer one robotic question at a time. If the beneficiary says:
> *"I am 22, completed 10th, I am a farmer, I know basic electrical work and I want a job."*

The Indic NLU automatically extracts:
- `education_level`: `secondary` (10th)
- `current_livelihood`: `agriculture` (farming)
- `skills_interests`: `['electrical']`
- `employment_preference`: `wage_employment`

The conversation engine skips already answered questions and prompts only for missing information.

---

## 12. Placement Verification & Provenance Governance

In Disha Sarathi:
- Extracted profile fields from phone calls are stamped with provenance:
  - `source`: `'PHONE'`
  - `verificationStatus`: `'BENEFICIARY_CONFIRMED'`
  - `confidence`: `0.95+`
  - `timestamp`: ISO-8601 string
- **AI Placement Boundary**: AI analyzes documents and transcribes speech, but human District Coordinators remain the final verification authority for placement transitions (`ENROLLED` $\rightarrow$ `IN_TRAINING` $\rightarrow$ `COMPLETED` $\rightarrow$ `PLACED` $\rightarrow$ `FOLLOW_UP`).

---

## 13. Port Management & EADDRINUSE Troubleshooting

If port 8080 reports `EADDRINUSE`:

1. **Check running processes**:
   ```powershell
   netstat -ano | findstr :8080
   Get-CimInstance Win32_Process -Filter "name = 'node.exe'" | Select-Object ProcessId, CommandLine
   ```
2. **If the process is the existing voicebot**: Reuse it. Do not attempt to launch a duplicate instance.
3. **If the process is a stale/orphaned instance**: Stop only that specific PID:
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

---

## 14. Step-by-Step Manual Test Checklist

Follow these exact commands to verify each layer in sequence:

### Step 1: Automated Unit & Integration Tests
```bash
npm test
```
*(All 56 tests across 9 test files must pass)*

### Step 2: Build Verification
```bash
npm run build
```
*(Must compile `dist/` with 0 TypeScript errors)*

### Step 3: Start Voicebot
```bash
npm run voicebot
```

### Step 4: Test Local Health
```bash
curl http://localhost:8080/api/voice/exotel/health
```

### Step 5: Test Local WebSocket
```bash
wscat -c ws://localhost:8080/api/voice/exotel
```

### Step 6: Start Free ngrok
```bash
ngrok http 8080
```

### Step 7: Test Public Health
```bash
curl -H "ngrok-skip-browser-warning: true" https://<NGROK_DOMAIN>/api/voice/exotel/health
```

### Step 8: Test Public WSS
```bash
wscat -c "wss://<NGROK_DOMAIN>/api/voice/exotel"
```

### Step 9: Live Exotel Phone Call Test
1. Set Stream URL in Exotel Applet to `wss://<NGROK_DOMAIN>/api/voice/exotel`.
2. Call the ExoPhone number (`09513886363`).
3. Speak when prompted, observe server terminal logs, and verify caller receives spoken trade recommendations.
4. Verify session record appears in Admin & Coordinator dashboards.

