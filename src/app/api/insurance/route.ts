/**
 * Insurance API Routes (Optional)
 * 
 * These are example REST API endpoints for insurance management.
 * The app uses server actions by default, but these can be used if preferred.
 * 
 * Usage:
 * GET  /api/insurance - Get all user's policies
 * POST /api/insurance - Create new policy
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';

// GET /api/insurance - Fetch all user policies
export async function GET(request: NextRequest) {
  try {
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
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/insurance - Create new policy
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const provider = String(formData.get('provider') ?? '');
    const policyNumber = String(formData.get('policyNumber') ?? '');
    const startDate = String(formData.get('startDate') ?? '');
    const expiryDate = String(formData.get('expiryDate') ?? '');
    const coverageAmount = Number(formData.get('coverageAmount') ?? 0);
    const certificateFile = formData.get('certificateFile') as File;

    // Validate
    if (!provider || !policyNumber || !expiryDate || !coverageAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!certificateFile) {
      return NextResponse.json({ error: 'Certificate file required' }, { status: 400 });
    }

    // Upload certificate
    const fileName = `${user.id}/${Date.now()}-${certificateFile.name}`;
    const buffer = await certificateFile.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('insurance_certificates')
      .upload(fileName, buffer);

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('insurance_certificates')
      .getPublicUrl(fileName);

    // Create policy record
    const { data, error } = await supabase
      .from('insurance_policies')
      .insert({
        user_id: user.id,
        provider,
        policy_number: policyNumber,
        start_date: startDate || new Date().toISOString().split('T')[0],
        expiry_date: expiryDate,
        coverage_amount: coverageAmount,
        certificate_url: urlData.publicUrl,
        verification_status: 'pending',
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating insurance policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
