from fastapi import APIRouter, Depends
from app.schemas.sync import SyncBatchRequest, SyncBatchResponse
from app.auth.dependencies import get_current_user
from app.services.sync_service import SyncService

router = APIRouter(prefix="/sync", tags=["Offline Sync"])

@router.post("", response_model=SyncBatchResponse)
def process_sync(req: SyncBatchRequest, current_user: dict = Depends(get_current_user)):
    items = [item.model_dump() for item in req.items]
    res = SyncService.process_sync_batch(items, current_user["id"], current_user["role"])
    return res
