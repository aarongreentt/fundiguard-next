import { useEffect, useState } from 'react';

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'log' | 'error' | 'warn' | 'info';
}

export function useDebugLog(maxLogs: number = 50) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Override console methods to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (message: string, type: 'log' | 'error' | 'warn' | 'info' = 'log') => {
      const timestamp = new Date().toLocaleTimeString();
      setLogs(prev => {
        const newLogs = [...prev, { timestamp, message, type }];
        // Keep only the latest maxLogs entries
        return newLogs.slice(-maxLogs);
      });
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
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, [maxLogs]);

  return { logs, isOpen, setIsOpen };
}
