from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SIGMA Studio"
    debug: bool = True
    database_url: str = "sqlite+aiosqlite:///./sigma_studio.db"
    cors_origins: list[str] = ["http://localhost:5173"]

    mqtt_broker: str = "localhost"
    mqtt_port: int = 1883
    mqtt_topic_prefix: str = "sigma"

    serial_port: str = ""
    serial_baudrate: int = 115200

    jwt_secret: str = "sigma-studio-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7

    model_config = {"env_prefix": "SIGMA_", "env_file": ".env"}


settings = Settings()
