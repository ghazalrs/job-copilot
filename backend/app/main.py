from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models import User, Resume, Template
from app.routers import auth
from app.routers import resume
from app.routers import template
from app.routers import cover_letter 


# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Job Copilot API",
    description="Backend API for the Job Copilot browser extension",
    version="0.1.0",
)


# List of origins that are allowed to make requests to the API
allowed_origins = [
    "http://localhost:5173",      
    "http://localhost:3000",      
    "chrome-extension://*",       
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(template.router)
app.include_router(cover_letter.router)


@app.get("/")
def read_root():

    return {
        "message": "Welcome to Job Copilot API",
        "status": "running",
        "version": "0.1.0"
    }

@app.get("/health")
def health_check():

    return {"status": "ok"}



