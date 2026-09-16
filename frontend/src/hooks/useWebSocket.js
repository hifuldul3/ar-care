import { useState, useEffect, useRef, useCallback } from 'react';
import { SessionWebSocket } from '../services/websocket';

export function useWebSocket(sessionId, token, userId, role, onMessageReceived) {
  const [connectionState, setConnectionState] = useState('DISCONNECTED'); // "CONNECTING", "CONNECTED", "DISCONNECTED", "ERROR"
  const wsRef = useRef(null);

  const handleMessage = useCallback((data) => {
    if (onMessageReceived) {
      onMessageReceived(data);
    }
  }, [onMessageReceived]);

  const handleStateChange = useCallback((state) => {
    setConnectionState(state);
  }, []);

  useEffect(() => {
    if (!sessionId || !userId) return;

    setConnectionState('CONNECTING');
    const wsInstance = new SessionWebSocket(
      sessionId,
      token,
      userId,
      role,
      handleMessage,
      handleStateChange
    );
    wsRef.current = wsInstance;
    wsInstance.connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
      }
    };
  }, [sessionId, token, userId, role, handleMessage, handleStateChange]);

  const sendMessage = useCallback((data) => {
    if (wsRef.current) {
      return wsRef.current.send(data);
    }
    return false;
  }, []);

  return { connectionState, sendMessage };
}
