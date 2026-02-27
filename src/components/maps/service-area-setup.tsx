'use client';

import { useState } from 'react';
import { updateServiceArea } from '@/app/actions/profiles';
import { LocationPicker } from '@/components/maps/location-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ServiceAreaSetupProps {
  initialLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  initialRadius?: number;
}

export function ServiceAreaSetup({
  initialLocation = { latitude: -1.2921, longitude: 36.8219, address: 'Nairobi, Kenya' },
  initialRadius = 15,
}: ServiceAreaSetupProps) {
  const [location, setLocation] = useState(initialLocation);
  const [radius, setRadius] = useState(initialRadius);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLocationSelect = (selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setLocation(selectedLocation);
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.set('serviceLatitude', location.latitude.toString());
      formData.set('serviceLongitude', location.longitude.toString());
      formData.set('serviceRadiusKm', radius.toString());

      const result = await updateServiceArea(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service area');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Area</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label>Service Location</Label>
            <p className="text-sm text-gray-600 mb-3">
              Set the center of your service area. You can search, click on the map, or drag the marker to adjust.
            </p>
            <LocationPicker onLocationSelect={handleLocationSelect} initialLocation={location} />
            <input type="hidden" name="serviceLatitude" value={location.latitude} />
            <input type="hidden" name="serviceLongitude" value={location.longitude} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="radius">Service Radius</Label>
            <div className="flex items-center gap-3">
              <Input
                id="radius"
                type="number"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => {
                  setRadius(Number(e.target.value));
                  setSuccess(false);
                }}
                className="max-w-xs"
              />
              <span className="text-sm text-gray-600">km</span>
            </div>
            <p className="text-xs text-gray-500">
              Jobs within {radius}km of your service location will appear in your dashboard
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">✓ Service area updated successfully</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Service Area'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
