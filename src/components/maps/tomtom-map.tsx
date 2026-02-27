'use client';

import { useEffect, useRef } from 'react';
import type * as TT from '@tomtom-international/web-sdk-maps';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { env } from '@/lib/env';

// Dynamically import to avoid module resolution issues
const getTT = async () => {
  const tt = await import('@tomtom-international/web-sdk-maps');
  return (tt as any).default || tt;
};

interface TomTomMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: string;
  markerLabel?: string;
  interactive?: boolean;
}

export function TomTomMap({
  latitude,
  longitude,
  zoom = 13,
  height = '300px',
  markerLabel = 'Location',
  interactive = true,
}: TomTomMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);

  useEffect(() => {
    if (!mapContainer.current || !env.NEXT_PUBLIC_TOMTOM_API_KEY) return;

    // Initialize map with dynamic import
    const initMap = async () => {
      try {
        const tt = await getTT();
        
        map.current = tt.map({
          key: env.NEXT_PUBLIC_TOMTOM_API_KEY!,
          container: mapContainer.current,
          center: [longitude, latitude],
          zoom: zoom,
          style: 'https://api.tomtom.com/style/1/style/20.11.00-3/dusk.json',
          interactive: interactive,
          scrollZoom: interactive,
          dragPan: interactive,
        });

        // Add marker
        const marker = new tt.Marker({
          color: '#3B82F6', // Tailwind blue-500
        })
          .setLngLat([longitude, latitude])
          .addTo(map.current);

        // Add popup
        const popup = new tt.Popup({ offset: 35 }).setHTML(
          `<div class="text-sm font-medium">${markerLabel}</div>`
        );
        marker.setPopup(popup).togglePopup();
      } catch (error) {
        console.error('Error initializing TomTom map:', error);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [latitude, longitude, zoom, markerLabel, interactive]);

  return (
    <div
      ref={mapContainer}
      style={{ height }}
      className="w-full rounded-lg border border-gray-200 shadow-sm"
    />
  );
}
