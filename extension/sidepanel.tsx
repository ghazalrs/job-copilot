import { useEffect, useState } from "react"
import { useAuth } from './hooks/useAuth'
import { useResume } from './hooks/useResume'
import { SignInView } from './components/SignInView'
import { ResumeTab } from './components/ResumeTab'

type JobData = {
  url: string
  title: string
  jobText: string
}

type JobSummary = {
  roleOverview: string
  responsibilities: string[]
  requirements: string[]
  techAndTools: string[]
}

type Status = "idle" | "extracting" | "summarizing" | "done" | "error"

type TailoredResumeResult = {
  tailored_resume: string
  tailored_resume_latex: string
  changes_made: Array<{ change: string; rationale: string }>
  keywords_matched: string[]
  keywords_missing: string[]
  keyword_variants_used: string[]
  clarifying_questions: string[]
}

type TailorStatus = "idle" | "tailoring" | "done" | "error"
type ResumeFormat = "plain" | "latex"

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

  // Job analysis state
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [summary, setSummary] = useState<JobSummary | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<string>("")
  const [apiKey, setApiKey] = useState<string>("")
  const [showSettings, setShowSettings] = useState(false)

  // Resume tailoring state
  const [tailorStatus, setTailorStatus] = useState<TailorStatus>("idle")
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResult | null>(null)
  const [tailorError, setTailorError] = useState<string>("")
  const [resumeFormat, setResumeFormat] = useState<ResumeFormat>("plain")

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
      // Extract job text
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab.id) throw new Error("No active tab found")

      const extractedData = await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_JOB" })
      setJobData(extractedData)

      // Summarize
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

  const tailorResume = async () => {
    if (!jobData || !token) {
      setTailorError("Missing job data or authentication")
      return
    }

    setTailorStatus("tailoring")
    setTailorError("")
    setTailoredResult(null)

    try {
      
      // Get the user's master resume from backend
      const resumeResponse = await fetch('http://localhost:8000/resume/master', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!resumeResponse.ok) {
        if (resumeResponse.status === 404) {
          throw new Error("Please upload your resume in the Resume tab first")
        }
        throw new Error("Failed to fetch your resume")
      }

      const resumeData = await resumeResponse.json()

      // Call the tailor endpoint
      const tailorResponse = await fetch('http://localhost:8000/resume/tailor', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job_description: jobData.jobText,
          master_resume: resumeData.raw_text
        })
      })

      if (!tailorResponse.ok) {
        const errorData = await tailorResponse.json()
        throw new Error(errorData.detail || "Failed to tailor resume")
      }

      const result = await tailorResponse.json()
      setTailoredResult(result)
      setTailorStatus("done")
    } catch (err) {
      setTailorError(err instanceof Error ? err.message : "Failed to tailor resume")
      setTailorStatus("error")
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

      {/* Settings panel */}
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

                {/* Tailor Resume Button */}
                <button
                  onClick={tailorResume}
                  disabled={tailorStatus === 'tailoring'}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: tailorStatus === 'tailoring' ? 'wait' : 'pointer',
                    fontSize: 14,
                    fontWeight: 'bold',
                    marginTop: 16
                  }}>
                  {tailorStatus === 'tailoring' ? '✨ Tailoring Resume...' : '✨ Tailor My Resume'}
                </button>

                {/* Tailor Error */}
                {tailorError && (
                  <div style={{ color: '#ef4444', padding: 12, backgroundColor: '#fef2f2', borderRadius: 6, fontSize: 14 }}>
                    {tailorError}
                  </div>
                )}

                {/* Tailored Resume Results */}
                {tailoredResult && tailorStatus === 'done' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16, padding: 16, backgroundColor: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                    <h3 style={{ margin: 0, fontSize: 16, color: '#15803d' }}>✨ Tailored Resume</h3>

                    {/* Changes Made */}
                    <section>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>Changes Made:</h4>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {tailoredResult.changes_made.map((item, i) => (
                          <li key={i} style={{ marginBottom: 8 }}>
                            <strong>{item.change}</strong>
                            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6b7280' }}>{item.rationale}</p>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Keywords Matched */}
                    <section>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>
                        ✅ Keywords Matched ({tailoredResult.keywords_matched.length}):
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {tailoredResult.keywords_matched.map((keyword, i) => (
                          <span key={i} style={{ padding: '4px 10px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 12, fontSize: 12 }}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </section>

                    {/* Keywords Missing */}
                    {tailoredResult.keywords_missing.length > 0 && (
                      <section>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: 14, color: '#6b7280' }}>
                          ⚠️ Keywords Missing ({tailoredResult.keywords_missing.length}):
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {tailoredResult.keywords_missing.map((keyword, i) => (
                            <span key={i} style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 12, fontSize: 12 }}>
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Tailored Resume Text */}
                    <section>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h4 style={{ margin: 0, fontSize: 14, color: '#6b7280' }}>Tailored Resume:</h4>
                        {/* Format Toggle */}
                        <div style={{ display: 'flex', gap: 4, backgroundColor: '#e5e7eb', padding: 2, borderRadius: 4 }}>
                          <button
                            onClick={() => setResumeFormat('plain')}
                            style={{
                              padding: '4px 12px',
                              fontSize: 11,
                              border: 'none',
                              borderRadius: 3,
                              cursor: 'pointer',
                              backgroundColor: resumeFormat === 'plain' ? 'white' : 'transparent',
                              color: resumeFormat === 'plain' ? '#10b981' : '#6b7280',
                              fontWeight: resumeFormat === 'plain' ? 'bold' : 'normal'
                            }}>
                            Plain Text
                          </button>
                          <button
                            onClick={() => setResumeFormat('latex')}
                            style={{
                              padding: '4px 12px',
                              fontSize: 11,
                              border: 'none',
                              borderRadius: 3,
                              cursor: 'pointer',
                              backgroundColor: resumeFormat === 'latex' ? 'white' : 'transparent',
                              color: resumeFormat === 'latex' ? '#10b981' : '#6b7280',
                              fontWeight: resumeFormat === 'latex' ? 'bold' : 'normal'
                            }}>
                            LaTeX
                          </button>
                        </div>
                      </div>

                      <pre style={{
                        whiteSpace: 'pre-wrap',
                        fontSize: 12,
                        maxHeight: 400,
                        overflow: 'auto',
                        backgroundColor: 'white',
                        padding: 12,
                        borderRadius: 4,
                        border: '1px solid #d1fae5',
                        lineHeight: 1.6,
                        fontFamily: resumeFormat === 'latex' ? 'monospace' : 'inherit'
                      }}>
                        {resumeFormat === 'plain' ? tailoredResult.tailored_resume : tailoredResult.tailored_resume_latex}
                      </pre>

                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => {
                            const textToCopy = resumeFormat === 'plain'
                              ? tailoredResult.tailored_resume
                              : tailoredResult.tailored_resume_latex
                            navigator.clipboard.writeText(textToCopy)
                          }}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 12
                          }}>
                          📋 Copy {resumeFormat === 'plain' ? 'Plain Text' : 'LaTeX'}
                        </button>

                        {resumeFormat === 'latex' && (
                          <button
                            onClick={() => {
                              const overleafUrl = `https://www.overleaf.com/docs?snip_uri=${
                                encodeURIComponent('data:application/x-tex,' + encodeURIComponent(tailoredResult.tailored_resume_latex))
                              }`
                              chrome.tabs.create({ url: overleafUrl })
                            }}
                            style={{
                              padding: '8px 16px',
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                              fontSize: 12
                            }}>
                            📄 Open in Overleaf
                          </button>
                        )}
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default IndexSidePanel
