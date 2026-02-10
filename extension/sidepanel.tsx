import { useEffect, useState } from "react"

type JobData = {
  url: string
  title: string
  jobText: string
}

// Add company overview later
type JobSummary = {
  roleOverview: string
  responsibilities: string[]
  requirements: string[]
  techAndTools: string[]
}

type Status = "idle" | "extracting" | "summarizing" | "done" | "error"

function IndexSidePanel() {
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [summary, setSummary] = useState<JobSummary | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")
  const [apiKey, setApiKey] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  // Load API key on mount
  useEffect(() => {
    chrome.storage.local.get("geminiApiKey").then(({ geminiApiKey }) => {
      if (geminiApiKey) setApiKey(geminiApiKey)
    })
  }, [])

  const saveApiKey = async () => {
    await chrome.storage.local.set({ geminiApiKey: apiKey })
    setShowSettings(false)
  }

  const analyzeJob = async () => {
    setStatus("extracting")
    setError("")
    setSummary(null)

    try {
      // Step 1: Extract job text
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) throw new Error("No active tab found")

      const extractedData = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" })
      setJobData(extractedData)

      // Step 2: Summarize
      setStatus("summarizing")
      const response = await chrome.runtime.sendMessage({
        type: "SUMMARIZE",
        jobText: extractedData.jobText
      })

      if (!response.success) {
        throw new Error(response.error)
      }

      setSummary(response.summary)
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze job")
      setStatus("error")
    }
  }

  const getButtonText = () => {
    switch (status) {
      case "extracting": return "Extracting..."
      case "summarizing": return "Summarizing..."
      default: return "Analyze Job"
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16, gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Job Copilot</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>
          {showSettings ? "✕" : "⚙️"}
        </button>
      </div>

      {showSettings && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, backgroundColor: "#f3f4f6", borderRadius: 6 }}>
          <label style={{ fontSize: 12, fontWeight: "bold" }}>Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            style={{ padding: 8, borderRadius: 4, border: "1px solid #d1d5db", fontSize: 14 }}
          />
          <button
            onClick={saveApiKey}
            style={{ padding: "8px 12px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
            Save
          </button>
        </div>
      )}

      <button
        onClick={analyzeJob}
        disabled={status === "extracting" || status === "summarizing"}
        style={{
          padding: "12px 16px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: status === "extracting" || status === "summarizing" ? "wait" : "pointer",
          fontSize: 14,
          fontWeight: "bold"
        }}>
        {getButtonText()}
      </button>

      {status === "error" && (
        <div style={{ color: "#ef4444", padding: 12, backgroundColor: "#fef2f2", borderRadius: 6 }}>
          {error}
        </div>
      )}

      {summary && status === "done" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Role Overview */}
          <section>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#6b7280" }}>Role Overview</h3>
            <p style={{ margin: 0, lineHeight: 1.5 }}>{summary.roleOverview}</p>
          </section>

          {/* Responsibilities */}
          <section>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#6b7280" }}>Responsibilities</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {summary.responsibilities.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#6b7280" }}>Requirements</h3>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {summary.requirements.map((item, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{item}</li>
              ))}
            </ul>
          </section>

          {/* Tech & Tools */}
          <section>
            <h3 style={{ margin: "0 0 8px 0", fontSize: 14, color: "#6b7280" }}>Tech & Tools</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {summary.techAndTools.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                    borderRadius: 12,
                    fontSize: 12
                  }}>
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Extracted Text (collapsible) */}
          {jobData && (
            <details style={{ marginTop: 8 }}>
              <summary style={{ cursor: "pointer", fontSize: 12, color: "#6b7280" }}>
                View extracted text ({jobData.jobText.length} chars)
              </summary>
              <pre style={{
                whiteSpace: "pre-wrap",
                fontSize: 11,
                maxHeight: 200,
                overflow: "auto",
                backgroundColor: "#f3f4f6",
                padding: 8,
                borderRadius: 4,
                marginTop: 8
              }}>
                {jobData.jobText}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}

export default IndexSidePanel
