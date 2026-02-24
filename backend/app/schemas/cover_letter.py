from pydantic import BaseModel
from typing import List


class CoverLetterRequest(BaseModel):
    job_description: str
    master_resume: str
    company_name: str = ""
    job_title: str = ""


class CoverLetterResponse(BaseModel):
    cover_letter: str
    cover_letter_latex: str
    key_points_highlighted: List[str]
    customization_notes: List[str]
