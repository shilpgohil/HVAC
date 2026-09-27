from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "HVAC Digital Twin & Supervisory Control Platform"
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    
    DATABASE_URL: str = "sqlite+aiosqlite:///./hvac_twin.db"
    
    MQTT_BROKER_HOST: str = "broker.emqx.io"
    MQTT_BROKER_PORT: int = 1883
    MQTT_USERNAME: str = ""
    MQTT_PASSWORD: str = ""
    MQTT_TOPIC_PREFIX: str = "hvac/facility_a12/"
    
    SIMULATOR_TICK_RATE_HZ: float = 1.0
    SIMULATOR_DEFAULT_SCENARIO: int = 1
    COMMAND_TIMEOUT_SECONDS: int = 15
    STALE_DATA_THRESHOLD_SECONDS: int = 30
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()
