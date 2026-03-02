'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';

interface StatusInfo {
  supabaseReady: boolean;
  authUser: string | null;
  userRole: string | null;
  currentPath: string;
}

export function DebugStatus() {
  const [status, setStatus] = useState<StatusInfo>({
    supabaseReady: false,
    authUser: null,
    userRole: null,
    currentPath: '',
  });
  const [isVisible, setIsVisible] = useState(true);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const updateStatus = async () => {
      setStatus(prev => ({
        ...prev,
        supabaseReady: !!supabase,
        currentPath: typeof window !== 'undefined' ? window.location.pathname : '',
      }));

      if (supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          setStatus(prev => ({
            ...prev,
            authUser: user?.email || user?.id || null,
          }));

          // Try to get user role
          if (user) {
            const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('user_id', user.id)
              .maybeSingle();

            setStatus(prev => ({
              ...prev,
              userRole: data?.role || 'unknown',
            }));
          }
        } catch (error) {
          console.error('[DebugStatus] Error fetching user info:', error);
        }
      }
    };

    updateStatus();
  }, [supabase]);

  return (
    <div className="fixed top-0 left-0 z-40 m-2">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        {isVisible ? '✓ Status' : 'Status'}
      </button>

      {isVisible && (
        <div className="mt-1 bg-gray-900 text-white text-xs rounded shadow-lg p-3 font-mono space-y-1 w-72">
          <div>
            <span className="text-gray-400">Path:</span> {status.currentPath}
          </div>
          <div>
            <span className="text-gray-400">Supabase:</span>{' '}
            <span className={status.supabaseReady ? 'text-green-400' : 'text-red-400'}>
              {status.supabaseReady ? '✓ Ready' : '✗ Not Ready'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Auth:</span>{' '}
            <span className={status.authUser ? 'text-green-400' : 'text-orange-400'}>
              {status.authUser ? `✓ ${status.authUser.substring(0, 20)}...` : '⊘ Not Authenticated'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Role:</span>{' '}
            <span className="text-blue-400">{status.userRole || 'unknown'}</span>
          </div>
          <div className="pt-2 border-t border-gray-700 text-gray-500">
            Open DevTools (F12) to see full console logs
          </div>
        </div>
      )}
    </div>
  );
}
