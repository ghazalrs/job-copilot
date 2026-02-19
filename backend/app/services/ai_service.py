import json
import google.generativeai as genai
from typing import Dict, Any
from app.config import settings


# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


async def tailor_resume(job_description: str, master_resume: str) -> Dict[str, Any]:
    
    # Use techniques from the ChatGPT Job Search Playbook
    prompt = f"""You are an expert resume strategist. Your task is to tailor a resume for a specific job posting while preserving the candidate's authentic voice and ensuring all claims remain verifiable.

JOB DESCRIPTION:
{job_description}

MASTER RESUME:
{master_resume}

TAILORING PROCESS:

1. KEYWORD ANALYSIS
   - Extract required skills, tools, and qualifications from the job description
   - Identify keyword variants and industry-standard alternate phrasings
   - Note role-specific terminology that should be reflected in the resume

2. VOICE PRESERVATION
   - Maintain the candidate's authentic writing style from their original resume
   - Flag and avoid any phrasing that sounds generic, inflated, or unverifiable
   - Keep the natural tone while optimizing for relevance

3. STRATEGIC MODIFICATIONS
   - Reorder bullet points to highlight the most relevant experience first
   - Incorporate job keywords naturally where they genuinely apply
   - Emphasize transferable skills that align with the role requirements
   - Use action verbs and quantifiable metrics from the ORIGINAL resume only

4. VERIFICATION STANDARDS (NON-NEGOTIABLE)
   - NEVER invent metrics, titles, tools, timelines, or scope
   - Only include skills, experiences, and achievements present in the master resume
   - Every claim must be testable and defensible in an interview
   - If a required skill is missing, note it—do NOT fabricate it

Return your response as a JSON object with this exact structure:
{{
  "tailored_resume": "The complete tailored resume in PLAIN TEXT format, ready to use",
  "tailored_resume_latex": "The complete tailored resume in LaTeX format, compilable and ready for Overleaf",
  "changes_made": [
    {{
      "change": "Description of the specific change",
      "rationale": "Why this change improves job alignment"
    }}
  ],
  "keywords_matched": ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["missing1", "missing2"],
  "keyword_variants_used": ["original term → job posting term"],
  "clarifying_questions": ["Question about potential experience not clearly stated in resume"]
}}

OUTPUT REQUIREMENTS:
- "tailored_resume": Full resume in PLAIN TEXT format, preserving structure with simple formatting
- "tailored_resume_latex": Full resume in LaTeX format with proper document structure (\\documentclass, \\begin{{document}}, sections, etc.)
  * Use clean, professional LaTeX syntax
  * Include proper commands: \\section{{}}, \\textbf{{}}, \\textit{{}}, \\item, etc.
  * Make it compilable and ready for Overleaf
  * If input was plain text, generate appropriate LaTeX structure
  * If input was LaTeX, preserve and enhance the structure
- "changes_made": 3-5 specific changes with rationale for each
- "keywords_matched": Top 5-10 job keywords successfully incorporated
- "keywords_missing": Important keywords the candidate genuinely lacks (be honest)
- "keyword_variants_used": Any terminology translations applied (e.g., "Software Developer → Software Engineer")
- "clarifying_questions": 1-3 questions about experiences that could strengthen the resume if clarified
- Ensure valid JSON format with properly escaped LaTeX backslashes (use \\\\ for \\)
"""

    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash-lite')

        # Generate content with JSON response
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.4,  
                "top_p": 0.9,        
                "top_k": 20,         
                "max_output_tokens": 4096,  
                "response_mime_type": "application/json",
            }
        )

        # Parse JSON response
        result = json.loads(response.text)

        return result

    except json.JSONDecodeError as e:
        # Fallback if JSON parsing fails
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}")

    except Exception as e:
        # Handle other errors
        raise Exception(f"Error calling Gemini API: {str(e)}")
