export {}

let geminiApiKey: string | null = null

chrome.storage.local.get("geminiApiKey").then(res => {
  geminiApiKey = res.geminiApiKey
})

// Open side panel when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))

// Types
type JobSummary = {
  roleOverview: string
  responsibilities: string[]
  requirements: string[]
  techAndTools: string[]
}

type SummarizeRequest = {
  type: "SUMMARIZE"
  jobText: string
}

type SummarizeResponse = {
  success: true
  summary: JobSummary
} | {
  success: false
  error: string
}

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((message: SummarizeRequest, sender, sendResponse) => {
  if (message.type === "SUMMARIZE") {
    summarizeWithGemini(message.jobText)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }))
    return true // Keep channel open for async response
  }
})

async function summarizeWithGemini(jobText: string): Promise<SummarizeResponse> {

  if (!geminiApiKey) {
    return { success: false, error: "Gemini API key not set. Please add your API key in settings." }
  }

  const prompt = `Analyze this job description and extract key information in JSON format.

Job Description:
${jobText}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "roleOverview": "A 2-3 sentence summary of the role",
  "responsibilities": ["responsibility 1", "responsibility 2", ...],
  "requirements": ["requirement 1", "requirement 2", ...],
  "techAndTools": ["technology 1", "tool 2", ...]
}

Keep each array to 5-8 most important items. Be concise.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024
          }
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No response from Gemini")
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = text.trim()
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim()
    }

    const summary: JobSummary = JSON.parse(jsonStr)

    return { success: true, summary }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to summarize"
    }
  }
}
