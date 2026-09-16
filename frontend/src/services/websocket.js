import { WS_BASE_URL } from '../utils/constants';

export class SessionWebSocket {
  constructor(sessionId, token, userId, role, onMessage, onStateChange) {
    this.sessionId = sessionId;
    this.token = token;
    this.userId = userId;
    this.role = role;
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;

    this.ws = null;
    this.pingInterval = null;
    this.reconnectTimer = null;
    this.isClosed = false;
  }

  connect() {
    if (this.isClosed) return;

    const url = `${WS_BASE_URL}/ws/session/${this.sessionId}?token=${encodeURIComponent(this.token || '')}&role=${this.role}&user_id=${this.userId}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      if (this.onStateChange) this.onStateChange('CONNECTED');
      this.startPing();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'PONG') return;
        if (this.onMessage) this.onMessage(data);
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    this.ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      if (this.onStateChange) this.onStateChange('ERROR');
    };

    this.ws.onclose = () => {
      this.stopPing();
      if (this.onStateChange) this.onStateChange('DISCONNECTED');
      if (!this.isClosed) {
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      }
    };
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  }

  startPing() {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      this.send({ type: 'PING' });
    }, 15000);
  }

  stopPing() {
    if (this.pingInterval) clearInterval(this.pingInterval);
  }

  disconnect() {
    this.isClosed = true;
    this.stopPing();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}
