import logging
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import auth, cases, patients, vitals, ai, sessions, annotations, reports, sync, notifications
from app.websocket.manager import ws_manager
from app.websocket.events import handle_websocket_message
from app.auth.jwt import decode_access_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("arcare.main")

app = FastAPI(
    title=settings.APP_NAME,
    description="AR-CARE LINK - AI-assisted remote healthcare support & shared AR guidance platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(patients.router)
app.include_router(vitals.router)
app.include_router(ai.router)
app.include_router(sessions.router)
app.include_router(annotations.router)
app.include_router(reports.router)
app.include_router(sync.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "tagline": "Bringing specialist guidance to the frontline — through the worker's own view."
    }

# WebSocket Endpoint
@app.websocket("/ws/session/{session_id}")
async def session_websocket_endpoint(
    websocket: WebSocket,
    session_id: str,
    token: str = Query(default=""),
    role: str = Query(default="worker"),
    user_id: str = Query(default="W001")
):
    # Try token validation if present
    if token:
        payload = decode_access_token(token)
        if payload:
            user_id = payload.get("id", user_id)
            role = payload.get("role", role)

    await ws_manager.connect(websocket, session_id, user_id, role)

    try:
        while True:
            text_data = await websocket.receive_text()
            try:
                data = json.loads(text_data)
            except Exception:
                continue

            # Handle heartbeats
            if data.get("type") == "PING":
                await websocket.send_text(json.dumps({"type": "PONG"}))
                continue

            processed_msg = await handle_websocket_message(session_id, data, user_id, role)
            
            # Broadcast processed message to all participants in session
            await ws_manager.broadcast(session_id, processed_msg, sender_socket=websocket)

    except WebSocketDisconnect:
        s_id, u_id, r_role = ws_manager.disconnect(websocket)
        if s_id:
            await ws_manager.broadcast(s_id, {
                "type": "CONNECTION_STATUS",
                "status": "DISCONNECTED",
                "userId": u_id,
                "role": r_role
            })
