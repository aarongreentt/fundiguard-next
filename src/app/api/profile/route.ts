import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile
 * Fetch current authenticated user's profile
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

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Fetch role-specific data
    let roleSpecificData = null;
    if (profile.role === 'fundi') {
      const { data: proProfile } = await supabase
        .from('pro_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      roleSpecificData = proProfile;
    } else if (profile.role === 'client') {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      roleSpecificData = clientProfile;
    }

    return NextResponse.json({
      profile,
      roleSpecificData,
    });
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update current user's profile
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate input
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // Extract allowed fields
    const allowedFields = [
      'first_name',
      'last_name',
      'phone',
      'location',
      'bio',
      'avatar_url',
      'private_profile',
      'show_phone',
      'show_email',
      'email_notifications',
      'sms_notifications',
      'marketing_emails',
    ];

    const profileData: any = {};
    allowedFields.forEach((field) => {
      if (field in body) {
        profileData[field] = body[field];
      }
    });

    profileData.updated_at = new Date().toISOString();

    // Update profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 400 }
      );
    }

    // If role-specific data is provided, update that too
    if (body.roleSpecificData) {
      const roleData = body.roleSpecificData;
      const updatedProfile_ = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (updatedProfile_.data?.role === 'fundi') {
        const fundiAllowedFields = [
          'hourly_rate',
          'experience_years',
        ];
        const fundiData: any = {};
        fundiAllowedFields.forEach((field) => {
          if (field in roleData) {
            fundiData[field] = roleData[field];
          }
        });
        fundiData.updated_at = new Date().toISOString();

        if (Object.keys(fundiData).length > 1) { // More than just updated_at
          await supabase
            .from('pro_profiles')
            .update(fundiData)
            .eq('id', user.id);
        }
      } else if (updatedProfile_.data?.role === 'client') {
        const clientAllowedFields = [
          'preferred_budget_min',
          'preferred_budget_max',
          'preferred_categories',
        ];
        const clientData: any = {};
        clientAllowedFields.forEach((field) => {
          if (field in roleData) {
            clientData[field] = roleData[field];
          }
        });
        clientData.updated_at = new Date().toISOString();

        if (Object.keys(clientData).length > 1) {
          await supabase
            .from('client_profiles')
            .update(clientData)
            .eq('id', user.id);
        }
      }
    }

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('PUT /api/profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
