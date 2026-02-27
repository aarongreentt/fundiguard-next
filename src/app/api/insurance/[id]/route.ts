/**
 * Insurance Individual Policy Routes
 * 
 * GET    /api/insurance/[id] - Get single policy
 * PATCH  /api/insurance/[id] - Update policy
 * DELETE /api/insurance/[id] - Delete policy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';

// GET /api/insurance/[id] - Fetch single policy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/insurance/[id] - Update policy
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Only allow updating verification status and notes
    const updates: any = {};
    if (body.verification_status) {
      updates.verification_status = body.verification_status;
      if (body.verification_status === 'verified') {
        updates.verified_at = new Date().toISOString();
      }
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('insurance_policies')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/insurance/[id] - Delete policy
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get policy to find certificate URL
    const { data: policy, error: getError } = await supabase
      .from('insurance_policies')
      .select('certificate_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (getError) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    // Delete certificate from storage
    if (policy.certificate_url) {
      const pathParts = policy.certificate_url.split('/');
      const fileName = pathParts.slice(-2).join('/');

      await supabase.storage
        .from('insurance_certificates')
        .remove([fileName])
        .catch(() => {
          // Silently ignore if file doesn't exist
        });
    }

    // Delete policy record
    const { error: deleteError } = await supabase
      .from('insurance_policies')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
