# Phase 2 

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PHASE 2 SYSTEM                                      │
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         ┌─────────────┐  │
│  │    WEB APP       │         │  FASTAPI BACKEND │         │   DATABASE  │  │
│  │   (React SPA)    │         │                  │         │  (Postgres) │  │
│  │                  │         │                  │         │             │  │
│  │ • Google Login   │◄────────│ • Auth (JWT)     │◄────────│ • Users     │  │
│  │ • Resume Upload  │   HTTPS │ • Store Resume   │         │ • Resumes   │  │
│  │ • Edit Templates │         │ • Serve Templates│         │ • Templates │  │
│  └──────────────────┘         └──────────────────┘         └─────────────┘  │
│           │                            ▲                                    │
│           │ Opens /login               │ API Calls                          │
│           │ Opens /settings            │ (with JWT)                         │
│           ▼                            │                                    │
│  ┌──────────────────────────────────────────────────┐                       │
│  │         BROWSER EXTENSION                        │                       │
│  │                                                  │                       │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  │                       │
│  │  │ Side Panel │  │ Background │  │  Content   │  │                       │
│  │  │            │  │            │  │  Script    │  │                       │
│  │  │ • Shows    │  │ • Stores   │  │            │  │                       │
│  │  │   Auth     │  │   JWT      │  │ • Extracts │  │                       │
│  │  │   Status   │  │ • Calls    │  │   Job Text │  │                       │ 
│  │  │ • Settings │  │   Backend  │  │            │  │                       │
│  │  │   Button   │  │   API      │  │            │  │                       │
│  │  └────────────┘  └────────────┘  └────────────┘  │                       │
│  └──────────────────────────────────────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## User Flow (Phase 2)

### First-time User Flow

```
User opens extension
        │
        ▼
┌───────────────────┐
│  SIDE PANEL       │  Shows: "Not signed in"
│                   │  Button: "Sign in to Job Copilot"
└─────────┬─────────┘
          │ User clicks "Sign in"
          │ chrome.tabs.create()
          ▼
┌───────────────────┐
│   WEB APP         │  1. /login page opens
│   /login          │  2. "Sign in with Google" button
└─────────┬─────────┘
          │ User clicks Google sign in
          │
          ▼
┌───────────────────┐
│  GOOGLE OAUTH     │  3. Google consent screen
└─────────┬─────────┘
          │ User approves
          │
          ▼
┌───────────────────┐
│   BACKEND         │  4. POST /auth/google { id_token }
│                   │  5. Verify token, create user
│                   │  6. Return JWT + user info
└─────────┬─────────┘
          │ JWT returned to web app
          │
          ▼
┌───────────────────┐
│   WEB APP         │  7. Store JWT in extension storage
│                   │     chrome.storage.local.set({ jwt })
│                   │  8. Redirect to /settings
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   WEB APP         │  9. /settings page
│   /settings       │  10. Shows: "No resume uploaded"
│                   │  11. Shows: Default templates
└─────────┬─────────┘
          │ User uploads resume
          │
          ▼
┌───────────────────┐
│   BACKEND         │  12. PUT /resume/master
│                   │      (with JWT header)
│                   │  13. Store resume in DB
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   WEB APP         │  14. Shows: "Resume saved ✓"
│                   │  15. User can edit templates 
└───────────────────┘
          │
          ▼
     SETUP COMPLETE
```

### Returning User Flow

```
User opens extension
        │
        ▼
┌───────────────────┐
│  SIDE PANEL       │  1. Checks chrome.storage.local for JWT
│                   │  2. Validates JWT with backend
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   BACKEND         │  3. GET /me (with JWT header)
│                   │  4. Returns user profile
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  SIDE PANEL       │  5. Shows: "Signed in as [name]"
│                   │  6. Shows: Resume status
│                   │  7. Shows: "Analyze Job" button (Phase 1)
│                   │  8. Shows: "Open Settings" button
└───────────────────┘
          │ User visits job page
          │ User clicks "Analyze Job"
          ▼
    [Phase 1 flow: Extract → Summarize → Display]
          │
          │ (Future: Can send to backend with JWT)
          ▼
     Job analyzed with user context
```

### Auth State Management

```
┌───────────────────────────────────────────────────────────────┐
│                    Extension Startup                          │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │ Read JWT from    │
              │ chrome.storage   │
              └────────┬─────────┘
                       │
           ┌───────────┴───────────┐
           │ JWT exists?           │
           └───────────┬───────────┘
                  Yes  │  No
       ┌──────────────┴──────────────┐
       ▼                             ▼
┌─────────────┐              ┌──────────────┐
│ Validate    │              │ Show "Sign   │
│ with Backend│              │ in" state    │
└──────┬──────┘              └──────────────┘
       │
   Valid? │ Invalid/Expired
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌─────────────┐       ┌──────────────┐
│ Show signed │       │ Clear JWT    │
│ in state    │       │ Show "Sign   │
└─────────────┘       │ in" state    │
                      └──────────────┘
```

---

## Tech Stack 

**Frontend (Web App):**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

**Backend (API):**
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy (ORM)
- Alembic (migrations)
- JWT authentication
- Google OAuth 2.0


