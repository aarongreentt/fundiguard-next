import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/[id]
 * Fetch public profile by user ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id;
    const supabase = await createSupabaseServerClient();

    // Fetch profile with public visibility
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, bio, location, avatar_url, role, completion_percentage, created_at')
      .eq('id', userId)
      .eq('private_profile', false) // Only fetch if not private
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found or is private' },
        { status: 404 }
      );
    }

    // Fetch role-specific public data
    let roleSpecificData: any = null;
    if (profile.role === 'fundi') {
      const { data: proProfile } = await supabase
        .from('pro_profiles')
        .select(
          'id, hourly_rate, experience_years, average_rating, total_reviews, total_jobs_completed, is_pro, verification_status'
        )
        .eq('id', userId)
        .single();
      roleSpecificData = proProfile;

      // Fetch specialties
      const { data: specialties } = await supabase
        .from('specialties')
        .select('specialty')
        .eq('fundi_id', userId);

      // Fetch service areas
      const { data: serviceAreas } = await supabase
        .from('service_areas')
        .select('area_name')
        .eq('fundi_id', userId);

      // Fetch portfolio
      const { data: portfolio } = await supabase
        .from('portfolio_items')
        .select('id, title, description, image_url, category')
        .eq('fundi_id', userId)
        .limit(6);

      // Fetch recent reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select(
          `
          id, 
          rating, 
          comment, 
          created_at,
          reviewer:reviewer_id(first_name, last_name, avatar_url)
          `
        )
        .eq('reviewed_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (roleSpecificData) {
        roleSpecificData.specialties = specialties || [];
        roleSpecificData.service_areas = serviceAreas || [];
        roleSpecificData.portfolio = portfolio || [];
        roleSpecificData.recent_reviews = reviews || [];
      }
    } else if (profile.role === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('total_jobs_posted, total_spent, average_rating_given')
        .eq('id', userId)
        .single();

      // Fetch recent reviews given by client
      const { data: reviewsGiven } = await supabase
        .from('reviews')
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          reviewed:reviewed_id(first_name, last_name, avatar_url)
          `
        )
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      roleSpecificData = clientProfile ? {
        ...clientProfile,
        reviews_given: reviewsGiven || [],
      } as any : null;
    }

    return NextResponse.json({
      profile,
      roleSpecificData,
    });
  } catch (error) {
    console.error('GET /api/profile/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
