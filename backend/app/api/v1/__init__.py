from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.investigations import router as investigations_router
from app.api.v1.sources import router as sources_router
from app.api.v1.intelligence import router as intelligence_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.reports import router as reports_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(investigations_router)
api_v1_router.include_router(sources_router)
api_v1_router.include_router(intelligence_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(reports_router)
api_v1_router.include_router(admin_router)
