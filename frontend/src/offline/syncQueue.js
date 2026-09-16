import { getOfflineItems, removeOfflineItem } from './offlineDB';
import { processSyncBatch } from '../services/sync';

export async function synchronizeQueue(token) {
  try {
    const items = await getOfflineItems();
    if (!items || items.length === 0) {
      return { syncedCount: 0, errors: [] };
    }

    const payloadItems = items.map(i => ({
      id: i.id,
      type: i.type,
      payload: i.payload
    }));

    const result = await processSyncBatch(payloadItems, token);

    if (result && result.syncedIds) {
      for (const id of result.syncedIds) {
        await removeOfflineItem(id);
      }
    }

    return {
      syncedCount: result?.syncedIds?.length || 0,
      errors: result?.errors || []
    };
  } catch (err) {
    console.error('Offline synchronization failed:', err);
    return { syncedCount: 0, errors: [err.message] };
  }
}
