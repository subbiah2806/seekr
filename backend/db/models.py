"""
SQLAlchemy database models
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Text, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime, timedelta

Base = declarative_base()


def calculate_ttl():
    """Calculate TTL as current time + 60 days"""
    return datetime.now() + timedelta(days=60)


class Resume(Base):
    """SQLAlchemy model for resumes table"""
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # Will be linked to users table in future
    resume_json = Column(JSON, nullable=False)
    ttl = Column(DateTime(timezone=True), default=calculate_ttl, onupdate=calculate_ttl, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint('name', name='uix_resume_name'),
    )

    def __repr__(self):
        return f"<Resume(id={self.id}, name={self.name})>"


class UserSettings(Base):
    """SQLAlchemy model for user_settings table"""
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    value = Column(Text, nullable=False)
    ttl = Column(DateTime(timezone=True), default=None, nullable=True)  # Always null - settings don't expire
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<UserSettings(id={self.id}, name={self.name})>"
