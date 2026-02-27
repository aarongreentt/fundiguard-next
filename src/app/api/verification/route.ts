import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/verification
 * Get current user's verification documents
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

    // Get user's pro profile
    const { data: proProfile } = await supabase
      .from('pro_profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single();

    if (!proProfile) {
      return NextResponse.json(
        { error: 'User is not a professional' },
        { status: 403 }
      );
    }

    // Get verification documents
    const { data: documents, error } = await supabase
      .from('verification_documents')
      .select('id, doc_type, document_url, submission_date, verification_date, is_approved, rejection_reason')
      .eq('fundi_id', user.id)
      .order('submission_date', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: proProfile.verification_status,
      documents,
    });
  } catch (error) {
    console.error('GET /api/verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/verification
 * Submit verification document
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

    // Get user's pro profile
    const { data: proProfile } = await supabase
      .from('pro_profiles')
      .select('verification_status')
      .eq('id', user.id)
      .single();

    if (!proProfile) {
      return NextResponse.json(
        { error: 'User is not a professional' },
        { status: 403 }
      );
    }

    if (proProfile.verification_status === 'verified') {
      return NextResponse.json(
        { error: 'User is already verified' },
        { status: 403 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;

    if (!file || !docType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, docType' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['identity', 'police_clearance', 'address'];
    if (!validTypes.includes(docType)) {
      return NextResponse.json(
        { error: 'Invalid doc_type. Allowed: identity, police_clearance, address' },
        { status: 400 }
      );
    }

    // Validate file type (PDF or images only)
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPEG, PNG' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max size: 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileExtension = file.type === 'application/pdf' ? 'pdf' : 'jpg';
    const filename = `${user.id}-${docType}-${Date.now()}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(`${user.id}/${filename}`, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(`${user.id}/${filename}`);

    // Check if document of this type already exists
    const { data: existingDoc } = await supabase
      .from('verification_documents')
      .select('id')
      .eq('fundi_id', user.id)
      .eq('doc_type', docType)
      .single();

    let result;
    if (existingDoc) {
      // Update existing document
      const { data: updated, error: updateError } = await supabase
        .from('verification_documents')
        .update({
          document_url: publicUrl,
          submission_date: new Date().toISOString(),
          is_approved: false,
          rejection_reason: null,
        })
        .eq('id', existingDoc.id)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update document record' },
          { status: 400 }
        );
      }
      result = updated;
    } else {
      // Create new document record
      const { data: created, error: createError } = await supabase
        .from('verification_documents')
        .insert({
          fundi_id: user.id,
          doc_type: docType,
          document_url: publicUrl,
          submission_date: new Date().toISOString(),
          is_approved: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        return NextResponse.json(
          { error: 'Failed to create document record' },
          { status: 400 }
        );
      }
      result = created;
    }

    // Update pro_profile verification status to pending if not already
    if (proProfile.verification_status === 'not_started') {
      await supabase
        .from('pro_profiles')
        .update({ verification_status: 'pending' })
        .eq('id', user.id);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('POST /api/verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


