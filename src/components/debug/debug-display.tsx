'use client';

import { useDebugLog } from '@/lib/hooks/useDebugLog';
import { ChevronDown, X } from 'lucide-react';

export function DebugDisplay() {
  const { logs, isOpen, setIsOpen } = useDebugLog(100);

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  return (
    <div className="fixed bottom-0 right-0 z-50 font-mono text-xs">
      {/* Debug Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="m-4 p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 shadow-lg"
      >
        <span className="text-xs">Debug</span>
        {errorCount > 0 && <span className="bg-red-600 px-2 py-1 rounded">⚠ {errorCount}</span>}
        {warnCount > 0 && <span className="bg-yellow-600 px-2 py-1 rounded">! {warnCount}</span>}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-4 bg-gray-900 text-white border border-gray-700 rounded-lg shadow-2xl w-96 max-h-96 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-800">
            <span className="font-bold text-sm">Debug Console ({logs.length})</span>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-gray-700 p-1 rounded"
            >
              <X size={14} />
            </button>
          </div>

          {/* Logs Container */}
          <div className="overflow-y-auto flex-1 p-3 space-y-1" style={{ maxHeight: '300px' }}>
            {logs.length === 0 ? (
              <div className="text-gray-500 text-xs">No logs yet...</div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={`text-xs py-1 px-2 rounded whitespace-pre-wrap break-words ${
                    log.type === 'error'
                      ? 'bg-red-900 text-red-200'
                      : log.type === 'warn'
                      ? 'bg-yellow-900 text-yellow-200'
                      : log.type === 'info'
                      ? 'bg-blue-900 text-blue-200'
                      : 'text-gray-300'
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-2 bg-gray-800 flex gap-2">
            <button
              onClick={() => window.location.reload()}
              className="text-xs bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                // Clear logs by reloading (simple approach)
                window.location.reload();
              }}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
