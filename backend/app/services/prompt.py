def get_prompt(job_description: str, master_resume: str) -> str:
    return f"""You are an expert resume strategist. Your task is to tailor a resume for a specific job posting while preserving the candidate's authentic voice and ensuring all claims remain verifiable.

JOB DESCRIPTION:
{job_description}

MASTER RESUME:
{master_resume}

TAILORING PROCESS:

1. KEYWORD EXTRACTION (Do this first!)
   - Identify the TOP 10 most important keywords/skills from the job description
   - Note the exact terminology used (e.g., "CI/CD", "agile", "microservices")
   - These keywords MUST appear in the tailored resume where truthfully applicable

2. AGGRESSIVE TAILORING (This is the main goal!)
   - REWRITE bullet points to prominently feature job-relevant keywords
   - REORDER experiences to put the most relevant ones first
   - REORDER bullet points within each experience - most relevant to job comes first
   - REPHRASE accomplishments using the job's terminology (e.g., if job says "scalable systems", use that phrase)
   - EMPHASIZE experiences that match the job requirements, even if they were minor in the original
   - DE-EMPHASIZE or shorten irrelevant experiences

3. WHAT TO CHANGE:
   - Bullet points should be REWRITTEN to highlight relevance to THIS specific job
   - Technical skills section should PRIORITIZE skills mentioned in the job description
   - Project descriptions should emphasize aspects relevant to the job
   - Use the SAME TERMINOLOGY as the job posting (not synonyms)

4. VERIFICATION STANDARDS (NON-NEGOTIABLE)
   - NEVER invent new experiences, metrics, or skills not in the master resume
   - You CAN rephrase and emphasize existing content differently
   - Every claim must be based on something in the master resume

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
