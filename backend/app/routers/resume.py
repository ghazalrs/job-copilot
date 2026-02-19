from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Resume, User
from app.schemas.resume import ResumeCreate, ResumeResponse, TailorRequest, TailorResponse
from app.dependencies import get_current_user
from app.services import ai_service

router = APIRouter(prefix="/resume", tags=["resume"])


@router.get("/master", response_model=ResumeResponse)
def get_master_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found. Please upload your resume first."
        )

    return resume


@router.put("/master", response_model=ResumeResponse)
def create_or_update_master_resume(
    resume_data: ResumeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check if user already has a resume
    existing_resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()

    if existing_resume:
        # Update existing resume
        existing_resume.raw_text = resume_data.raw_text
        db.commit()
        db.refresh(existing_resume)
        return existing_resume
    else:
        # Create new resume
        new_resume = Resume(
            user_id=current_user.id,
            raw_text=resume_data.raw_text
        )
        db.add(new_resume)
        db.commit()
        db.refresh(new_resume)
        return new_resume


@router.delete("/master", status_code=status.HTTP_204_NO_CONTENT)
def delete_master_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    resume = db.query(Resume).filter(Resume.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume found to delete."
        )

    db.delete(resume)
    db.commit()

    return None


@router.post("/tailor", response_model=TailorResponse)
async def tailor_resume(
    request: TailorRequest,
    current_user: User = Depends(get_current_user)
):
    
    try:
        # Call the AI service to tailor the resume
        result = await ai_service.tailor_resume(
            job_description=request.job_description,
            master_resume=request.master_resume
        )

        return result

    except ValueError as e:
        # JSON parsing error from AI service
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service returned invalid response: {str(e)}"
        )

    except Exception as e:
        # General error (API failure, network issues, etc.)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to tailor resume: {str(e)}"
        )
