# Map System Documentation

## Overview
This document describes the improved map system for FundiGuard, which includes location picking, job browsing, and service area management.

## Architecture

### Module Loader ([`src/lib/tomtom-loader.ts`](../../src/lib/tomtom-loader.ts))
Optimized module loader with singleton pattern and caching:
- **`loadTomTomMap()`** - Load and cache TomTom maps library
- **`loadTomTomServices()`** - Load and cache TomTom services library  
- **`loadTomTomModules()`** - Load both libraries together with batching
- **`clearModuleCache()`** - For testing purposes

**Benefits:**
- Eliminates repeated imports of large libraries
- Batches parallel requests into single promise
- Dramatically reduces bundle size when multiple components are used

### TypeScript Types ([`src/lib/tomtom-types.ts`](../../src/lib/tomtom-types.ts))
Provides proper TypeScript interfaces for TomTom SDK:
- `TomTomModules` - Map, Marker, Popup interfaces
- `ServicesModules` - Fuzzy search interface
- `LngLat` - Coordinate type

## Components

### 1. **TomTomMap** (Read-only display)
```tsx
<TomTomMap
  latitude={-1.2921}
  longitude={36.8219}
  zoom={13}
  markerLabel="Job Location"
  interactive={false}
/>
```
**Props:**
- `latitude` - Center latitude
- `longitude` - Center longitude
- `zoom` - Map zoom level (default: 13)
- `height` - Container height (default: 300px)
- `markerLabel` - Marker popup text
- `interactive` - Enable/disable interactions (default: true)

### 2. **LocationPicker** (Single location)
```tsx
<LocationPicker
  onLocationSelect={(location) => console.log(location)}
  initialLocation={{ latitude: -1.2921, longitude: 36.8219 }}
  height="400px"
/>
```
**Features:**
- Click map to select location
- Drag marker to adjust
- Search location by name (fuzzy search in Kenya)
- Returns: `{ latitude, longitude, address }`

**Props:**
- `onLocationSelect` - Callback when location changes
- `initialLocation` - Default location (default: Nairobi)
- `height` - Container height (default: 400px)

### 3. **MultiLocationPicker** (Multiple locations) - NEW
```tsx
<MultiLocationPicker
  onLocationsChange={(locations) => console.log(locations)}
  initialLocations={[]}
  maxLocations={10}
/>
```
**Features:**
- Add multiple markers by clicking map
- Search and add locations
- Drag markers to reposition
- Remove individual markers
- Color-coded markers for visual distinction
- Duplicate prevention (configurable)

**Props:**
- `onLocationsChange` - Callback with all locations
- `initialLocations` - Array of initial locations
- `height` - Container height (default: 400px)
- `maxLocations` - Maximum allowed locations (default: 10)
- `allowDuplicates` - Allow same coordinates multiple times (default: false)

### 4. **BrowseJobsMap** (Job browsing)
```tsx
<BrowseJobsMap
  jobs={jobsArray}
  height="500px"
  showOnlyAvailable={true}
/>
```
**Features:**
- Display multiple job markers
- Auto-fit map bounds
- Color-coded by status (green=open, purple=closed)
- Click markers to view details
- Sidebar with job list

**Props:**
- `jobs` - Array of jobs with lat/long
- `height` - Container height (default: 500px)
- `showOnlyAvailable` - Filter to open jobs (default: true)

### 5. **ServiceAreaSetup** (Service radius)
```tsx
<ServiceAreaSetup
  initialLocation={{
    latitude: -1.2921,
    longitude: 36.8219,
    address: 'Nairobi'
  }}
  initialRadius={15}
/>
```
**Features:**
- Set service location with LocationPicker
- Set service radius in km
- Save to database via updateServiceArea action
- Validates and provides feedback

## Utility Functions ([`src/lib/geo.ts`](../../src/lib/geo.ts))

### Distance Calculations
```typescript
// Calculate distance between two points (km)
const distance = calculateDistance(lat1, lon1, lat2, lon2);

// Check if job is in service area
const isInArea = isJobInServiceArea(jobLat, jobLon, proLat, proLon, radiusKm);

// Sort jobs by distance
const sorted = sortJobsByDistance(jobs, centerLat, centerLon);

// Filter jobs by service area
const filtered = filterJobsByServiceArea(jobs, proLat, proLon, radiusKm);

// Format distance for display
const formatted = formatDistance(2.53); // "2.5km"
```

## Error Handling

### MapErrorBoundary
Wraps map components to catch errors gracefully:
```tsx
<MapErrorBoundary fallback={<CustomErrorUI />}>
  <TomTomMap {...props} />
</MapErrorBoundary>
```

### Error Logging
- Errors logged with `[ComponentName]` prefix for easy filtering
- Essential errors only (no verbose console spam in production)
- Format: `console.error('[Component] Error message')`

## Environment Setup

Required environment variables:
```env
NEXT_PUBLIC_TOMTOM_API_KEY=your_tomtom_api_key
```

## Performance Optimizations

1. **Module Caching** - TomTom libraries loaded once and reused
2. **Promise Batching** - Multiple component loads share single async operation
3. **Lazy Loading** - Components use dynamic imports
4. **Memoization** - Callbacks memoized to prevent unnecessary re-renders
5. **Error Recovery** - Graceful degradation on map failures

## Migration Guide

If you're upgrading from the old map system:

1. Replace individual `getTT()` calls with `loadTomTomMap()`
2. Replace `getTTModules()` calls with `loadTomTomModules()`
3. Import types from `@/lib/tomtom-types` instead of inline `any` types
4. Wrap map components in `MapErrorBoundary` for production
5. Remove debug console logging (already cleaned up)

## Usage Examples

### Single Location Form
```tsx
import { LocationPicker } from '@/components/maps/location-picker';

export function JobForm() {
  const [location, setLocation] = useState<any>();

  return (
    <LocationPicker
      onLocationSelect={setLocation}
      initialLocation={{ latitude: -1.2921, longitude: 36.8219 }}
    />
  );
}
```

### Multiple Service Areas
```tsx
import { MultiLocationPicker } from '@/components/maps/multi-location-picker';

export function ServiceAreasForm() {
  const [areas, setAreas] = useState<any[]>([]);

  return (
    <MultiLocationPicker
      onLocationsChange={setAreas}
      maxLocations={5}
    />
  );
}
```

### Job Browse with Error Handling
```tsx
import { BrowseJobsMap } from '@/components/maps/browse-jobs-map';
import { MapErrorBoundary } from '@/components/maps/map-error-boundary';

export function JobBrowser() {
  return (
    <MapErrorBoundary>
      <BrowseJobsMap jobs={jobs} />
    </MapErrorBoundary>
  );
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "TomTom API key not found" | Check `NEXT_PUBLIC_TOMTOM_API_KEY` env var is set |
| Map not rendering | Ensure container has height, use MapErrorBoundary |
| Slow loading | Maps module cached - should be fast on 2nd load |
| Markers not draggable | Check `draggable: true` in Marker options |
| Search not working | Verify API key has fuzzy search permissions |

## Files Structure
```
src/
├── lib/
│   ├── geo.ts                    # Distance calculations
│   ├── tomtom-loader.ts          # Module caching (NEW)
│   └── tomtom-types.ts           # TypeScript types (NEW)
└── components/maps/
    ├── tomtom-map.tsx            # Read-only map (updated)
    ├── location-picker.tsx       # Single picker (updated)
    ├── multi-location-picker.tsx # Multiple picker (NEW)
    ├── browse-jobs-map.tsx       # Job browser (updated)
    ├── service-area-setup.tsx    # Service setup
    └── map-error-boundary.tsx    # Error handling (NEW)
```

## Recent Improvements

✅ **Cleaned up production logging** - Removed emoji/debug messages
✅ **Added TypeScript types** - Better IDE support and type safety
✅ **Optimized module loading** - Singleton pattern with caching
✅ **New MultiLocationPicker** - Support for multiple locations
✅ **Error boundaries** - Graceful error handling
✅ **Better error messages** - Consistent logging format
