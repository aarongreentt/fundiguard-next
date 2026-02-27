'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { env } from '@/lib/env';
import { calculateDistance, formatDistance } from '@/lib/geo';

interface Job {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  budget_range: string;
  status: string;
}

interface BrowseJobsMapProps {
  jobs: Job[];
  height?: string;
  showOnlyAvailable?: boolean;
}

export function BrowseJobsMap({
  jobs,
  height = '500px',
  showOnlyAvailable = true,
}: BrowseJobsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<Map<string, any>>(new Map());
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [tt, setTT] = useState<any>(null);

  const getTT = useCallback(async () => {
    if (tt) return tt;
    try {
      const module = await import('@tomtom-international/web-sdk-maps');
      const ttModule = (module as any).default || module;
      setTT(ttModule);
      return ttModule;
    } catch (error) {
      console.error('Error loading TomTom:', error);
      return null;
    }
  }, [tt]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !env.NEXT_PUBLIC_TOMTOM_API_KEY) return;

    const initMap = async () => {
      try {
        const ttModule = await getTT();
        if (!ttModule) return;

        // Calculate bounds from all jobs
        if (jobs.length === 0) return;

        const lats = jobs.map((j) => j.latitude);
        const lons = jobs.map((j) => j.longitude);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLon = Math.min(...lons);
        const maxLon = Math.max(...lons);

        // Center and zoom
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;

        map.current = ttModule.map({
          key: env.NEXT_PUBLIC_TOMTOM_API_KEY!,
          container: mapContainer.current,
          center: [centerLon, centerLat],
          zoom: 12,
          style: 'https://api.tomtom.com/style/1/style/20.11.00-3/dusk.json',
          interactive: true,
          scrollZoom: true,
          dragPan: true,
        });

        // Add markers for jobs
        jobs.forEach((job) => {
          const color = job.status === 'open' ? '#10b981' : '#8b5cf6'; // green for open, purple for closed
          const marker = new ttModule.Marker({
            color: color,
          })
            .setLngLat([job.longitude, job.latitude])
            .addTo(map.current);

          // Click marker to show job details
          marker.getElement().addEventListener('click', () => {
            setSelectedJob(job);
          });

          markers.current.set(job.id, marker);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [jobs, getTT]);

  // Filter displayed jobs
  const displayedJobs = showOnlyAvailable ? jobs.filter((j) => j.status === 'open') : jobs;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Map */}
      <div className="lg:col-span-2">
        <div
          ref={mapContainer}
          style={{ height }}
          className="w-full rounded-lg border border-gray-200 shadow-sm"
        />
      </div>

      {/* Job Details Panel */}
      <div className="grid gap-3 max-h-[500px] overflow-y-auto">
        <div className="font-semibold text-sm">
          {displayedJobs.length} Job{displayedJobs.length !== 1 ? 's' : ''}
        </div>

        {selectedJob ? (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 grid gap-2">
            <h3 className="font-semibold text-sm text-gray-900">{selectedJob.title}</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <p>📍 {selectedJob.location}</p>
              <p>💰 {selectedJob.budget_range}</p>
              <p className={`inline-block px-2 py-1 rounded ${
                selectedJob.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedJob.status}
              </p>
            </div>
            <Link
              href={`/jobs/${selectedJob.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Click a marker to see job details</p>
        )}

        <div className="space-y-2 border-t pt-3">
          {displayedJobs.slice(0, 5).map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="w-full p-2 text-left border rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <div className="font-medium text-gray-900 truncate">{job.title}</div>
              <div className="text-xs text-gray-600">{job.location}</div>
            </button>
          ))}
          {displayedJobs.length > 5 && (
            <p className="text-xs text-gray-500 p-2">
              +{displayedJobs.length - 5} more jobs
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
