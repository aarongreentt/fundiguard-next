import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/preferences
 * Get current user's preferences
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

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // User might not have preferences yet
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          user_id: user.id,
          preferred_categories: [],
          preferred_locations: [],
          language: 'en',
          currency: 'KES',
        });
      }
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 400 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('GET /api/preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/preferences
 * Update current user's preferences
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
    const { preferred_categories, preferred_locations, language, currency } = body;

    // Validate input
    if (language && !['en', 'sw', 'fr'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Supported: en, sw, fr' },
        { status: 400 }
      );
    }

    if (currency && !['KES', 'USD', 'EUR'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency. Supported: KES, USD, EUR' },
        { status: 400 }
      );
    }

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let result;
    if (existing) {
      // Update existing preferences
      const { data: updated, error: updateError } = await supabase
        .from('user_preferences')
        .update({
          ...(preferred_categories !== undefined && { preferred_categories }),
          ...(preferred_locations !== undefined && { preferred_locations }),
          ...(language && { language }),
          ...(currency && { currency }),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Preferences update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update preferences' },
          { status: 400 }
        );
      }
      result = updated;
    } else {
      // Create new preferences
      const { data: created, error: createError } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          preferred_categories: preferred_categories || [],
          preferred_locations: preferred_locations || [],
          language: language || 'en',
          currency: currency || 'KES',
        })
        .select()
        .single();

      if (createError) {
        console.error('Preferences creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create preferences' },
          { status: 400 }
        );
      }
      result = created;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
