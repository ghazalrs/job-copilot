import json
import google.generativeai as genai
from typing import Dict, Any, Optional
from app.config import settings
from app.services.default_templates import DEFAULT_RESUME_TEMPLATE


# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


async def tailor_resume(
    job_description: str,
    master_resume: str,
    latex_template: Optional[str] = None
) -> Dict[str, Any]:

    # Use default template if none provided
    template = latex_template or DEFAULT_RESUME_TEMPLATE

    # Use techniques from the ChatGPT Job Search Playbook
    prompt = f"""You are an expert resume strategist. Your task is to tailor a resume for a specific job posting while preserving the candidate's authentic voice and ensuring all claims remain verifiable.

JOB DESCRIPTION:
{job_description}

MASTER RESUME:
{master_resume}

LATEX TEMPLATE (use this exact structure and formatting for the LaTeX output):
{template}

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

CRITICAL JSON ESCAPING RULES (READ CAREFULLY):
In JSON strings, the backslash character is an escape character. To include a literal backslash in your JSON output, you MUST write TWO backslashes (\\\\).

Examples of CORRECT escaping for LaTeX in JSON:
- \\section{{Education}} becomes "\\\\section{{Education}}"
- \\textbf{{Name}} becomes "\\\\textbf{{Name}}"
- \\begin{{document}} becomes "\\\\begin{{document}}"
- \\end{{document}} becomes "\\\\end{{document}}"
- \\resumeItem{{text}} becomes "\\\\resumeItem{{text}}"
- \\href{{url}}{{text}} becomes "\\\\href{{url}}{{text}}"
- Texas A\\&M becomes "Texas A\\\\&M"

Every single backslash in LaTeX must be doubled in your JSON output!

OUTPUT REQUIREMENTS:
- "tailored_resume": Full resume in PLAIN TEXT format, preserving structure with simple formatting
- "tailored_resume_latex": Full resume in LaTeX format using the PROVIDED TEMPLATE
  * Use the exact LaTeX template structure provided above
  * Replace the sample content with the user's tailored resume content
  * Keep all \\\\documentclass, \\\\usepackage, custom commands
  * DOUBLE ALL BACKSLASHES for valid JSON
- "changes_made": 3-5 specific changes with rationale for each
- "keywords_matched": Top 5-10 job keywords successfully incorporated
- "keywords_missing": Important keywords the candidate genuinely lacks
- "keyword_variants_used": Any terminology translations applied
- "clarifying_questions": 1-3 questions about experiences that could strengthen the resume
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
                "max_output_tokens": 8192,
                "response_mime_type": "application/json",
            }
        )

        # Parse JSON response
        result = json.loads(response.text)

        return result

    except json.JSONDecodeError as e:
        # Log the error for debugging
        print(f"JSON Parse Error: {str(e)}")
        print(f"Response preview: {response.text[:500]}...")
        # Fallback if JSON parsing fails
        raise ValueError(f"Failed to parse AI response as JSON: {str(e)}. The AI may not have properly escaped LaTeX backslashes.")

    except Exception as e:
        # Handle other errors
        raise Exception(f"Error calling Gemini API: {str(e)}")
