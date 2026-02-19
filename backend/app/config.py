from pydantic_settings import BaseSettings
from pydantic import Field

class Config(BaseSettings):
    google_api_key: str | None = Field(
        default=None,
        env="GOOGLE_API_KEY",
        description="The API key for the Google API",
    )

    mock_chat: bool = Field(env="MOCK_CHAT", 
        description="Whether to use a mock chat", default=False)

config = Config()
