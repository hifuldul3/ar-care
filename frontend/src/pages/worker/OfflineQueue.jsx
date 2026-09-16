import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navbar } from '../../components/Navbar';
import { Sidebar } from '../../components/Sidebar';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

export function OfflineQueue() {
  const { token } = useContext(AuthContext);
  const { connectionQuality, isOnline } = useNetworkStatus();
  const { queue, triggerSync, isSyncing, lastSyncResult } = useOfflineQueue(token, isOnline);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar connectionQuality={connectionQuality} />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar role="worker" />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>💾 Offline Queue Inspector</span>
              </h2>
              <p className="text-xs text-slate-400">View and manage locally queued records created during connection loss.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerSync}
              disabled={isSyncing || !isOnline || queue.length === 0}
            >
              {isSyncing ? 'SYNCHRONIZING...' : '🔄 SYNCHRONIZE NOW'}
            </Button>
          </div>

          {lastSyncResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-lg">
              ✓ Synchronized {lastSyncResult.syncedCount} item(s) to FastAPI backend!
            </div>
          )}

          <Card title="Locally Queued Items (IndexedDB)">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <p>No offline items in queue. All records are fully synchronized!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800 text-xs">
                {queue.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-400 mr-2">[{item.type}]</span>
                      <span className="text-slate-200">{item.id}</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Queued: {item.createdAt}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                      PENDING SYNC
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
