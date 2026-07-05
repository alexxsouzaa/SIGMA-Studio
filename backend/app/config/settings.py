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

    model_config = {"env_prefix": "SIGMA_", "env_file": ".env"}


settings = Settings()
