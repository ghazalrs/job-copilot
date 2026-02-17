import { useEffect, useState } from "react"
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useAuth } from './hooks/useAuth'
import { useResume } from './hooks/useResume'
import { SignInView } from './components/SignInView'
import { ResumeTab } from './components/ResumeTab'

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
  // Auth state
  const { user, token, isAuthenticated, isLoading: authLoading, login, logout } = useAuth()

  // Resume state
  const {
    resume,
    resumeText,
    setResumeText,
    isLoading: resumeLoading,
    isSaving,
    hasChanges,
    error: resumeError,
    successMessage,
    saveResume,
    deleteResume,
  } = useResume(token)

  // Tab state
  const [activeTab, setActiveTab] = useState<'resume' | 'job'>('job')

  // Job analysis state (existing)
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

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // Show sign-in if not authenticated
  if (!isAuthenticated) {
    return <SignInView onSignIn={login} />
  }

  // Authenticated view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18 }}>Job Copilot</h2>
          <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>
            {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
            {showSettings ? "✕" : "⚙️"}
          </button>
          <button
            onClick={logout}
            style={{
              padding: '6px 12px',
              fontSize: 12,
              backgroundColor: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: 4,
              cursor: 'pointer'
            }}>
            Logout
          </button>
        </div>
      </div>

      {/* Settings panel (existing Gemini API key) */}
      {showSettings && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, backgroundColor: '#f3f4f6', margin: 16, borderRadius: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 'bold' }}>Gemini API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            style={{ padding: 8, borderRadius: 4, border: '1px solid #d1d5db', fontSize: 14 }}
          />
          <button
            onClick={saveApiKey}
            style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            Save
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <button
          onClick={() => setActiveTab('resume')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: activeTab === 'resume' ? 'bold' : 'normal',
            backgroundColor: activeTab === 'resume' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'resume' ? '2px solid #3b82f6' : 'none',
            cursor: 'pointer',
          }}>
          Resume
        </button>
        <button
          onClick={() => setActiveTab('job')}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: activeTab === 'job' ? 'bold' : 'normal',
            backgroundColor: activeTab === 'job' ? 'white' : '#f3f4f6',
            border: 'none',
            borderBottom: activeTab === 'job' ? '2px solid #3b82f6' : 'none',
            cursor: 'pointer',
          }}>
          Job Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'resume' && (
          <ResumeTab
            resume={resume}
            resumeText={resumeText}
            setResumeText={setResumeText}
            isLoading={resumeLoading}
            isSaving={isSaving}
            hasChanges={hasChanges}
            error={resumeError}
            successMessage={successMessage}
            saveResume={saveResume}
            deleteResume={deleteResume}
          />
        )}

        {activeTab === 'job' && (
          <div style={{ display: 'flex', flexDirection: 'column', padding: 16, gap: 16 }}>
            <button
              onClick={analyzeJob}
              disabled={status === 'extracting' || status === 'summarizing'}
              style={{
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: status === 'extracting' || status === 'summarizing' ? 'wait' : 'pointer',
                fontSize: 14,
                fontWeight: 'bold'
              }}>
              {getButtonText()}
            </button>

            {status === 'error' && (
              <div style={{ color: '#ef4444', padding: 12, backgroundColor: '#fef2f2', borderRadius: 6 }}>
                {error}
              </div>
            )}

            {summary && status === 'done' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Role Overview */}
                <section>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>Role Overview</h3>
                  <p style={{ margin: 0, lineHeight: 1.5 }}>{summary.roleOverview}</p>
                </section>

                {/* Responsibilities */}
                <section>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>Responsibilities</h3>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {summary.responsibilities.map((item, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                </section>

                {/* Requirements */}
                <section>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>Requirements</h3>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {summary.requirements.map((item, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{item}</li>
                    ))}
                  </ul>
                </section>

                {/* Tech & Tools */}
                <section>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>Tech & Tools</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summary.techAndTools.map((item, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#dbeafe',
                          color: '#1e40af',
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
                    <summary style={{ cursor: 'pointer', fontSize: 12, color: '#6b7280' }}>
                      View extracted text ({jobData.jobText.length} chars)
                    </summary>
                    <pre style={{
                      whiteSpace: 'pre-wrap',
                      fontSize: 11,
                      maxHeight: 200,
                      overflow: 'auto',
                      backgroundColor: '#f3f4f6',
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
        )}
      </div>
    </div>
  )
}

// Wrap in GoogleOAuthProvider
export default function SidePanelWithAuth() {
  const clientId = process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID || ''

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <IndexSidePanel />
    </GoogleOAuthProvider>
  )
}
