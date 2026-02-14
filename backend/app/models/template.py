from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Template(Base):
    
    __tablename__ = "templates"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to users table
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Type of template: either "resume" or "cover_letter"
    template_type = Column(String, nullable=False)

    # The template content (LaTeX, markdown, or plain text)
    content = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="templates")
