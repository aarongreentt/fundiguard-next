'use client';

import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface MapErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary for map components
 * Catches errors and displays user-friendly message
 */
export class MapErrorBoundary extends React.Component<MapErrorBoundaryProps, State> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[MapErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900">Map Failed to Load</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {this.state.error?.message ||
                      'An error occurred while loading the map. Please try again.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}
