import { useState } from "react"

type JobData = {
  url: string
  title: string
  jobText: string
  source: "dom" | "selection" | "paste"
}

type Status = "idle" | "extracting" | "done" | "error"

function IndexSidePanel() {
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")

  const extractJobDescription = async () => {
    setStatus("extracting")
    setError("")

    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

      if (!tab.id) {
        throw new Error("No active tab found")
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" })

      setJobData(response)
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract job description")
      setStatus("error")
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: 16, gap: 16 }}>
      <h2 style={{ margin: 0 }}>Job Copilot</h2>

      <button
        onClick={extractJobDescription}
        disabled={status === "extracting"}
        style={{
          padding: "10px 16px",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: status === "extracting" ? "wait" : "pointer",
          fontSize: 14
        }}>
        {status === "extracting" ? "Extracting..." : "Extract Job Description"}
      </button>

      {status === "error" && (
        <div style={{ color: "#ef4444", padding: 8, backgroundColor: "#fef2f2", borderRadius: 4 }}>
          {error}
        </div>
      )}

      {jobData && status === "done" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <strong>Title:</strong> {jobData.title}
          </div>
          <details>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              Extracted Text (preview)
            </summary>
            <pre style={{
              whiteSpace: "pre-wrap",
              fontSize: 12,
              maxHeight: 300,
              overflow: "auto",
              backgroundColor: "#f3f4f6",
              padding: 8,
              borderRadius: 4
            }}>
              {jobData.jobText.slice(0, 6000)}
              {jobData.jobText.length > 6000 && "..."}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

export default IndexSidePanel
