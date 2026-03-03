/**
 * TomTom Web SDK Types
 * Provides TypeScript interfaces for TomTom map library
 */

export interface LngLat {
  lng: number;
  lat: number;
}

export interface MapOptions {
  key: string;
  container: HTMLElement;
  center: [number, number];
  zoom: number;
  style?: string;
  interactive?: boolean;
  scrollZoom?: boolean;
  dragPan?: boolean;
}

export interface Popup {
  setHTML(html: string): Popup;
}

export interface Marker {
  setLngLat(lngLat: [number, number]): Marker;
  addTo(map: TomTomMap): Marker;
  setPopup(popup: Popup): Marker;
  togglePopup(): Marker;
  getLngLat(): LngLat;
  on(event: string, callback: () => void): Marker;
  getElement(): HTMLElement;
  remove(): void;
}

export interface TomTomMap {
  on(event: string, callback: (e: any) => void): void;
  jumpTo(options: { center: [number, number]; zoom?: number }): void;
  remove(): void;
}

export interface TomTomModules {
  map(options: MapOptions): TomTomMap;
  Marker: new (options?: { color?: string; draggable?: boolean }) => Marker;
  Popup: new (options?: { offset?: number }) => Popup;
}

export interface ServicesModules {
  services: {
    fuzzySearch(options: any): Promise<{ results?: any[] }>;
  };
}
