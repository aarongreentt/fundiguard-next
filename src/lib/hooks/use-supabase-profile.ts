import { useEffect, useState } from 'react';
import { useSupabaseClient } from './useSupabaseClient';

export interface Profile {
  id: string;
  first_name: string;
  role: 'client' | 'fundi';
  avatar_url?: string;
}

export function useSupabaseProfile() {
  const supabase = useSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfile = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('id, first_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (mounted) {
          if (fetchError) {
            setError(fetchError);
          } else {
            setProfile(data as Profile);
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return { profile, loading, error };
}
