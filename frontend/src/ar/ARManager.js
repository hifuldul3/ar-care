export class ARManager {
  static calculateRelativeCoordinates(event, containerElement) {
    if (!containerElement) return { x: 50, y: 50 };
    const rect = containerElement.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const xPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, (clickY / rect.height) * 100));

    return {
      x: Math.round(xPercent * 10) / 10,
      y: Math.round(yPercent * 10) / 10
    };
  }

  static formatAnnotation(caseId, sessionId, x, y, message, userId) {
    return {
      type: 'AR_MARKER',
      annotationId: `AR-${Date.now()}`,
      caseId,
      sessionId,
      x,
      y,
      message,
      createdBy: userId,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
  }
}
