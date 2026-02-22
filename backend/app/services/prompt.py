def get_prompt(job_description: str, master_resume: str) -> str:
    return f"""You are an expert resume strategist. Your task is to tailor a resume for a specific job posting while preserving the candidate's authentic voice and ensuring all claims remain verifiable.

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

Return your response as a JSON object with this EXACT structure:
{{
  "tailored_resume": "The complete tailored resume in PLAIN TEXT format",
  "resume_data": {{
    "contact": {{
      "name": "Candidate's full name from the master resume",
      "phone": "Phone number or null",
      "email": "Email address or null",
      "linkedin": "linkedin.com/in/username (without https://) or null",
      "github": "github.com/username (without https://) or null"
    }},
    "education": [
      {{
        "school": "University Name",
        "location": "City, State/Province",
        "degree": "Degree name (e.g., Bachelor of Computer Engineering)",
        "dates": "Start -- End (e.g., Sep. 2024 -- Jun. 2028)"
      }}
    ],
    "experience": [
      {{
        "company": "Company Name (Department/Team if applicable)",
        "location": "City, State/Province",
        "title": "Job Title",
        "dates": "Start -- End (e.g., Sep. 2025 -- Present)",
        "bullets": [
          "First bullet point - most relevant to job",
          "Second bullet point",
          "Third bullet point",
          "Fourth bullet point (include 4-6 bullets per experience)"
        ]
      }}
    ],
    "projects": [
      {{
        "name": "Project Name",
        "technologies": "Tech1, Tech2, Tech3",
        "bullets": [
          "First bullet point about the project",
          "Second bullet point",
          "Third bullet point (include 3-4 bullets per project)"
        ]
      }}
    ],
    "skills": {{
      "languages": "Java, Python, JavaScript, TypeScript, etc.",
      "frameworks": "React, FastAPI, Flask, Node.js, etc.",
      "tools": "Git, Docker, AWS, etc."
    }}
  }},
  "changes_made": [
    {{
      "change": "Description of the specific change",
      "rationale": "Why this change improves job alignment"
    }}
  ],
  "keywords_matched": ["keyword1", "keyword2", "keyword3"],
  "keywords_missing": ["missing1", "missing2"],
  "keyword_variants_used": ["original term -> job posting term"],
  "clarifying_questions": ["Question about potential experience not clearly stated in resume"]
}}

CRITICAL REQUIREMENTS:
1. Extract the candidate's REAL name and contact info from the master resume - do NOT use placeholder names
2. Include ALL contact info available (phone, email, LinkedIn, GitHub)
3. Include 4-6 bullet points per experience entry
4. Include 3-4 bullet points per project
5. Include ALL relevant projects from the master resume (not just 1-2)
6. The resume should have enough content to fill one full page
7. Reorder experiences and bullet points to prioritize relevance to the job
8. Use the exact dates format: "Mon. YYYY -- Mon. YYYY" or "Mon. YYYY -- Present"
9. For LinkedIn/GitHub, provide just the path without https:// prefix

OUTPUT REQUIREMENTS:
- "tailored_resume": Full resume in PLAIN TEXT format, well-structured
- "resume_data": Structured data that will be used to generate LaTeX (follow the exact schema above)
- "changes_made": 3-5 specific changes with rationale for each
- "keywords_matched": Top 5-10 job keywords successfully incorporated
- "keywords_missing": Important keywords the candidate genuinely lacks
- "keyword_variants_used": Any terminology translations applied
- "clarifying_questions": 1-3 questions about experiences that could strengthen the resume
"""
