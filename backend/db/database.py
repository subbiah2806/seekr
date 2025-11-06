"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from contextlib import contextmanager
from typing import Generator
import os
from dotenv import load_dotenv

from db.models import Base

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://localhost:5432/seekr")

# Create engine
# For SQLite (testing): use StaticPool and check_same_thread=False
# For PostgreSQL (production): remove these parameters
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)


def drop_tables():
    """Drop all database tables (use with caution!)"""
    Base.metadata.drop_all(bind=engine)


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """
    Context manager for database sessions

    Usage:
        with get_db() as db:
            # perform database operations
            result = db.query(Model).all()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db_dependency() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions

    Usage:
        @app.get("/items")
        def read_items(db: Session = Depends(get_db_dependency)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
