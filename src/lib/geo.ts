/**
 * Geographic utility functions for distance calculations and location filtering
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a job location is within a pro's service area
 */
export function isJobInServiceArea(
  jobLat: number,
  jobLon: number,
  proServiceLat: number,
  proServiceLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(
    proServiceLat,
    proServiceLon,
    jobLat,
    jobLon
  );
  return distance <= radiusKm;
}

/**
 * Sort jobs by distance from a location
 */
export function sortJobsByDistance(
  jobs: Array<{ latitude: number; longitude: number; [key: string]: any }>,
  centerLat: number,
  centerLon: number
): Array<{ distance: number; job: any }> {
  return jobs
    .map((job) => ({
      distance: calculateDistance(centerLat, centerLon, job.latitude, job.longitude),
      job,
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get jobs within service area
 */
export function filterJobsByServiceArea(
  jobs: Array<{ latitude: number; longitude: number; [key: string]: any }>,
  proServiceLat: number,
  proServiceLon: number,
  radiusKm: number
): any[] {
  return jobs.filter((job) =>
    isJobInServiceArea(job.latitude, job.longitude, proServiceLat, proServiceLon, radiusKm)
  );
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}
