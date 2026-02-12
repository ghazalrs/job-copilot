from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

app = FastAPI(
    title="Job Copilot API",
    description="Backend API for the Job Copilot browser extension",
    version="0.1.0",
)


# List of origins that are allowed to make requests to the API
allowed_origins = [
    "http://localhost:5173",      # Vite dev server (web app)
    "http://localhost:3000",      # Alternative frontend port
    "chrome-extension://*",       # Chrome extensions
]

# Add CORS middleware 
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  
    allow_credentials=True,          
    allow_methods=["*"],             
    allow_headers=["*"],             
)


@app.get("/")
def read_root():
    """
    Root endpoint.
    """
    return {
        "message": "Welcome to Job Copilot API",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "ok"}


@app.get("/config-check")
def config_check():
    """
    Verify that configuration is loaded correctly.
    """
    return {
        "database_configured": bool(settings.DATABASE_URL),
        "jwt_expiration_minutes": settings.JWT_EXPIRATION_MINUTES,
        "google_oauth_configured": bool(settings.GOOGLE_CLIENT_ID),
    }


