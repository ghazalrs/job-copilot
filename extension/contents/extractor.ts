import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Listen for extraction requests from side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "EXTRACT_JOB") {
    const jobData = extractJobDescription()
    sendResponse(jobData)
  }
  return true // Keep channel open for async response
})

function extractJobDescription() {
  // Try common job description selectors
  const selectors = [
    '[class*="job-description_wrap"]',
    '[class*="job-description"]',
    '[class*="jobDescription"]',
    '[id*="job-description"]',
    '[class*="description"]',
    'article',
    '[role="main"]',
    'main'
  ]

  let jobText = ""

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element && element.textContent && element.textContent.length > 200) {
      jobText = element.textContent
      break
    }
  }

  // Fallback to body text if no match
  if (!jobText) {
    jobText = document.body.innerText
  }

  // Clean up the text
  jobText = jobText
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000) // Limit length

  return {
    url: window.location.href,
    title: document.title,
    jobText,
    source: "dom" as const
  }
}
