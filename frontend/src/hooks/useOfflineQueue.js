import { useState, useEffect, useCallback } from 'react';
import { addOfflineItem, getOfflineItems } from '../offline/offlineDB';
import { synchronizeQueue } from '../offline/syncQueue';

export function useOfflineQueue(token, isOnline) {
  const [queue, setQueue] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const refreshQueue = useCallback(async () => {
    try {
      const items = await getOfflineItems();
      setQueue(items || []);
    } catch (e) {
      console.error('Failed to read offline queue:', e);
    }
  }, []);

  const addToQueue = async (type, payload) => {
    const newItem = { type, payload };
    await addOfflineItem(newItem);
    await refreshQueue();
  };

  const triggerSync = useCallback(async () => {
    if (!token || isSyncing) return;
    setIsSyncing(true);
    const result = await synchronizeQueue(token);
    setLastSyncResult(result);
    await refreshQueue();
    setIsSyncing(false);
  }, [token, isSyncing, refreshQueue]);

  useEffect(() => {
    refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && token) {
      triggerSync();
    }
  }, [isOnline, queue.length, token, triggerSync]);

  return { queue, addToQueue, triggerSync, isSyncing, lastSyncResult, refreshQueue };
}
