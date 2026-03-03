/**
 * TomTom Module Loader
 * Caches and reuses TomTom modules to avoid repeated imports
 */

import type { TomTomModules, ServicesModules } from './tomtom-types';

let ttCache: TomTomModules | null = null;
let servicesCache: ServicesModules | null = null;
let loadingPromise: Promise<{ tt: TomTomModules; services: ServicesModules }> | null =
  null;

/**
 * Load TomTom mapping library with caching
 */
export async function loadTomTomMap(): Promise<TomTomModules> {
  if (ttCache) {
    return ttCache;
  }

  try {
    const module = await import('@tomtom-international/web-sdk-maps');
    ttCache = (module as any).default || module;
    return ttCache as TomTomModules;
  } catch (error) {
    console.error('[TomTom] Failed to load maps library:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Load TomTom services library with caching
 */
export async function loadTomTomServices(): Promise<ServicesModules> {
  if (servicesCache) {
    return servicesCache;
  }

  try {
    const module = await import('@tomtom-international/web-sdk-services');
    servicesCache = (module as any).default || module;
    return servicesCache as ServicesModules;
  } catch (error) {
    console.error('[TomTom] Failed to load services library:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Load both TomTom modules together with caching
 */
export async function loadTomTomModules(): Promise<{
  tt: TomTomModules;
  services: ServicesModules;
}> {
  // Return cached version if both are available
  if (ttCache && servicesCache) {
    return { tt: ttCache, services: servicesCache };
  }

  // Return existing promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Create new loading promise
  loadingPromise = (async () => {
    const [tt, services] = await Promise.all([
      loadTomTomMap(),
      loadTomTomServices(),
    ]);
    return { tt, services };
  })();

  try {
    const result = await loadingPromise;
    loadingPromise = null;
    return result;
  } catch (error) {
    loadingPromise = null;
    throw error;
  }
}

/**
 * Clear module cache (useful for testing)
 */
export function clearModuleCache(): void {
  ttCache = null;
  servicesCache = null;
  loadingPromise = null;
}
