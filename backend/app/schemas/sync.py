from pydantic import BaseModel
from typing import Dict, Any, List

class SyncItem(BaseModel):
    id: str
    type: str  # "CASE", "VITALS", "NOTE", "ANNOTATION"
    payload: Dict[str, Any]

class SyncBatchRequest(BaseModel):
    items: List[SyncItem]

class SyncBatchResponse(BaseModel):
    syncedIds: List[str]
    errors: List[Dict[str, Any]]
