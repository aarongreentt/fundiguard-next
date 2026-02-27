'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileInput } from '@/components/ui/file-input';
import { LocationPicker } from '@/components/maps/location-picker';
import { handleCreateJobWithImages } from '@/app/actions/post-job';

export function PostJobForm() {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  }>({
    latitude: -1.2921,
    longitude: 36.8219,
    address: 'Nairobi, Kenya',
  });

  const handleLocationSelect = (selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setLocation(selectedLocation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post a job</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleCreateJobWithImages} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Fix leaking kitchen tap"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              placeholder="Plumbing"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label>Location</Label>
            <LocationPicker onLocationSelect={handleLocationSelect} />
            <input
              type="hidden"
              name="location"
              value={location.address}
            />
            <input
              type="hidden"
              name="latitude"
              value={location.latitude}
            />
            <input
              type="hidden"
              name="longitude"
              value={location.longitude}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="budgetRange">Budget range</Label>
            <Input
              id="budgetRange"
              name="budgetRange"
              placeholder="KSh 1,500 - 3,000"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="What needs to be done?"
              rows={5}
            />
          </div>

          <FileInput name="files" multiple />

          <div className="flex items-center justify-end">
            <Button type="submit">Post job</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
