'use client';

import { useEffect, useRef, useState } from 'react';
import '@tomtom-international/web-sdk-maps/dist/maps.css';
import { env } from '@/lib/env';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { loadTomTomModules } from '@/lib/tomtom-loader';
import type { TomTomModules, ServicesModules } from '@/lib/tomtom-types';

interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  color?: string;
}

interface MultiLocationPickerProps {
  onLocationsChange: (locations: Location[]) => void;
  initialLocations?: Location[];
  height?: string;
  maxLocations?: number;
  allowDuplicates?: boolean;
}

const DEFAULT_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

/**
 * Enhanced location picker supporting multiple markers
 * Features:
 * - Add/remove multiple location markers
 * - Search for locations
 * - Drag markers to adjust position
 * - Click map to add new marker
 */
export function MultiLocationPicker({
  onLocationsChange,
  initialLocations = [],
  height = '400px',
  maxLocations = 10,
  allowDuplicates = false,
}: MultiLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<Map<string, any>>(new Map());
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [tt, setTT] = useState<any>(null);
  const [services, setServices] = useState<any>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.error('[MultiLocationPicker] No container ref');
      return;
    }
    if (!env.NEXT_PUBLIC_TOMTOM_API_KEY) {
      console.error('[MultiLocationPicker] TomTom API key not found');
      return;
    }

    const initMap = async () => {
      try {
        const { tt: ttModule, services: servicesModule } = (await loadTomTomModules()) as unknown as {
          tt: TomTomModules;
          services: ServicesModules;
        };
        setTT(ttModule);
        setServices(servicesModule);

        const initialCenter: [number, number] =
          locations.length > 0
            ? [locations[0].longitude, locations[0].latitude]
            : [36.8219, -1.2921]; // Default Nairobi

        map.current = ttModule.map({
          key: env.NEXT_PUBLIC_TOMTOM_API_KEY!,
          container: mapContainer.current!,
          center: initialCenter,
          zoom: 13,
          style: 'https://api.tomtom.com/style/1/style/20.11.00-3/dusk.json',
          interactive: true,
          scrollZoom: true,
          dragPan: true,
        });

        // Add initial markers
        locations.forEach((loc, idx) => {
          addMarkerToMap(ttModule, loc, idx);
        });

        // Handle map click to add new location
        map.current.on('click', (e: any) => {
          if (locations.length < maxLocations) {
            const newLocation: Location = {
              id: `loc_${Date.now()}_${Math.random()}`,
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng,
              address: 'Selected location',
              color: DEFAULT_COLORS[locations.length % DEFAULT_COLORS.length],
            };
            addLocation(newLocation);
          }
        });
      } catch (error) {
        console.error('[MultiLocationPicker] Failed to initialize:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    initMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add marker to map
  const addMarkerToMap = (ttModule: any, location: Location, index: number) => {
    if (!map.current) return;

    const color = location.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

    const marker = new ttModule.Marker({
      color: color,
      draggable: true,
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map.current);

    // Handle marker drag
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      updateLocation(location.id, {
        ...location,
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      });
    });

    // Handle marker click
    marker.getElement().addEventListener('click', () => {
      setSelectedLocationId(location.id);
    });

    markers.current.set(location.id, marker);
  };

  // Add new location
  const addLocation = (newLocation: Location) => {
    const isDuplicate = allowDuplicates
      ? false
      : locations.some(
          (loc) =>
            loc.latitude === newLocation.latitude &&
            loc.longitude === newLocation.longitude
        );

    if (isDuplicate) {
      return;
    }

    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    onLocationsChange(updatedLocations);

    if (tt) {
      addMarkerToMap(tt, newLocation, updatedLocations.length - 1);
    }
  };

  // Update location
  const updateLocation = (id: string, updatedLocation: Location) => {
    const updatedLocations = locations.map((loc) =>
      loc.id === id ? updatedLocation : loc
    );
    setLocations(updatedLocations);
    onLocationsChange(updatedLocations);
  };

  // Remove location
  const removeLocation = (id: string) => {
    const marker = markers.current.get(id);
    if (marker) {
      marker.remove();
      markers.current.delete(id);
    }

    const updatedLocations = locations.filter((loc) => loc.id !== id);
    setLocations(updatedLocations);
    onLocationsChange(updatedLocations);
    setSelectedLocationId(null);
  };

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
        countrySet: 'KE',
        limit: 5,
      });

      if (response.results) {
        setSuggestions(response.results);
      }
    } catch (error) {
      console.error('[MultiLocationPicker] Search failed:', error instanceof Error ? error.message : 'Unknown error');
      setSuggestions([]);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (result: any) => {
    const { lat, lon, address } = result.position || result;
    setSearchQuery('');
    setSuggestions([]);

    if (map.current) {
      map.current.jumpTo({
        center: [lon, lat],
        zoom: 15,
      });
    }

    const newLocation: Location = {
      id: `loc_${Date.now()}_${Math.random()}`,
      latitude: lat,
      longitude: lon,
      address: address,
      color: DEFAULT_COLORS[locations.length % DEFAULT_COLORS.length],
    };

    addLocation(newLocation);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0 transition-colors"
              >
                <div className="font-medium text-gray-900">{suggestion.address}</div>
                <div className="text-xs text-gray-500">{suggestion.type}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapContainer}
        style={{ height }}
        className="w-full rounded-lg border border-gray-200 shadow-sm"
      />

      {/* Locations List */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-700">
            Locations ({locations.length}/{maxLocations})
          </p>
          {locations.length === maxLocations && (
            <p className="text-xs text-amber-600">Maximum locations reached</p>
          )}
        </div>

        {locations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-3">
            Click the map or search to add locations
          </p>
        ) : (
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg divide-y">
            {locations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocationId(location.id)}
                className={`p-3 flex items-start justify-between cursor-pointer transition-colors ${
                  selectedLocationId === location.id
                    ? 'bg-blue-50 border-l-4 border-blue-500'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="w-4 h-4 rounded mt-1 flex-shrink-0"
                    style={{ backgroundColor: location.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {location.address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(location.id);
                  }}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 flex-shrink-0"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-500">
        💡 Tip: Search for a location, click on the map, or drag markers to adjust positions
      </p>
    </div>
  );
}
