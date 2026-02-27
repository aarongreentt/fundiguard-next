import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/service-areas/[id]
 * Delete a service area
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: area } = await supabase
      .from('service_areas')
      .select('fundi_id')
      .eq('id', id)
      .single();

    if (!area) {
      return NextResponse.json(
        { error: 'Service area not found' },
        { status: 404 }
      );
    }

    if (area.fundi_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete service area
    const { error: deleteError } = await supabase
      .from('service_areas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete service area' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/service-areas/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
