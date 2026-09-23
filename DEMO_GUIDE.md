# Disha Sarathi — Evaluator Demo Guide (PS 26097)

This guide provides step-by-step instructions for testing and evaluating **Disha Sarathi** during live hackathon judging.

---

## 🎯 Demo Flow 1: Natural Conversational Voice on Web / Mobile

1. Open `http://localhost:5173` in your browser.
2. Click **🎙️ दिशा सारथीशी बोला (Talk to Disha Sarathi)** on the landing page (or navigate to `/talk`).
3. Allow microphone permissions.
4. **Hands-Free Conversational Voice**:
   - The assistant introduces herself in Marathi: *"नमस्कार! दिशा सारथी मध्ये आपले स्वागत आहे..."*
   - Speak naturally: *"मी पुण्यात राहतो, १०वी शिकलो आहे आणि मला इलेक्ट्रिकल काम आवडतं."*
   - Notice the **Voice Orb** change to **THINKING** and extract all 3 slots simultaneously:
     - 📍 Location: `Pune`
     - 🎓 Education: `Class 10`
     - ⚡ Interest: `Electrical`
   - The assistant fast-forwards automatically to the next unfilled question (e.g. employment preference).
5. State your preference: *"मला नोकरी करायची आहे."*
6. The assistant speaks the top NSQF recommendation: **Electrician (NSQF Level 4)** and displays the recommendation view.
7. Click **🪪 माझा डॅशबोर्ड व आकांक्षा कार्ड पहा** to inspect the Aspiration QR Card and download the Canvas PNG badge.

---

## 📞 Demo Flow 2: Real Phone Call $\rightarrow$ Dashboard Synchronization

1. Navigate to **Admin & Telephony Gateway** at `http://localhost:5173/admin` (or log in with `demo.admin` / `password123`).
2. Review the configured Exotel Virtual Line: `+91 80 4718 2609`.
3. Under **PSTN Telephony Call Simulator**, enter a test caller phone number (e.g., `+91 98765 43210`) and select **Marathi**.
4. Run the simulation. The backend executes `handleExotelIncomingCall` and continuous `handleExotelGather`.
5. Observe the live call log record appear with `STATUS: COMPLETED`, `Profile Completed: YES`, and `Recommendations: YES`.
6. Open **GIA Coordinator Dashboard** at `http://localhost:5173/dashboard` (or log in with `demo.coordinator` / `password123`).
7. **Verify Synchronization**: The beneficiary profile created via phone call is immediately visible in the active beneficiary cohort and district matrix without manual data entry.

---

## 📊 Demo Flow 3: GIA Coordinator Planning & Capacity Gap Analysis

1. Go to `http://localhost:5173/dashboard`.
2. Inspect the **India & District Planning Map** showing beneficiary concentrations and PMKK/NSTI training center pins.
3. Review the **District $\times$ Trade Matrix** showing:
   - District Demand Index
   - Available Training Capacity
   - Capacity Gaps (High unmet demand)
4. Click **📥 Export District × Trade Matrix (CSV)** to download the raw planning data.
5. Click on any beneficiary row to inspect their full **Explainability Trace** and skill-gap intervention package.
