import pytest

import app.config.settings as settings_mod

_STRONG_JWT = "a" * 32
_STRONG_PASSWORD = "b" * 10


def _restore():
    settings_mod.settings.jwt_secret = _STRONG_JWT
    settings_mod.settings.admin_password = _STRONG_PASSWORD


@pytest.fixture(autouse=True)
def _backup_values():
    old_jwt = settings_mod.settings.jwt_secret
    old_admin = settings_mod.settings.admin_password
    yield
    settings_mod.settings.jwt_secret = old_jwt
    settings_mod.settings.admin_password = old_admin


def test_valid_settings_pass():
    settings_mod.settings.jwt_secret = _STRONG_JWT
    settings_mod.settings.admin_password = _STRONG_PASSWORD
    settings_mod._validate_settings()


def test_missing_jwt_secret_fails():
    settings_mod.settings.jwt_secret = ""
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_legacy_public_jwt_secret_fails():
    settings_mod.settings.jwt_secret = "sigma-studio-secret-key-change-in-production"
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_short_jwt_secret_fails():
    settings_mod.settings.jwt_secret = "x" * 10
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_jwt_secret_with_invalid_chars_fails():
    settings_mod.settings.jwt_secret = "x" * 31 + "/"
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_missing_admin_password_fails():
    settings_mod.settings.jwt_secret = _STRONG_JWT
    settings_mod.settings.admin_password = ""
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_legacy_admin_password_fails():
    settings_mod.settings.jwt_secret = _STRONG_JWT
    settings_mod.settings.admin_password = "admin123"
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()


def test_short_admin_password_fails():
    settings_mod.settings.jwt_secret = _STRONG_JWT
    settings_mod.settings.admin_password = "short123"
    with pytest.raises(RuntimeError):
        settings_mod._validate_settings()
