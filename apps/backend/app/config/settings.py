import logging
import re

from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

_LEGACY_DEFAULT_JWT_SECRET = "sigma-studio-secret-key-change-in-production"
_LEGACY_DEFAULT_ADMIN_PASSWORD = "admin123"
_MIN_SECRET_LENGTH = 32


class Settings(BaseSettings):
    app_name: str = "SIGMA Studio"
    debug: bool = False
    database_url: str = "sqlite+aiosqlite:///./sigma_studio.db"
    cors_origins: list[str] = ["http://localhost:5173"]

    mqtt_broker: str = "localhost"
    mqtt_port: int = 1883
    mqtt_topic_prefix: str = "sigma"

    serial_port: str = ""
    serial_baudrate: int = 115200

    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    jwt_refresh_expire_days: int = 7

    admin_password: str = ""

    cookie_secure: bool = False

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    google_scope: str = "openid email profile"
    frontend_base_path: str = ""
    frontend_url: str = "http://localhost:5173"

    model_config = {"env_prefix": "SIGMA_", "env_file": ".env"}


settings = Settings()


def _validate_settings() -> None:
    """Fail-fast: never boot with missing or publicly-known secrets."""

    def _fail(env_name: str) -> None:
        raise RuntimeError(
            f"{env_name} nao configurado. Defina um valor forte e unico em .env "
            "antes de executar o servidor."
        )

    if not settings.jwt_secret:
        _fail("SIGMA_JWT_SECRET")
    if settings.jwt_secret == _LEGACY_DEFAULT_JWT_SECRET:
        raise RuntimeError(
            "SIGMA_JWT_SECRET ainda usa o valor padrao publico do codigo. "
            "Gere um novo com: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )
    if len(settings.jwt_secret) < _MIN_SECRET_LENGTH:
        raise RuntimeError(
            f"SIGMA_JWT_SECRET muito curto (minimo {_MIN_SECRET_LENGTH} caracteres)."
        )
    if not re.fullmatch(r"[A-Za-z0-9\-_.]+", settings.jwt_secret):
        raise RuntimeError(
            "SIGMA_JWT_SECRET contem caracteres invalidos. Use apenas "
            "A-Z a-z 0-9 - _ . (ex.: secrets.token_urlsafe)."
        )

    if not settings.admin_password:
        _fail("SIGMA_ADMIN_PASSWORD")
    if settings.admin_password == _LEGACY_DEFAULT_ADMIN_PASSWORD:
        raise RuntimeError(
            "SIGMA_ADMIN_PASSWORD ainda usa o valor padrao publico do codigo. "
            "Defina uma senha forte em .env."
        )
    if len(settings.admin_password) < 10:
        raise RuntimeError(
            "SIGMA_ADMIN_PASSWORD muito curta (minimo 10 caracteres)."
        )


_validate_settings()
