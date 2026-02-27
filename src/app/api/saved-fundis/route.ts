import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/saved-fundis
 * Get current user's saved/favorite fundis
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's client profile
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!clientProfile) {
      return NextResponse.json(
        { error: 'User is not a client' },
        { status: 403 }
      );
    }

    // Get saved fundis with their details
    const { data: savedFundis, error } = await supabase
      .from('saved_fundis')
      .select(
        `
        id,
        fundi:fundi_id(
          id,
          first_name,
          last_name,
          avatar_url,
          location,
          bio,
          pro_profiles(
            hourly_rate,
            average_rating,
            total_reviews,
            is_pro
          )
        )
        `
      )
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch saved fundis' },
        { status: 400 }
      );
    }

    return NextResponse.json(savedFundis);
  } catch (error) {
    console.error('GET /api/saved-fundis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/saved-fundis
 * Save a fundi
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's client profile
    const { data: clientProfile } = await supabase
      .from('client_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!clientProfile) {
      return NextResponse.json(
        { error: 'User is not a client' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fundi_id } = body;

    if (!fundi_id) {
      return NextResponse.json(
        { error: 'Missing required field: fundi_id' },
        { status: 400 }
      );
    }

    if (user.id === fundi_id) {
      return NextResponse.json(
        { error: 'Cannot save yourself' },
        { status: 400 }
      );
    }

    // Verify fundi exists and is a professional
    const { data: fundi } = await supabase
      .from('pro_profiles')
      .select('id')
      .eq('id', fundi_id)
      .single();

    if (!fundi) {
      return NextResponse.json(
        { error: 'Fundi not found or not a professional' },
        { status: 404 }
      );
    }

    // Save fundi
    const { data: saved, error: createError } = await supabase
      .from('saved_fundis')
      .insert({
        client_id: user.id,
        fundi_id,
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique constraint
        return NextResponse.json(
          { error: 'Fundi already saved' },
          { status: 409 }
        );
      }
      console.error('Save error:', createError);
      return NextResponse.json(
        { error: 'Failed to save fundi' },
        { status: 400 }
      );
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('POST /api/saved-fundis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


