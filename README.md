# AR-CARE LINK 🩺

> **"Bringing specialist guidance to the frontline — through the worker's own view."**

AR-CARE LINK is an AI-assisted remote healthcare decision-support and shared Augmented Reality (AR) guidance platform. It empowers frontline healthcare workers in remote or resource-limited environments by connecting them in real-time with remote specialist physicians.

---

## 🚀 Key Features

- **Single Application with Role-Based Portals**:
  - Frontline Worker Portal (`/worker/dashboard`) - Mobile-optimized case creation, vitals entry, voice input, AI assessment review, and specialist requests.
  - Specialist Studio (`/specialist/dashboard`) - Desktop/tablet dashboard for incoming case triage, WebRTC video consultation, interactive AR marker placement, and PDF report generation.
- **Rule-Based Explainable AI Engine**:
  - Evaluates SpO2, heart rate, respiratory rate, blood pressure, and symptom keywords against configurable clinical thresholds.
  - Generates clear risk stratification (`URGENT PROFESSIONAL REVIEW`), flagged reasons, missing information checklists, and safety disclaimers.
- **Shared AR Canvas Subsystem**:
  - Specialist clicks anywhere on the live video stream to target relative relative coordinates `(x%, y%)`.
  - Dispatches `AR_MARKER` over WebSockets to render animated, pulsing pins on the frontline worker's camera view.
  - Real-time instruction status tracking (`PENDING` -> `ACKNOWLEDGED` -> `✓ COMPLETED`).
- **Offline-First & Automatic Synchronization**:
  - PWA Service Worker + IndexedDB queue (`offlineDB.js`).
  - Auto-detects network state and synchronizes queued offline cases to the FastAPI backend upon reconnection.
- **Tamil & English Voice Input**:
  - Web Speech API integration supporting Tamil/Tanglish and English speech-to-text with browser fallback warnings.
- **PDF Case Report Generator**:
  - Generates downloadable, structured clinical summaries including patient info, vitals, AI reasoning, timeline, and specialist instructions.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Lucide Icons, Tailwind CSS, Web Speech API, IndexedDB, Service Worker (PWA).
- **Backend**: Python 3.12, FastAPI, Uvicorn, Pydantic, PyTest, ReportLab (PDF generator), Jose (JWT), Passlib/Bcrypt.
- **Database**: Firebase Firestore with built-in zero-config local fallback store.
- **Real-Time & Media**: WebSockets, WebRTC RTCPeerConnection with local DEMO PREVIEW stream fallback.

---

## 📋 Demo Credentials

| Role | Email | Password | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Frontline Worker** | `worker@arcare.demo` | `worker123` | `http://localhost:5173/worker/dashboard` |
| **Specialist Physician** | `doctor@arcare.demo` | `doctor123` | `http://localhost:5173/specialist/dashboard` |

---

## 💻 Local Windows Setup Instructions

### Prerequisites
- Python 3.10+ (or Python 3.12 via `uv`)
- Node.js v18+ & npm

### 1. Backend Startup

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- Backend API: `http://localhost:8000`
- Interactive Swagger Docs: `http://localhost:8000/docs`

### 2. Frontend Startup

```powershell
cd frontend
npm install
npm run dev
```

- Application Portal: `http://localhost:5173`

---

## 🔥 Firebase Setup (Optional)

AR-CARE LINK includes an automated local in-memory/file fallback store so that evaluators can run the entire application out of the box with zero external configuration. To connect to live Firebase Firestore:

1. Create a Firebase project at [https://console.firebase.google.com](https://console.firebase.google.com).
2. Create a Firestore Database in Production mode.
3. Project Settings > Service Accounts > Generate new private key.
4. Save the JSON key inside `backend/` (e.g. `serviceAccountKey.json`).
5. Update `backend/.env`:
   ```env
   FIREBASE_CREDENTIALS_PATH=serviceAccountKey.json
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ```

---

## 🎯 30-Second Hackathon Demo Walkthrough Procedure

1. Open `http://localhost:5173` in Browser 1. Click **DEMO WORKER** -> Login.
2. Click **+ CREATE NEW CASE** -> Click **⚡ AUTO-FILL DEMO CASE P001** -> Click **CREATE CASE**.
3. Click **ANALYZE CASE** -> Observe `URGENT PROFESSIONAL REVIEW` and explainable reasons breakdown.
4. Click **🚨 REQUEST SPECIALIST**.
5. Open `http://localhost:5173` in Browser 2 (or Incognito window). Click **DEMO SPECIALIST** -> Login.
6. Specialist dashboard displays **Case P001**. Click **🎥 JOIN SESSION**.
7. In Worker browser, click **JOIN LIVE SESSION** -> Click **START CAMERA**.
8. In Specialist browser, click on the camera stream video frame -> Enter instruction message ("Observe chest movement") -> Click **SEND**.
9. Worker receives live pulsing **🔴 CHECK HERE** AR marker overlay -> Worker clicks **ACKNOWLEDGE** -> Worker clicks **MARK COMPLETED**.
10. Specialist UI updates live to **✓ COMPLETED BY WORKER**.
11. Disconnect network in DevTools (Offline mode) -> Worker adds note -> Reconnect network -> Verify **🟢 CONNECTION RESTORED - Synchronized**.
12. Click **📄 PDF REPORT** -> Download structured PDF summary.

---

## ⚠️ Healthcare Safety Disclaimer

> **AR-CARE LINK is a prototype for remote assistance and decision-support. AI outputs are not medical diagnoses and must not replace professional clinical judgment. All patient profiles used in this demonstration consist of synthetic demo data.**
