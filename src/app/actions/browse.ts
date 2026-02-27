'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server-ssr';
import {
  filterJobsByServiceArea,
  sortJobsByDistance,
} from '@/lib/geo';

export async function getJobsForBrowse(limit = 50) {
  const supabase = await createSupabaseServerClient();

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(
      'id,title,category,location,budget_range,status,client_id,description,latitude,longitude,created_at'
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return jobs || [];
}

export async function getJobsInProServiceArea() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // Get pro's profile with service area
  const { data: profile } = await supabase
    .from('profiles')
    .select('service_latitude,service_longitude,service_radius_km')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.service_latitude || !profile?.service_longitude) {
    // If no service area set, return all open jobs
    return getJobsForBrowse();
  }

  // Get all open jobs
  const jobs = await getJobsForBrowse(500); // Get more jobs for filtering

  // Filter by service area
  const jobsInArea = filterJobsByServiceArea(
    jobs as any[],
    profile.service_latitude,
    profile.service_longitude,
    profile.service_radius_km || 15
  );

  // Sort by distance
  const sorted = sortJobsByDistance(
    jobsInArea,
    profile.service_latitude,
    profile.service_longitude
  );

  return sorted.map((item) => ({
    ...item.job,
    distance_km: item.distance,
  }));
}
