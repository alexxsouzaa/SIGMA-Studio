import json

from fastapi import Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.models.role import Role
from app.models.user import User
from app.services.auth_service import get_current_user


async def require_admin(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if not user.role_id:
        raise HTTPException(status_code=403, detail="Admin access required")
    role = await session.get(Role, user.role_id)
    if not role:
        raise HTTPException(status_code=403, detail="Admin access required")
    if role.is_admin:
        return user
    perms = []
    if role.permissions:
        try:
            perms = json.loads(role.permissions)
        except (json.JSONDecodeError, TypeError):
            pass
    if "*" not in perms:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
