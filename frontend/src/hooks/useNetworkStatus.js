import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState('ONLINE'); // "ONLINE", "LIMITED", "OFFLINE"

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionQuality('ONLINE');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionQuality('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Network Information API if supported
    if (navigator.connection) {
      const updateConnectionStatus = () => {
        const type = navigator.connection.effectiveType;
        if (!navigator.onLine) {
          setConnectionQuality('OFFLINE');
        } else if (type === 'slow-2g' || type === '2g' || navigator.connection.rtt > 600) {
          setConnectionQuality('LIMITED');
        } else {
          setConnectionQuality('ONLINE');
        }
      };
      navigator.connection.addEventListener('change', updateConnectionStatus);
      updateConnectionStatus();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, connectionQuality };
}
