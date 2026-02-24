from fastapi import APIRouter, Depends, HTTPException, status
from app.models import User
from app.schemas.cover_letter import CoverLetterRequest, CoverLetterResponse
from app.dependencies import get_current_user
from app.services import cover_letter_service

router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])


@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter(
    request: CoverLetterRequest,
    current_user: User = Depends(get_current_user)
):

    try:
        result = await cover_letter_service.generate_cover_letter(
            job_description=request.job_description,
            master_resume=request.master_resume,
            company_name=request.company_name,
            job_title=request.job_title
        )

        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service returned invalid response: {str(e)}"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate cover letter: {str(e)}"
        )
