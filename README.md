# Job Copilot

> AI-powered Chrome extension for resume tailoring and job analysis

## Overview

Job Copilot helps job seekers optimize their resumes using AI. Extract job descriptions from any page, tailor your resume for specific roles, and generate cover letters - all from a browser side panel.

---

## Features

### Job Analysis
- Extract job descriptions from any job posting page
- AI-powered summarization (role overview, responsibilities, requirements, tech stack)

### Resume Tailoring
- Customize your resume for each job
- Get keyword matching analysis (matched vs. missing keywords)
- View changes with explanations
- Dual format output: Plain Text and LaTeX
- One-click export to Overleaf

### Cover Letter Generation
- Generate personalized cover letters based on job + resume
- Highlights key points from your experience
- Dual format output: Plain Text and LaTeX
- One-click export to Overleaf

---

## Architecture

```
+----------------------------------+
|   CHROME EXTENSION               |
|   - Side Panel UI (React)        |
|   - Job Extraction               |
|   - Resume & Cover Letter Gen    |
+----------------+-----------------+
                 | HTTPS + JWT
+----------------v-----------------+
|   FASTAPI BACKEND                |
|   - Google OAuth                 |
|   - Resume CRUD                  |
|   - AI Processing (Gemini)       |
+----------------+-----------------+
                 |
+----------------v-----------------+
|   DATABASE (PostgreSQL)          |
|   - Users                        |
|   - Resumes                      |
+----------------------------------+
```

---

## Tech Stack

- **Extension:** Plasmo, React, TypeScript, Chrome APIs
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, JWT
- **AI:** Google Gemini API

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
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select `extension/build/chrome-mv3-dev`

---

## Project Structure

```
job-copilot/
├── extension/              # Chrome extension (Plasmo + React)
│   ├── components/         # SignInView, ResumeTab
│   ├── hooks/              # useAuth, useResume
│   ├── contents/           # Content script for job extraction
│   ├── background.ts       # Service worker (Gemini API calls)
│   └── sidepanel.tsx       # Main UI
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API endpoints
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # AI service, LaTeX rendering
│   └── alembic/            # Database migrations
└── README.md
```

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/google` | POST | OAuth login |
| `/auth/google/access-token` | POST | Chrome extension auth |
| `/resume/master` | GET/PUT/DELETE | Resume CRUD |
| `/resume/tailor` | POST | AI resume tailoring |
| `/cover-letter/generate` | POST | AI cover letter generation |

---

## Coming Soon

- Resume match scoring with improvement suggestions
- RAG-powered chatbot for resume advice

---

## License

MIT
