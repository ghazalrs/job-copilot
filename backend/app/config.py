from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    JWT_SECRET: str
    JWT_EXPIRATION_MINUTES: int

    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    GEMINI_API_KEY: str

    class Config:
        env_file = ".env"


settings = Settings()
