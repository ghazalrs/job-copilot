from pydantic import BaseModel
from datetime import datetime


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
