from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    """

    DATABASE_URL: str 

    JWT_SECRET: str 
    JWT_EXPIRATION_MINUTES: int

    GOOGLE_CLIENT_ID: str 
    GOOGLE_CLIENT_SECRET: str 

    class Config:
        env_file = ".env"


settings = Settings()
