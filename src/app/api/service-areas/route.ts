import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/service-areas?fundiId=[id]
 * Get all service areas for a fundi
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

    const { data: serviceAreas, error } = await supabase
      .from('service_areas')
      .select('id, area_name, latitude, longitude')
      .eq('fundi_id', fundiId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch service areas' },
        { status: 400 }
      );
    }

    return NextResponse.json(serviceAreas);
  } catch (error) {
    console.error('GET /api/service-areas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/service-areas
 * Add a service area for current user (fundi)
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
    const { area_name, latitude, longitude } = body;

    // Validate input
    if (!area_name || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: area_name, latitude, longitude' },
        { status: 400 }
      );
    }

    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude must be numbers' },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Add service area
    const { data: newArea, error: createError } = await supabase
      .from('service_areas')
      .insert({
        fundi_id: user.id,
        area_name: area_name.trim(),
        latitude,
        longitude,
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') { // Unique constraint
        return NextResponse.json(
          { error: 'This service area already exists' },
          { status: 409 }
        );
      }
      console.error('Service area creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to add service area' },
        { status: 400 }
      );
    }

    return NextResponse.json(newArea, { status: 201 });
  } catch (error) {
    console.error('POST /api/service-areas error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


