-- Fix missing RLS policies for bids table UPDATE and DELETE operations

-- Allow clients to update bid status (accept/reject)
DROP POLICY IF EXISTS "client can update bid status" ON public.bids;
CREATE POLICY "client can update bid status"
ON public.bids FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = bids.job_id
      AND j.client_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = bids.job_id
      AND j.client_id = auth.uid()
  )
);

-- Allow pros to update their own bids (edit)
DROP POLICY IF EXISTS "pro can update own bid" ON public.bids;
CREATE POLICY "pro can update own bid"
ON public.bids FOR UPDATE
TO authenticated
USING (pro_id = auth.uid())
WITH CHECK (pro_id = auth.uid());

-- Allow pros to delete their own bids
DROP POLICY IF EXISTS "pro can delete own bid" ON public.bids;
CREATE POLICY "pro can delete own bid"
ON public.bids FOR DELETE
TO authenticated
USING (pro_id = auth.uid());
