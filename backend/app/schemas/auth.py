from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):

    id_token: str  # The token from Google

class UserResponse(BaseModel):
     
    # User info returned to the frontend.
    id: int
    email: str
    name: str | None

    class Config:
        from_attributes = True  # Allows converting from SQLAlchemy model


class AuthResponse(BaseModel):

    token: str           # JWT token
    user: UserResponse   # User info
