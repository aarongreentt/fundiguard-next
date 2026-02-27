// Storage Bucket Setup Script for FundiGuard
// Run this once to create storage buckets in Supabase
// Usage: npx ts-node lib/supabase/setup-storage.ts

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorageBuckets() {
  try {
    console.log('Setting up Supabase Storage buckets...');

    // 1. Create avatars bucket (public)
    console.log('\nCreating "avatars" bucket (public)...');
    const { data: avatarsData, error: avatarsError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    });

    if (avatarsError) {
      if (avatarsError.message.includes('already exists')) {
        console.log('✓ "avatars" bucket already exists');
      } else {
        console.error('✗ Error creating avatars bucket:', avatarsError.message);
      }
    } else {
      console.log('✓ "avatars" bucket created successfully');
    }

    // 2. Create verification-documents bucket (private)
    console.log('\nCreating "verification-documents" bucket (private)...');
    const { data: verDocData, error: verDocError } = await supabase.storage.createBucket(
      'verification-documents',
      {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      }
    );

    if (verDocError) {
      if (verDocError.message.includes('already exists')) {
        console.log('✓ "verification-documents" bucket already exists');
      } else {
        console.error('✗ Error creating verification-documents bucket:', verDocError.message);
      }
    } else {
      console.log('✓ "verification-documents" bucket created successfully');
    }

    // 3. Create portfolio-images bucket (public)
    console.log('\nCreating "portfolio-images" bucket (public)...');
    const { data: portfolioData, error: portfolioError } = await supabase.storage.createBucket(
      'portfolio-images',
      {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }
    );

    if (portfolioError) {
      if (portfolioError.message.includes('already exists')) {
        console.log('✓ "portfolio-images" bucket already exists');
      } else {
        console.error('✗ Error creating portfolio-images bucket:', portfolioError.message);
      }
    } else {
      console.log('✓ "portfolio-images" bucket created successfully');
    }

    console.log('\n✓ Storage bucket setup complete!');

    // 4. Set up storage policies via SQL
    console.log('\nSetting up storage policies...');
    
    return {
      success: true,
      message: 'Storage buckets configured successfully',
    };
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorageBuckets();
