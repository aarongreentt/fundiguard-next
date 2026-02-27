import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/portfolio?fundiId=[id]
 * Get all portfolio items for a fundi
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

    const { data: portfolio, error } = await supabase
      .from('portfolio_items')
      .select('id, title, description, image_url, category, created_at')
      .eq('fundi_id', fundiId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch portfolio' },
        { status: 400 }
      );
    }

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('GET /api/portfolio error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portfolio
 * Add a portfolio item for current user (fundi)
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
    const { title, description, image_url, category } = body;

    // Validate input
    if (!title || !description || !image_url) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, image_url' },
        { status: 400 }
      );
    }

    // Add portfolio item
    const { data: newItem, error: createError } = await supabase
      .from('portfolio_items')
      .insert({
        fundi_id: user.id,
        title: title.trim(),
        description: description.trim(),
        image_url: image_url.trim(),
        category: category?.trim() || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Portfolio item creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to add portfolio item' },
        { status: 400 }
      );
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/portfolio error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


