# Offline Queue & Automatic Synchronization Architecture

AR-CARE LINK is built offline-first for frontline workers in low-connectivity remote environments.

## IndexedDB Storage Schema

Object Store: `sync_queue`
Key Path: `id`

```json
{
  "id": "SYNC-1740000000-a1b2",
  "type": "CASE",
  "payload": {
    "caseId": "P001",
    "patient": { "name": "Demo Patient", "age": 52 },
    "symptoms": "Breathing difficulty",
    "vitals": { "spO2": 89, "heartRate": 108 }
  },
  "status": "PENDING",
  "createdAt": "2026-09-15T22:00:00Z"
}
```

## Auto-Sync Pipeline

1. **Network Interruption**: `navigator.onLine` evaluates `false`.
2. **Offline Queuing**: Created cases, vitals updates, or offline notes are saved to IndexedDB via `addOfflineItem()`.
3. **Reconnection Event**: `window.addEventListener('online')` triggers `synchronizeQueue()`.
4. **Batch Transmission**: Frontline client sends batch array to `POST /sync`.
5. **Backend Verification**: FastAPI validates records, updates database store, logs action events, and returns `syncedIds`.
6. **Local Queue Flush**: Successfully synced items are removed from IndexedDB queue and UI displays `🟢 CONNECTION RESTORED - Synchronized`.
