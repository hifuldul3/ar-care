# AR-CARE LINK API Documentation

## Base URL
- Local Backend: `http://localhost:8000`
- Interactive Swagger: `http://localhost:8000/docs`

## Endpoints Summary

### Authentication
- `POST /auth/login`: Authenticate worker or specialist user. Returns JWT access token.
- `GET /auth/me`: Retrieve current user profile.

### Cases & Vitals
- `POST /cases`: Create new clinical case record.
- `GET /cases`: List all cases.
- `GET /cases/{case_id}`: Get specific case details.
- `PUT /cases/{case_id}`: Update case record.
- `POST /cases/{case_id}/vitals`: Update baseline vitals and recalculate AI priority.
- `POST /cases/{case_id}/specialist-request`: Request remote specialist review.
- `GET /cases/{case_id}/timeline`: Get audit action timeline.

### AI Decision Support
- `POST /cases/{case_id}/analyze`: Run rule-based clinical evaluation.

### Live Sessions & Shared AR
- `POST /sessions`: Create or join live session.
- `GET /sessions/{session_id}`: Get session state.
- `POST /sessions/{session_id}/instructions`: Send text instruction.
- `POST /annotations`: Create new AR marker annotation.
- `PUT /annotations/{annotation_id}/acknowledge`: Worker acknowledges AR marker.
- `PUT /annotations/{annotation_id}/complete`: Worker marks AR marker complete.

### Offline Sync & PDF Reports
- `POST /sync`: Batch process offline queued items.
- `POST /reports/cases/{case_id}/report`: Generate PDF case report.
- `GET /reports/download/{filename}`: Download generated PDF.
