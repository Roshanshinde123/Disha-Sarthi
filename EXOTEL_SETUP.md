# Disha Sarathi — Exotel PSTN Telephony Setup Guide

This guide explains how to connect **Disha Sarathi** to an official **Exotel Indian Virtual Number (`ExoPhone`)** to enable real PSTN phone counseling for beneficiaries using basic feature phones or smartphones without internet.

---

## 📞 1. Provisioning Sequence

To deploy a live telephone helpline, follow this official setup sequence:

```
Create Exotel Account (https://my.exotel.com)
        ↓
Complete KYC & Organization Verification
        ↓
Acquire an Indian Virtual Number (ExoPhone)
        ↓
Create Voice Applet / Webhook Flow
        ↓
Configure Webhook & Media Stream URLs
        ↓
Insert Credentials into Server .env
        ↓
Deploy Node.js Voice Gateway on Public HTTPS / WSS
        ↓
Dial the ExoPhone from your mobile phone to test
```

---

## ⚙️ 2. Environment Configuration (`.env`)

Add the provisioned Exotel credentials to your server environment:

```env
# ====================================================================
# EXOTEL PSTN TELEPHONY INTEGRATION
# ====================================================================
EXOTEL_ACCOUNT_SID=your_exotel_account_sid
EXOTEL_API_KEY=your_exotel_api_key
EXOTEL_API_TOKEN=your_exotel_api_token
EXOTEL_EXOPHONE=+918047182609
EXOTEL_VOICE_WEBHOOK_URL=https://your-public-domain.com/api/exotel/incoming
EXOTEL_MEDIA_STREAM_URL=wss://your-public-domain.com/api/exotel/stream
```

> **IMPORTANT SECURITY NOTE:**
> Never expose Exotel credentials in frontend client JavaScript or public GitHub repositories. All telephony webhooks and authentication are handled exclusively on the backend server.

---

## 🌐 3. Exotel Console Configuration

1. Log in to the [Exotel Dashboard](https://my.exotel.com).
2. Go to **App Bazaar** $\rightarrow$ **Create New Applet** (Voice Flow).
3. Under the **Connect to URL / Webhook** widget, configure:
   - **Incoming Call URL**: `https://your-public-domain.com/api/exotel/incoming` (HTTP POST)
   - **Speech Gather URL**: `https://your-public-domain.com/api/exotel/gather` (HTTP POST)
   - **WebSocket Media Stream**: `wss://your-public-domain.com/api/exotel/stream`
4. Under **Phone Numbers / ExoPhones**, assign your provisioned virtual number to this newly created Voice Applet.

---

## 🎙️ 4. Telephony Audio & Voice XML Protocol

When a beneficiary dials the ExoPhone, Disha Sarathi returns standard Exotel Voice XML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="female" language="mr-IN">
    नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे. आपले शिक्षण आणि सध्याचे काम काय आहे?
  </Say>
  <Gather action="/api/exotel/gather" method="POST" speechTimeout="3" speechModel="telephony" language="mr-IN">
    <Pause length="1"/>
  </Gather>
</Response>
```

---

## 🧪 5. Local Demo Mode & PSTN Simulator

If you do not have active Exotel API credentials during development or offline hackathon evaluation:
- The system **will not crash**.
- The UI will display: `Cloud voice not configured — using local demo voice.`
- You can test the exact end-to-end telephony flow using the **PSTN Call Simulator** at `http://localhost:5173/admin`.
