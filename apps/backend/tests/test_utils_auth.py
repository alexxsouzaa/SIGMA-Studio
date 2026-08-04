from app.utils.auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_hash_and_verify_password():
    hashed = hash_password("minha-senha-segura")
    assert hashed != "minha-senha-segura"
    assert verify_password("minha-senha-segura", hashed) is True


def test_verify_password_wrong_plain():
    hashed = hash_password("correta")
    assert verify_password("errada", hashed) is False


def test_hash_is_salted():
    first = hash_password("mesma-senha")
    second = hash_password("mesma-senha")
    assert first != second
    assert verify_password("mesma-senha", first) is True
    assert verify_password("mesma-senha", second) is True


def test_create_and_decode_access_token():
    token = create_access_token("user-123")
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_create_and_decode_refresh_token():
    token = create_refresh_token("user-123")
    payload = decode_token(token)
    assert payload is not None
    assert payload["type"] == "refresh"


def test_decode_invalid_token_returns_none():
    assert decode_token("token-invalido") is None
