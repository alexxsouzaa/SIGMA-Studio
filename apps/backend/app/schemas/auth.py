from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.organization import OrganizationResponse


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=128)


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(default="", max_length=100)


class UpdateProfileRequest(BaseModel):
    display_name: str | None = Field(None, max_length=100)
    email: str | None = Field(None, min_length=5, max_length=255)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=6, max_length=128)


class PreferencesRequest(BaseModel):
    preferences: dict = Field(default_factory=dict)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    uuid: str
    username: str
    email: str
    display_name: str | None
    role_id: int | None
    role_name: str | None = None
    permissions: list[str] = []
    current_organization_id: int | None
    active: bool
    avatar_url: str | None = None
    google_id: str | None = None
    last_login: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
    organizations: list[OrganizationResponse]
