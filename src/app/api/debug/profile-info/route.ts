import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('[DEBUG API] No authenticated user');
      return NextResponse.json(
        { 
          authenticated: false,
          error: userError?.message || 'No user session',
          user: null 
        },
        { status: 401 }
      );
    }

    console.log('[DEBUG API] Authenticated user:', user.id);

    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, avatar_url, email')
      .eq('id', user.id)
      .maybeSingle();

    console.log('[DEBUG API] Profile query result:', { 
      data: profileData, 
      error: profileError 
    });

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
      profile: profileData,
      profileError: profileError?.message || null,
    });
  } catch (error) {
    console.error('[DEBUG API] Error:', error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
