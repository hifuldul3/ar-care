import logging
import json
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("arcare.websocket")

class ConnectionManager:
    def __init__(self):
        # Maps session_id -> List[WebSocket]
        self.active_sessions: Dict[str, List[WebSocket]] = {}
        # Maps WebSocket -> dict metadata (user_id, role, session_id)
        self.connection_meta: Dict[WebSocket, dict] = {}

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str, role: str):
        await websocket.accept()
        if session_id not in self.active_sessions:
            self.active_sessions[session_id] = []
        self.active_sessions[session_id].append(websocket)
        self.connection_meta[websocket] = {
            "session_id": session_id,
            "user_id": user_id,
            "role": role
        }
        logger.info(f"WebSocket connected: User {user_id} ({role}) joined session {session_id}")

        # Broadcast SESSION_JOINED to existing session members
        await self.broadcast(session_id, {
            "type": "SESSION_JOINED",
            "sessionId": session_id,
            "userId": user_id,
            "role": role,
            "participantCount": len(self.active_sessions[session_id])
        })

    def disconnect(self, websocket: WebSocket):
        meta = self.connection_meta.get(websocket)
        if meta:
            session_id = meta["session_id"]
            user_id = meta["user_id"]
            role = meta["role"]

            if session_id in self.active_sessions:
                if websocket in self.active_sessions[session_id]:
                    self.active_sessions[session_id].remove(websocket)
                if not self.active_sessions[session_id]:
                    del self.active_sessions[session_id]

            del self.connection_meta[websocket]
            logger.info(f"WebSocket disconnected: User {user_id} ({role}) left session {session_id}")
            return session_id, user_id, role
        return None, None, None

    async def broadcast(self, session_id: str, message: dict, sender_socket: WebSocket = None):
        if session_id in self.active_sessions:
            message_text = json.dumps(message)
            for connection in self.active_sessions[session_id]:
                try:
                    await connection.send_text(message_text)
                except Exception as e:
                    logger.error(f"Error broadcasting message to connection in session {session_id}: {e}")

ws_manager = ConnectionManager()
