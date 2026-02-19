from pydantic import BaseModel
from datetime import datetime
from typing import List


class ResumeBase(BaseModel):

    raw_text: str


class ResumeCreate(ResumeBase):

    # This is what the frontend sends.
    pass


class ResumeResponse(ResumeBase):

    # Schema for returning resume data to the frontend.
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Tailor Resume Schemas

class TailorRequest(BaseModel):
    job_description: str
    master_resume: str


class ChangeDetail(BaseModel):
    change: str
    rationale: str


class TailorResponse(BaseModel):
    tailored_resume: str  # Plain text version (for preview)
    tailored_resume_latex: str  # LaTeX version (for Overleaf)
    changes_made: List[ChangeDetail]
    keywords_matched: List[str]
    keywords_missing: List[str]
    keyword_variants_used: List[str]
    clarifying_questions: List[str]  
