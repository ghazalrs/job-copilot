from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Resume(Base):
   
    __tablename__ = "resumes"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to users table - links this resume to a specific user
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # The actual resume content (plain text or markdown)
    raw_text = Column(Text, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resume")
