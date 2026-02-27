import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/saved-fundis/[fundiId]
 * Unsave a fundi
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fundiId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { fundiId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete saved fundi
    const { error: deleteError } = await supabase
      .from('saved_fundis')
      .delete()
      .eq('client_id', user.id)
      .eq('fundi_id', fundiId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to unsave fundi' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/saved-fundis/[fundiId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
