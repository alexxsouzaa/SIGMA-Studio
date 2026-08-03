from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.repositories.ai_model_repository import AIModelRepository
from app.services.ai_model_service import AIModelService
from app.services.auth_service import get_current_user
from app.schemas.ai_model import AIModelCreate, AIModelUpdate, AIModelResponse
from app.schemas.common import StandardResponse
from app.models.user import User

router = APIRouter()


def get_ai_service(session: AsyncSession = Depends(get_session)) -> AIModelService:
    repository = AIModelRepository(session)
    return AIModelService(repository)


@router.get("/")
async def list_models(
    skip: int = 0,
    limit: int = 100,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    models, total = await service.list_models(skip=skip, limit=limit)
    return StandardResponse(
        data=[AIModelResponse.model_validate(m) for m in models],
        message="Models retrieved successfully",
    )


@router.get("/{model_id}")
async def get_model(
    model_id: int,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    model = await service.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return StandardResponse(
        data=AIModelResponse.model_validate(model),
        message="Model retrieved successfully",
    )


@router.post("/", status_code=201)
async def create_model(
    data: AIModelCreate,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    model = await service.create_model(data)
    return StandardResponse(
        data=AIModelResponse.model_validate(model),
        message="Model created successfully",
    )


@router.put("/{model_id}")
async def update_model(
    model_id: int,
    data: AIModelUpdate,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    model = await service.update_model(model_id, data)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return StandardResponse(
        data=AIModelResponse.model_validate(model),
        message="Model updated successfully",
    )


@router.post("/{model_id}/deploy")
async def deploy_model(
    model_id: int,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    model = await service.get_model(model_id)
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    await service.update_model(model_id, AIModelUpdate(status="deployed"))
    return StandardResponse(
        data=AIModelResponse.model_validate(model),
        message="Model deployed successfully",
    )


@router.delete("/{model_id}")
async def delete_model(
    model_id: int,
    service: AIModelService = Depends(get_ai_service),
    _user: User = Depends(get_current_user),
):
    deleted = await service.delete_model(model_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Model not found")
    return StandardResponse(message="Model deleted successfully")
