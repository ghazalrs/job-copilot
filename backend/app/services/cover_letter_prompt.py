def get_cover_letter_prompt(job_description: str, master_resume: str, company_name: str = "", job_title: str = "") -> str:
    return f"""You are an expert cover letter writer. Your task is to write a compelling, personalized cover letter for a specific job posting based on the candidate's resume.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:
{master_resume}

COMPANY NAME: {company_name if company_name else "the company"}
JOB TITLE: {job_title if job_title else "the position"}

COVER LETTER GUIDELINES:

1. STRUCTURE (3-4 paragraphs):
   - Opening: Hook the reader, express enthusiasm for the specific role and company
   - Body (1-2 paragraphs): Highlight 2-3 most relevant achievements from the resume that match the job requirements
   - Closing: Reiterate interest, include a call to action

2. TONE & STYLE:
   - Professional but personable
   - Confident without being arrogant
   - Specific and concrete (use numbers/metrics from resume)
   - Avoid generic phrases like "I am a hard worker" or "team player"

3. PERSONALIZATION:
   - Reference the SPECIFIC company name and role
   - Connect candidate's experience to the job's KEY requirements
   - Show you understand the company's needs

4. LENGTH:
   - 250-350 words (about 3/4 of a page)
   - Keep paragraphs concise (3-5 sentences each)

5. VERIFICATION (NON-NEGOTIABLE):
   - ONLY use experiences, skills, and achievements from the resume
   - NEVER invent accomplishments or metrics
   - Every claim must be traceable to the resume

Return your response as a JSON object with this EXACT structure:
{{
  "cover_letter": "The complete cover letter in plain text format",
  "cover_letter_latex": "The cover letter formatted in LaTeX (using a professional letter template)",
  "key_points_highlighted": [
    "Experience or skill #1 you emphasized",
    "Experience or skill #2 you emphasized",
    "Experience or skill #3 you emphasized"
  ],
  "customization_notes": [
    "How you customized this letter for this specific role"
  ]
}}

LATEX FORMAT REQUIREMENTS:
- Use the letter document class
- Include proper formatting with date, recipient address placeholder, salutation
- Use professional spacing and margins
- The LaTeX should compile without errors

EXAMPLE LATEX STRUCTURE:
\\documentclass[11pt]{{letter}}
\\usepackage[margin=1in]{{geometry}}
\\usepackage{{hyperref}}

\\signature{{[Candidate Name]}}
\\address{{[Your Address]}}

\\begin{{document}}
\\begin{{letter}}{{Hiring Manager \\\\ [Company Name]}}
\\opening{{Dear Hiring Manager,}}

[Body paragraphs here]

\\closing{{Sincerely,}}
\\end{{letter}}
\\end{{document}}

OUTPUT REQUIREMENTS:
- "cover_letter": Plain text version, well-formatted with proper paragraphs
- "cover_letter_latex": Complete LaTeX document that compiles correctly
- "key_points_highlighted": 2-4 specific experiences/skills you emphasized
- "customization_notes": 1-2 notes on how you personalized for this role
"""