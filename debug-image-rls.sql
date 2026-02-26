-- Allow any authenticated user to read job images
drop policy if exists "job owners can read their own images" on storage.objects;
create policy "authenticated users can read job images"
on storage.objects for select
to authenticated
using (
  bucket_id = 'job-images'
);

-- Keep upload restricted to job owners
drop policy if exists "job owners can upload images" on storage.objects;
create policy "job owners can upload images"
on storage.objects for insert
with check (
  bucket_id = 'job-images' and
  auth.role() = 'authenticated' and
  (storage.foldername(name))[1]::text = auth.uid()::text
);
