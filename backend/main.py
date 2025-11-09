"""
FastAPI application for Seekr - Simple Resume Management API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from contextlib import asynccontextmanager

from models.schemas import HealthCheckResponse
from routes import resumes, user_settings, chat
from db.database import create_tables

# Load environment variables from parent directory (shared .env)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown"""
    # Startup: Create database tables
    create_tables()
    yield
    # Shutdown: cleanup code here if needed


# Create FastAPI app
app = FastAPI(
    title="Seekr API",
    description="Simple Resume Management API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint - health check"""
    return HealthCheckResponse(
        status="ok",
        message="Seekr API is running"
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    return HealthCheckResponse(
        status="healthy",
        message="Service is operational"
    )


# Include routers
app.include_router(resumes.router)
app.include_router(user_settings.router)
app.include_router(chat.router)


if __name__ == "__main__":
    import uvicorn
    import sys

    # Require BACKEND_PORT from .env (no defaults)
    backend_port = os.getenv("BACKEND_PORT")
    if not backend_port:
        print("❌ Error: BACKEND_PORT environment variable is not set", file=sys.stderr)
        print("   Make sure the .env file exists and contains BACKEND_PORT", file=sys.stderr)
        sys.exit(1)

    # Require HOST from .env (no defaults)
    backend_host = os.getenv("BACKEND_HOST")
    if not backend_host:
        print("❌ Error: BACKEND_HOST environment variable is not set", file=sys.stderr)
        print("   Make sure the .env file contains HOST", file=sys.stderr)
        sys.exit(1)

    try:
        port = int(backend_port)
    except ValueError:
        print(f"❌ Error: BACKEND_PORT must be a valid integer, got: {backend_port}", file=sys.stderr)
        sys.exit(1)

    uvicorn.run("main:app", host=backend_host, port=port, reload=True)
