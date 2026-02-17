from datetime import datetime, timedelta
from jose import jwt, JWTError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import requests
from sqlalchemy.orm import Session
from app.config import settings
from app.models.user import User

# JWT Configuration
ALGORITHM = "HS256"


def create_jwt(user_id: int, email: str) -> str:
    
    expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRATION_MINUTES)

    payload = {
        "user_id": user_id,
        "email": email,
        "exp": expire,
    }

    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)
    return token


def decode_jwt(token: str) -> dict | None:
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_google_token(token: str) -> dict | None:

    try:
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        return idinfo
    except ValueError:
        # Invalid token
        return None


def verify_google_access_token(access_token: str) -> dict | None:
    """
    Verify Google OAuth access token (from Chrome Identity API)
    """
    try:
        # Call Google's tokeninfo endpoint
        response = requests.get(
            f'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token={access_token}'
        )

        if response.status_code != 200:
            return None

        token_info = response.json()

        # Verify audience (client ID)
        if token_info.get('aud') != settings.GOOGLE_CLIENT_ID:
            return None

        # Extract user info
        return {
            'sub': token_info.get('sub'),
            'email': token_info.get('email'),
            'name': token_info.get('name'),
        }
    except Exception:
        return None


def get_or_create_user(db: Session, google_info: dict) -> User:
    
    # Try to find existing user
    user = db.query(User).filter(User.google_sub == google_info["sub"]).first()

    if user:
        # Update user info in case it changed
        user.email = google_info.get("email", user.email)
        user.name = google_info.get("name", user.name)
        db.commit()
        return user

    # Create new user
    user = User(
        google_sub=google_info["sub"],
        email=google_info["email"],
        name=google_info.get("name"),
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # Get the auto-generated ID

    return user
