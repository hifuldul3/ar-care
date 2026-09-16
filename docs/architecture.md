# AR-CARE LINK Architecture Overview

AR-CARE LINK is a full-stack, AI-assisted remote healthcare decision-support and AR guidance platform.

## System Topology

```
+------------------------+                +------------------------+
|    FRONTLINE WORKER    |                |       SPECIALIST       |
|    Browser / PWA       |                |     Browser / Studio   |
+-----------+------------+                +-----------+------------+
            |                                         |
            | HTTP / REST API & WebSockets           |
            v                                         v
+------------------------------------------------------------------+
|                       FASTAPI BACKEND                            |
|                                                                  |
|  +--------------------+   +-------------------+   +------------+ |
|  | Auth & Security    |   | AI Decision Engine|   | WebSocket  | |
|  | JWT / bcrypt       |   | Explainable Rules |   | Manager    | |
|  +--------------------+   +-------------------+   +------------+ |
+-----------------------------------+------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
            v                                               v
+-----------------------+                       +-----------------------+
|  Firebase Firestore   |                       |    ReportLab Service  |
|  / Local DB Store     |                       |    PDF Generator      |
+-----------------------+                       +-----------------------+
```

## Key Components

1. **Role Routing**: Single SPA serving Worker (`/worker/dashboard`) and Specialist (`/specialist/dashboard`) based on JWT role claims.
2. **WebSocket Signaling**: Persistent bidirectional WebSocket connection (`/ws/session/{session_id}`) for AR coordinates, instructions, acknowledgements, and WebRTC signaling.
3. **WebRTC PeerConnection**: Low-latency camera stream sharing with fallback DEMO PREVIEW.
4. **Offline Queue & Auto-Sync**: Service Worker shell cache + IndexedDB queue (`syncQueue.js`) automatically syncing offline operations to FastAPI backend upon reconnection.
