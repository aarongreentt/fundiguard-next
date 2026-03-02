import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * This route handles the email verification callback from Supabase
 * It exchanges the auth code for a session and persists it
 * 
 * Called when user clicks email verification link
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/onboarding/role';

  console.log('[auth/callback] Processing email verification callback', {
    hasCode: !!code,
    next,
  });

  if (code) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      console.error('[auth/callback] Supabase not configured');
      return NextResponse.redirect(new URL('/sign-in?error=config', request.url));
    }

    // Create a new response to set cookies on
    const response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] Error exchanging code for session:', {
        message: error.message,
        status: error.status,
      });
      return NextResponse.redirect(new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, request.url));
    }

    if (data.session) {
      console.log('[auth/callback] Session established successfully', {
        userId: data.session.user.id,
        email: data.session.user.email,
      });
    }

    console.log('[auth/callback] Redirecting to:', next);
    return response;
  }

  console.warn('[auth/callback] No code provided in callback');
  return NextResponse.redirect(new URL('/sign-in', request.url));
}
