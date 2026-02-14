from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):

    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Google's unique identifier for this user
    google_sub = Column(String, unique=True, index=True, nullable=False)

    # User's email address from Google
    email = Column(String, unique=True, index=True, nullable=False)

    # Display name from Google profile
    name = Column(String, nullable=True)

    # Profile picture URL from Google
    avatar_url = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # One user has one resume (one-to-one relationship)
    resume = relationship("Resume", back_populates="user", uselist=False)

    # One user can have multiple templates (one-to-many relationship)
    templates = relationship("Template", back_populates="user")
