import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * PUT /api/portfolio/[id]
 * Update a portfolio item
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const resolvedParams = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: item } = await supabase
      .from('portfolio_items')
      .select('fundi_id')
      .eq('id', resolvedParams.id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    if (item.fundi_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, image_url, category } = body;

    // Update portfolio item
    const { data: updatedItem, error: updateError } = await supabase
      .from('portfolio_items')
      .update({
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(image_url && { image_url: image_url.trim() }),
        ...(category !== undefined && { category: category?.trim() || null }),
      })
      .eq('id', resolvedParams.id)
      .select()
      .single();

    if (updateError) {
      console.error('Portfolio item update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update portfolio item' },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('PUT /api/portfolio/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/portfolio/[id]
 * Delete a portfolio item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const resolvedParams = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: item } = await supabase
      .from('portfolio_items')
      .select('fundi_id')
      .eq('id', resolvedParams.id)
      .single();

    if (!item) {
      return NextResponse.json(
        { error: 'Portfolio item not found' },
        { status: 404 }
      );
    }

    if (item.fundi_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete portfolio item
    const { error: deleteError } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', resolvedParams.id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete portfolio item' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/portfolio/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
