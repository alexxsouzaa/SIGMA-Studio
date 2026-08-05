import logging

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

_DEFAULT_JWT_SECRET = "sigma-studio-secret-key-change-in-production"
_DEFAULT_ADMIN_PASSWORD = "admin123"


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

    jwt_secret: str = _DEFAULT_JWT_SECRET
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7

    admin_password: str = _DEFAULT_ADMIN_PASSWORD

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    google_scope: str = "openid email profile"
    frontend_base_path: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_prefix": "SIGMA_", "env_file": ".env"}


settings = Settings()


def _validate_settings() -> None:
    if settings.debug:
        if settings.jwt_secret == _DEFAULT_JWT_SECRET:
            logger.warning(
                "SIGMA_JWT_SECRET em uso com valor padrao de desenvolvimento. "
                "Defina um valor forte em .env antes de publicar."
            )
        if settings.admin_password == _DEFAULT_ADMIN_PASSWORD:
            logger.warning(
                "SIGMA_ADMIN_PASSWORD em uso com valor padrao de desenvolvimento. "
                "Defina uma senha forte em .env antes de publicar."
            )
    else:
        if settings.jwt_secret == _DEFAULT_JWT_SECRET:
            raise RuntimeError(
                "SIGMA_JWT_SECRET nao configurado. Defina um valor forte em .env "
                "para executar sem SIGMA_DEBUG."
            )
        if settings.admin_password == _DEFAULT_ADMIN_PASSWORD:
            raise RuntimeError(
                "SIGMA_ADMIN_PASSWORD nao configurado. Defina uma senha forte em .env "
                "para executar sem SIGMA_DEBUG."
            )


_validate_settings()
