import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/reviews?userId=[id]&filter=[recent|highest|lowest]
 * Fetch reviews for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filter = searchParams.get('filter') || 'recent';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Build query
    let query = supabase
      .from('reviews')
      .select(
        `
        id,
        rating,
        comment,
        is_verified,
        created_at,
        reviewer:reviewer_id(id, first_name, last_name, avatar_url)
        `
      )
      .eq('reviewed_id', userId);

    // Apply filter
    if (filter === 'highest') {
      query = query.order('rating', { ascending: false });
    } else if (filter === 'lowest') {
      query = query.order('rating', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: reviews, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 400 }
      );
    }

    // Calculate statistics
    const stats = {
      average_rating: reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : 0,
      total_reviews: reviews.length,
      distribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length,
      },
    };

    return NextResponse.json({
      reviews,
      stats,
    });
  } catch (error) {
    console.error('GET /api/reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Create a new review
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

    const body = await request.json();
    const { reviewed_id, rating, comment, job_id } = body;

    // Validate input
    if (!reviewed_id || !rating || !comment) {
      return NextResponse.json(
        { error: 'Missing required fields: reviewed_id, rating, comment' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (user.id === reviewed_id) {
      return NextResponse.json(
        { error: 'Cannot review yourself' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this person for this job
    if (job_id) {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('reviewer_id', user.id)
        .eq('reviewed_id', reviewed_id)
        .eq('job_id', job_id)
        .single();

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this person for this job' },
          { status: 400 }
        );
      }
    }

    // Create review
    const { data: newReview, error: createError } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: user.id,
        reviewed_id,
        rating,
        comment,
        job_id: job_id || null,
        is_verified: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Review creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 400 }
      );
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('POST /api/reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
