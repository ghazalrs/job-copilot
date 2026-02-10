## Architecture Overview

### Extension components
- **Content Script**
  - Reads the DOM and extracts job description text
  - Provides “selected text” extraction
  - Returns: `{ jobText, title?, company?, url }`

- **Side Panel UI**
  - React UI that displays extraction + summary
  - Triggers extraction and summary requests
  - Stores last result in `chrome.storage.local`

- **Background / Service Worker**
  - Orchestrates messages between side panel and content script
  - Makes API calls to summarization backend (optional for V1)
  - Keeps secrets (API keys) out of the page context

### Summarization
Phase 1 can support **either**:
- **Local stub summarizer** (no backend): returns a fake structured summary for UI development
- **Backend summarizer** (recommended once extraction works): side panel → background → API → returns structured JSON

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            BROWSER                                          │
│                                                                             │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │    SIDE PANEL    │         │   BACKGROUND     │                          │
│  │  (sidepanel.tsx) │         │ (background.ts)  │                          │
│  │                  │         │                  │                          │
│  │  • React UI      │         │  • Service Worker│                          │
│  │  • User clicks   │         │  • Always running│                          │
│  │  • Shows results │         │  • Holds secrets │                          │
│  └────────┬─────────┘         └────────┬─────────┘                          │
│           │                            │                                    │
│           │ chrome.tabs.sendMessage    │ fetch()                            │
│           │                            │                                    │
│           ▼                            ▼                                    │
│  ┌──────────────────┐         ┌──────────────────┐                          │ 
│  │  CONTENT SCRIPT  │         │     BACKEND      │  (outside browser)       │
│  │  (extractor.ts)  │         │   (your API)     │                          │
│  │                  │         │                  │                          │
│  │  • Runs in page  │         │  • Summarization │                          │
│  │  • Reads DOM     │         │  • LLM calls     │                          │
│  │  • Extracts text │         │  • Data storage  │                          │
│  └──────────────────┘         └──────────────────┘                          │
│           │                                                                 │
│           ▼                                                                 │
│  ┌──────────────────┐                                                       │
│  │     WEB PAGE     │                                                       │
│  │  (linkedin.com)  │                                                       │
│  └──────────────────┘                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Current Flow (Phase 1 - Extraction Only)

```
User clicks "Extract"
        │
        ▼
┌───────────────────┐
│    SIDE PANEL     │  1. User clicks button
│                   │  2. Calls chrome.tabs.query() to get active tab
│                   │  3. Sends message: { type: "EXTRACT_JOB" }
└─────────┬─────────┘
          │
          │  chrome.tabs.sendMessage(tabId, message)
          ▼
┌───────────────────┐
│  CONTENT SCRIPT   │  4. Receives message
│                   │  5. Reads DOM, finds job description
│                   │  6. Cleans text
│                   │  7. Returns { url, title, jobText, source }
└─────────┬─────────┘
          │
          │  sendResponse(jobData)
          ▼
┌───────────────────┐
│    SIDE PANEL     │  8. Receives response
│                   │  9. Updates state, displays results
└───────────────────┘
```

### Future Flow (With Summarization)

```
User clicks "Extract"
        │
        ▼
┌───────────────────┐
│    SIDE PANEL     │  1. Get job text from content script
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  CONTENT SCRIPT   │  2. Extract & return job text
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    SIDE PANEL     │  3. Send job text to background for summarization
│                   │     chrome.runtime.sendMessage({ type: "SUMMARIZE", jobText })
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    BACKGROUND     │  4. Receives summarize request
│                   │  5. Calls backend API (API key stored here)
│                   │     fetch("https://api.example.com/summarize")
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│     BACKEND       │  6. Receives job text
│    (your API)     │  7. Calls LLM (OpenAI/Claude)
│                   │  8. Returns structured summary
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│    BACKGROUND     │  9. Receives summary, sends to side panel
└─────────┬─────────┘
          │
          │  sendResponse(summary)
          ▼
┌───────────────────┐
│    SIDE PANEL     │  10. Displays structured summary
└───────────────────┘
```

## Tech Stack (Phase 1)
- TypeScript
- React (side panel UI)
- WXT or Plasmo (extension framework)
- Tailwind CSS (optional, but recommended)
- Zod (for validating the summary JSON shape)

