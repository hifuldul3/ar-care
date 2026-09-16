# Shared AR Marker Coordinate Mapping Algorithm

AR-CARE LINK allows remote specialists to place visual annotations on a frontline worker's live camera view.

## Relative Coordinate Calculation

To maintain viewport independence across varying screen resolutions (desktop monitor vs mobile phone):

```javascript
xPercent = (clickX / containerWidth) * 100
yPercent = (clickY / containerHeight) * 100
```

1. **Specialist Selection**: Specialist clicks on camera canvas -> `ARManager.calculateRelativeCoordinates(event, container)` calculates `(x%, y%)`.
2. **WebSocket Dispatch**: Specialist submits instruction -> `AR_MARKER` payload dispatched over WebSocket.
3. **Worker Render**: Worker frontend renders animated pulsing pin positioned dynamically via CSS `top: y%`, `left: x%`.
4. **State Machine Transitions**:
   - `PENDING` -> Worker clicks `[ACKNOWLEDGE]` -> Status updates to `ACKNOWLEDGED`.
   - `ACKNOWLEDGED` -> Worker clicks `[MARK COMPLETED]` -> Status updates to `COMPLETED`.
   - Specialist UI receives WebSocket state update and updates badge to `✓ COMPLETED`.
