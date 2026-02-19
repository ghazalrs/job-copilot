# Job Copilot

> AI-powered Chrome extension for resume tailoring and job analysis

## Overview

Job Copilot helps job seekers optimize their resumes using AI. Extract job descriptions, manage your resume in the cloud, and get AI-powered insights.

**Status:** ✅ Phase 1 & 2 Complete | 🔄 Phase 3 (AI Features) 

---

## Current Features

### Phase 1: Job Analysis ✅
- Extract job descriptions from any page
- AI summarization (role, responsibilities, requirements, tech stack)
- Powered by Gemini API

### Phase 2: Auth & Storage ✅
- Google OAuth authentication (Chrome Identity API)
- Cloud resume storage
- Multi-device sync
- JWT-based backend (FastAPI + SQLite/PostgreSQL)

---

## Coming Soon: Phase 3

### 1. AI Resume Tailoring
Customize your resume for each job using AI.

**Endpoint:** `POST /resume/tailor`
- Input: job description + master resume
- Output: tailored resume with highlighted changes

### 2. Resume Match Scoring
Get a match percentage with improvement suggestions.

**Endpoint:** `POST /resume/score`
- Score: 0-100%
- Strengths/weaknesses
- Missing keywords
- Specific suggestions

### 3. RAG Chatbot
Ask questions about your resume and get personalized advice.

**Endpoint:** `POST /chat`
- Context-aware responses
- Powered by vector DB + LangChain
- Conversation history

---

## Architecture

```
┌──────────────────────────────────┐
│   CHROME EXTENSION               │
│   • Side Panel UI (React)        │
│   • Job Extraction               │
│   • Auth & Resume Management     │
└────────────┬─────────────────────┘
             │ HTTPS + JWT
┌────────────▼─────────────────────┐
│   FASTAPI BACKEND                │
│   • Google OAuth                 │
│   • Resume CRUD                  │
│   • AI Processing (Phase 3)      │
└────────────┬─────────────────────┘
             │
┌────────────▼─────────────────────┐
│   DATABASE                       │
│   • Users                        │
│   • Resumes                      │
└──────────────────────────────────┘
```

---

## Tech Stack

- **Extension:** Plasmo, React, TypeScript, Chrome APIs
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT

---

## Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your credentials
alembic upgrade head
uvicorn app.main:app --reload
```

### Extension
```bash
cd extension
npm install
cp .env.example .env  # Add API URL and Google Client ID
npm run dev
```

### Load Extension
1. Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. "Load unpacked" → `extension/build/chrome-mv3-dev`

---

## Project Structure

```
job-copilot/
├── extension/          # Chrome extension (Plasmo + React)
│   ├── components/     # SignInView, ResumeTab
│   ├── hooks/          # useAuth, useResume
│   ├── lib/            # API client
│   ├── background.ts   # Service worker
│   └── sidepanel.tsx   # Main UI
├── backend/            # FastAPI backend
│   ├── app/
│   │   ├── models/     # SQLAlchemy models
│   │   ├── routers/    # API endpoints
│   │   ├── schemas/    # Pydantic schemas
│   │   └── services/   # Business logic
│   └── alembic/        # Migrations
└── README.md
```

---

## API Endpoints

**Current:**
- `POST /auth/google` - OAuth login
- `POST /auth/google/access-token` - Chrome extension auth
- `GET/PUT/DELETE /resume/master` - Resume CRUD

**Phase 3:**
- `POST /resume/tailor` - AI resume tailoring
- `POST /resume/score` - Match scoring
- `POST /chat` - RAG chatbot

---

## License

MIT
