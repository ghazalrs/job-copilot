from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal


class TemplateBase(BaseModel):
    
    template_type: Literal["resume", "cover_letter"] 
    content: str 


class TemplateCreate(TemplateBase):

    # This is what the frontend sends.
    pass


class TemplateResponse(TemplateBase):
    
    # Schema for returning template data to the frontend.
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  
