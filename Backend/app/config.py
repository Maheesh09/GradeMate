from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASS: str = "password"
    DB_NAME: str = "hackathon_db"

    class Config:
        env_file = ".env"

settings = Settings()
