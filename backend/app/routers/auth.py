from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import GoogleAuthRequest, GoogleAccessTokenRequest, AuthResponse, UserResponse
from app.services.auth import verify_google_token, verify_google_access_token, get_or_create_user, create_jwt


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=AuthResponse)
def google_login(request: GoogleAuthRequest, db: Session = Depends(get_db)):

    google_info = verify_google_token(request.id_token)

    if not google_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    user = get_or_create_user(db, google_info)

    token = create_jwt(user.id, user.email)

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/google/access-token", response_model=AuthResponse)
def google_login_access_token(request: GoogleAccessTokenRequest, db: Session = Depends(get_db)):
    """
    Login with Google access token (from Chrome extension)
    """
    google_info = verify_google_access_token(request.access_token)

    if not google_info:
        raise HTTPException(status_code=401, detail="Invalid Google access token")

    user = get_or_create_user(db, google_info)

    token = create_jwt(user.id, user.email)

    return AuthResponse(
        token=token,
        user=UserResponse.model_validate(user)
    )
