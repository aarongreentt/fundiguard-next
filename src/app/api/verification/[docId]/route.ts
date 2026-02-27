import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * DELETE /api/verification/[docId]
 * Delete a verification document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { docId } = await params;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: doc } = await supabase
      .from('verification_documents')
      .select('fundi_id, document_url')
      .eq('id', docId)
      .single();

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (doc.fundi_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Extract filename from URL and delete from storage
    const urlPath = new URL(doc.document_url).pathname;
    const pathParts = urlPath.split('verification-documents/');
    if (pathParts.length === 2) {
      await supabase.storage
        .from('verification-documents')
        .remove([pathParts[1]]);
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from('verification_documents')
      .delete()
      .eq('id', docId);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/verification/[docId] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
