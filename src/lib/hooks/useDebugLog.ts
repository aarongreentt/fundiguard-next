import { useEffect, useState, useRef, useCallback } from 'react';

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'warn' | 'info';
}

export function useDebugLog(maxLogs: number = 50) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pendingLogsRef = useRef<DebugLog[]>([]);
  const flushTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const flushLogs = useCallback(() => {
    if (pendingLogsRef.current.length > 0) {
      setLogs(prev => {
        const newLogs = [...prev, ...pendingLogsRef.current];
        return newLogs.slice(-maxLogs);
      });
      pendingLogsRef.current = [];
    }
  }, [maxLogs]);

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (message: string, type: 'log' | 'error' | 'warn' | 'info' = 'log') => {
      const timestamp = new Date().toLocaleTimeString();
      pendingLogsRef.current.push({ timestamp, message, type });

      // Batch updates: flush logs after render completes
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      flushTimeoutRef.current = setTimeout(flushLogs, 0);
    };

    console.log = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      addLog(message, 'log');
      originalLog(...args);
    };

    console.error = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      addLog(message, 'error');
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      addLog(message, 'warn');
      originalWarn(...args);
    };

    console.info = (...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      addLog(message, 'info');
      originalInfo(...args);
    };

    return () => {
      if (flushTimeoutRef.current) {
        clearTimeout(flushTimeoutRef.current);
      }
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, [flushLogs]);

  return { logs, isOpen, setIsOpen };
}
