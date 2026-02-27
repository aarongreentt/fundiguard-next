'use client';

import { useEffect, useRef, useState } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { env } from '@/lib/env';
import { Input } from '@/components/ui/input';

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => void;
  initialLocation?: { latitude: number; longitude: number };
  height?: string;
}

// Dynamically import TomTom modules to avoid module resolution issues
const getTTModules = async () => {
  const tt = (await import('@tomtom-international/web-sdk-maps')).default;
  const services = (await import('@tomtom-international/web-sdk-services')).default;
  return { tt, services };
};

export function LocationPicker({
  onLocationSelect,
  initialLocation = { latitude: -1.2921, longitude: 36.8219 }, // Default to Nairobi
  height = '400px',
}: LocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [tt, setTT] = useState<any>(null);
  const [services, setServices] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !env.NEXT_PUBLIC_TOMTOM_API_KEY) return;

    const initMap = async () => {
      try {
        const { tt: ttModule, services: servicesModule } = await getTTModules();
        setTT(ttModule);
        setServices(servicesModule);

        map.current = ttModule.map({
          key: env.NEXT_PUBLIC_TOMTOM_API_KEY!,
          container: mapContainer.current!,
          center: [initialLocation.longitude, initialLocation.latitude],
          zoom: 13,
          style: 'https://api.tomtom.com/style/1/style/20.11.00-3/dusk.json',
          interactive: true,
          scrollZoom: true,
          dragPan: true,
        });

        // Add initial marker
        marker.current = new ttModule.Marker({
          color: '#3B82F6',
          draggable: true,
        })
          .setLngLat([initialLocation.longitude, initialLocation.latitude])
          .addTo(map.current);

        // Handle marker drag
        marker.current.on('dragend', () => {
          const lngLat = marker.current.getLngLat();
          onLocationSelect({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
            address: selectedAddress || 'Selected location',
          });
        });

        // Handle map click
        map.current.on('click', (e: any) => {
          if (marker.current) {
            marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
            onLocationSelect({
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
              address: selectedAddress || 'Selected location',
            });
          }
        });
      } catch (error) {
        console.error('Error initializing TomTom:', error);
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [initialLocation]);

  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.length < 2 || !env.NEXT_PUBLIC_TOMTOM_API_KEY || !services) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await services.services.fuzzySearch({
        key: env.NEXT_PUBLIC_TOMTOM_API_KEY!,
        query: query,
        countrySet: 'KE', // Kenya
        limit: 5,
      });

      if (response.results) {
        setSuggestions(response.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (result: any) => {
    const { lat, lon, address } = result.position || result;
    setSearchQuery('');
    setSuggestions([]);
    setSelectedAddress(address);

    if (map.current && marker.current) {
      map.current.jumpTo({
        center: [lon, lat],
        zoom: 15,
      });
      marker.current.setLngLat([lon, lat]);
    }

    onLocationSelect({
      latitude: lat,
      longitude: lon,
      address: address,
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  {suggestion.address}
                </div>
                <div className="text-xs text-gray-500">
                  {suggestion.type}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedAddress && (
        <p className="text-sm text-gray-600 font-medium">
          Selected: {selectedAddress}
        </p>
      )}
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
      />
    </div>
  );
}
