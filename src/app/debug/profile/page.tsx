'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@/lib/hooks/useSupabaseClient';

interface DebugInfo {
  authenticated: boolean;
  userId: string | null;
  profile: any;
  profileError: string | null;
  consoleOutput: string[];
}

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const debugCheck = async () => {
      const logs: string[] = [];

      try {
        if (!supabase) {
          logs.push('❌ Supabase client not initialized');
          setDebugInfo({
            authenticated: false,
            userId: null,
            profile: null,
            profileError: 'Supabase not initialized',
            consoleOutput: logs,
          });
          setLoading(false);
          return;
        }

        logs.push('✅ Supabase client initialized');

        // Check auth
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          logs.push(`❌ Auth error: ${authError.message}`);
        }

        if (!user) {
          logs.push('⚠️ No authenticated user');
          setDebugInfo({
            authenticated: false,
            userId: null,
            profile: null,
            profileError: 'No authenticated user',
            consoleOutput: logs,
          });
          setLoading(false);
          return;
        }

        logs.push(`✅ User authenticated: ${user.id}`);
        logs.push(`   Email: ${user.email}`);

        // Try to fetch profile
        logs.push('\n📊 Fetching profile from Supabase...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, avatar_url, email, role, created_at')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) {
          logs.push(`❌ Profile fetch error: ${profileError.message}`);
          logs.push(`   Code: ${profileError.code}`);
          logs.push(`   Details: ${JSON.stringify(profileError.details)}`);
        }

        if (profileData) {
          logs.push('✅ Profile data found:');
          logs.push(`   ID: ${profileData.id}`);
          logs.push(`   first_name: ${profileData.first_name || '(null)'}`);
          logs.push(`   avatar_url: ${profileData.avatar_url || '(null)'}`);
          logs.push(`   email: ${profileData.email || '(null)'}`);
          logs.push(`   role: ${profileData.role || '(null)'}`);
          logs.push(`   created_at: ${profileData.created_at}`);
        } else {
          logs.push('⚠️ No profile data found in database');
        }

        setDebugInfo({
          authenticated: true,
          userId: user.id,
          profile: profileData,
          profileError: profileError?.message || null,
          consoleOutput: logs,
        });
      } catch (err) {
        logs.push(`❌ Unexpected error: ${String(err)}`);
        setDebugInfo({
          authenticated: false,
          userId: null,
          profile: null,
          profileError: String(err),
          consoleOutput: logs,
        });
      } finally {
        setLoading(false);
      }
    };

    debugCheck();
  }, [supabase]);

  if (loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  if (!debugInfo) {
    return <div className="p-8">Failed to load debug info</div>;
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Profile Debug Info</h1>

      <div className="bg-gray-100 rounded-lg p-6 mb-6 font-mono text-sm whitespace-pre-wrap">
        {debugInfo.consoleOutput.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Authenticated:</span>{' '}
            {debugInfo.authenticated ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-medium">User ID:</span> {debugInfo.userId || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Profile Exists:</span>{' '}
            {debugInfo.profile ? '✅ Yes' : '❌ No'}
          </div>
          {debugInfo.profile && (
            <>
              <div>
                <span className="font-medium">First Name:</span>{' '}
                {debugInfo.profile.first_name || '(empty)'}
              </div>
              <div>
                <span className="font-medium">Avatar URL:</span>{' '}
                {debugInfo.profile.avatar_url || '(empty)'}
              </div>
            </>
          )}
          {debugInfo.profileError && (
            <div className="text-red-600">
              <span className="font-medium">Error:</span> {debugInfo.profileError}
            </div>
          )}
        </div>
      </div>

      <a href="/" className="text-blue-600 hover:underline">
        ← Back to home
      </a>
    </div>
  );
}
