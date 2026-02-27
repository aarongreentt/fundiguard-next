import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/specialties?fundiId=[id]
 * Get all specialties for a fundi
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundiId = searchParams.get('fundiId');

    if (!fundiId) {
      return NextResponse.json(
        { error: 'fundiId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    const { data: specialties, error } = await supabase
      .from('specialties')
      .select('id, specialty')
      .eq('fundi_id', fundiId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch specialties' },
        { status: 400 }
      );
    }

    return NextResponse.json(specialties);
  } catch (error) {
    console.error('GET /api/specialties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/specialties
 * Add a specialty for current user (fundi)
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

    // Get user's pro_profile
    const { data: proProfile } = await supabase
      .from('pro_profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!proProfile) {
      return NextResponse.json(
        { error: 'User is not a professional' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { specialty } = body;

    if (!specialty || typeof specialty !== 'string') {
      return NextResponse.json(
        { error: 'Invalid specialty' },
        { status: 400 }
      );
    }

    // Add specialty
    const { data: newSpecialty, error: createError } = await supabase
      .from('specialties')
      .insert({
        fundi_id: user.id,
        specialty: specialty.trim(),
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique constraint
        return NextResponse.json(
          { error: 'This specialty already exists' },
          { status: 409 }
        );
      }
      console.error('Specialty creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to add specialty' },
        { status: 400 }
      );
    }

    return NextResponse.json(newSpecialty, { status: 201 });
  } catch (error) {
    console.error('POST /api/specialties error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


