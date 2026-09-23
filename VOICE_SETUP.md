# Disha Sarathi — Voice & Speech Architecture (PS 26097)

## 1. Overview of Voice Providers

Disha Sarathi supports a unified speech architecture across web, mobile, and telephony channels with automated fallback routing.

```
                   +------------------------+
                   |  SpeechRouter Engine   |
                   +-----------+------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|     TTS Providers     |             |     STT Providers     |
+-----------------------+             +-----------------------+
| 1. WebSpeechTTS       |             | 1. WebSpeechEngine    |
| 2. BhashiniTTS        |             | 2. BhashiniSTT        |
| 3. SarvamTTS          |             | 3. SarvamSTT          |
| 4. TelephonyTTS (PCM) |             | 4. Exotel Telephony   |
+-----------------------+             +-----------------------+
```

---

## 2. Text-to-Speech (TTS) Architecture & Critical Fixes

### 2.1 Provider Interface
Defined in [`src/engines/speech/TTSProvider.ts`](file:///d:/SIH2026097/src/engines/speech/TTSProvider.ts):

```typescript
export interface TTSProvider {
  synthesize(
    text: string,
    language: LanguageCode,
    options?: { onStart?: () => void; onEnd?: () => void; onError?: (err: any) => void }
  ): Promise<void>;
  cancel(): void;
  getProviderName(): string;
  isAvailable(): boolean;
}
```

### 2.2 Critical Browser TTS Fixes
1. **Chrome Garbage Collection Bug**: In Chromium-based browsers, speech synthesis utterances stored in local block scopes are prematurely garbage-collected mid-speech, leading to dropped audio or silent pauses. Disha Sarathi anchors all active utterance instances to `(window as any).__disha_current_utterance` until completion.
2. **Keep-Alive Resume Timer**: Chrome frequently pauses speech synthesis on long sentences. An automated keep-alive timer invokes `window.speechSynthesis.resume()` every 5 seconds.
3. **Indic Voice Prioritization**: Automatically prioritizes natural regional voices (e.g. Google मराठी, Google हिन्दी) when available.

---

## 3. Speech-to-Text (STT) & Continuous Hands-Free Loop

In [`src/ui/beneficiary/NaturalVoiceView.tsx`](file:///d:/SIH2026097/src/ui/beneficiary/NaturalVoiceView.tsx), the assistant operates in a continuous, natural hands-free loop:
1. **Assistant Speaks**: State $\rightarrow$ `SPEAKING` (pulsing cyan orb and waveform).
2. **Auto-Listen**: When speech ends, the microphone automatically opens $\rightarrow$ State `LISTENING` (reactive emerald wave bars).
3. **Multi-Slot Processing**: Transcribed speech is analyzed by `extractAllProfileSlots` $\rightarrow$ State `THINKING`.
4. **Auto-Advance**: Profile is updated and the next prompt is spoken back to the user.

---

## 4. Natural Interruption Protocol

If the assistant is speaking and the user begins speaking or taps the Conversational Voice Orb:
1. `speechRouter.stopSpeaking()` cancels active TTS synthesis immediately.
2. The microphone opens instantly to capture the user's statement.
3. The newly spoken input is parsed without forcing the user to wait.
