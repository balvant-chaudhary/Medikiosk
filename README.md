# MediKiosk

> **Smart India Hackathon (SIH) Project**
> AI-Assisted Pre-Consultation and Patient History Intake Platform

---

## Overview

MediKiosk converts multilingual voice/touch patient interactions and historical medical documents into structured, physician-reviewable clinical histories — reducing the burden of manual history collection before doctor consultations.

```
Patient → Language → Consent → Registration → AI Interview
→ Documents → OCR → Review → AI Summary → Red-Flag Screening
→ Doctor Queue → Doctor Review → Final Clinical Record
```

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React + Vite + Tailwind CSS             |
| Backend   | Node.js + Express.js                   |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT + bcrypt                           |
| AI        | Google Gemini API                      |
| OCR       | Tesseract.js                           |
| STT/TTS   | Web Speech API → Bhashini (Phase 11)   |
| Storage   | Cloudinary                             |
| Charts    | Recharts                               |

---

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your keys
npm run dev
# → http://localhost:5000
```

---

## Demo Access

### Patient Kiosk
Navigate to: `http://localhost:5173/`

### Doctor Dashboard
Navigate to: `http://localhost:5173/doctor/login`
- Email: `doctor@medikiosk.in`
- Password: `demo1234`
- Select: Doctor

### Admin Dashboard
Navigate to: `http://localhost:5173/doctor/login`
- Select: Admin (same credentials)

---

## Project Structure

```
SIH_Project/
├── frontend/           React + Vite + Tailwind
│   └── src/
│       ├── components/ui/   Button, Card, Badge, Modal, Spinner, ProgressBar
│       ├── pages/
│       │   ├── patient/     Welcome → Consent → Registration → Interview → Documents → Review → Confirmation
│       │   ├── doctor/      Login, Dashboard, PatientDetail
│       │   └── admin/       Dashboard
│       ├── layouts/         PatientLayout, DoctorLayout, AdminLayout
│       ├── context/         AuthContext, PatientContext
│       ├── hooks/           useVoice, useTranslation
│       ├── i18n/            en.json, hi.json
│       └── routes/          AppRoutes.jsx
│
└── backend/            Node + Express + MongoDB
    └── src/
        ├── models/
        ├── controllers/
        ├── routes/
        ├── services/    aiService, ocrService, summaryService, redFlagService
        └── middleware/
```

---

## Implementation Phases

- [x] Phase 0 — Scaffolding
- [x] Phase 1 — Design System
- [x] Phase 2 — Patient UI (Mock Data)
- [x] Phase 3 — Doctor Dashboard (Mock Data)
- [x] Phase 4 — Admin Dashboard (Mock Data)
- [ ] Phase 5 — Express Backend
- [ ] Phase 6 — MongoDB + Mongoose Models
- [ ] Phase 7 — Authentication
- [ ] Phase 8 — Patient APIs Live
- [ ] Phase 9 — Interview Engine
- [ ] Phase 10 — AI Integration
- [ ] Phase 11 — Voice (Bhashini)
- [ ] Phase 12 — OCR Pipeline
- [ ] Phase 13 — Clinical Summary
- [ ] Phase 14 — Red-Flag Engine
- [ ] Phase 15 — Doctor Workflow Live
- [ ] Phase 16 — Admin Analytics
- [ ] Phase 17 — Mock FHIR/ABDM
- [ ] Phase 18 — Testing
- [ ] Phase 19 — Deployment

---

## Safety Disclaimer

MediKiosk is **not a medical diagnosis system**.

- AI assists with: information extraction, adaptive questioning, summarization, red-flag identification
- The doctor makes all final clinical decisions
- All AI outputs are clearly marked as drafts until physician confirmation

---

## Team

| Member | Area |
|--------|------|
| Member 1 | Patient Frontend |
| Member 2 | Doctor + Admin Frontend |
| Member 3 | Backend + MongoDB + Auth |
| Member 4 | AI + OCR + Voice + Integration |

## Git Branch Convention

```
main → develop → feature/patient-ui
                  feature/doctor-dashboard
                  feature/backend-auth
                  feature/ai
                  feature/ocr
                  feature/voice
```

---

*Built for Smart India Hackathon · MediKiosk v1.0*
