import proj4 from 'proj4'
import zipcodes from 'zipcodes'

/**
 * This function is used to convert zip codes to coordinates
 * @param zipCode - Zip code string
 * @returns Object with latitude and longitude
 */
export function geocodeZipCode(zipCode: string): {latitude: number, longitude: number} {
  const coords = zipcodes.lookup(zipCode)
  return {
    latitude: coords.latitude,
    longitude: coords.longitude
  }
}

/**
 * This function is used to parse the location string into a latitude and longitude
 * @param location - Location string (lat,lon or zip code)
 * @returns Object with latitude and longitude
 */
export function parseLocation(location: string): {latitude: number, longitude: number} {
  let latitude: number, longitude: number;
      
  if (location.includes(',')) {
    // Location is already coordinates
    [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
  } else {
    // Use geocoding for zip codes
    const coords = geocodeZipCode(location);
    latitude = coords.latitude;
    longitude = coords.longitude;
  }
  return {latitude, longitude}
}

/**
 * Build geometry query parameters for ArcGIS API
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radiusMiles - Search radius in miles
 * @returns Object with geometry parameters for ArcGIS query
 */
export function buildGeometryQuery(
  latitude: number,
  longitude: number,
  radiusMiles: number
): { geometry: any; geometryType: string; inSR: string; spatialRel: string; distance: string; units: string } {
  // Build geometry object for the center point
  const geometry = {
    x: longitude,
    y: latitude
  };

  return {
    geometry,
    geometryType: 'esriGeometryPoint',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    distance: radiusMiles.toString(),
    units: 'esriSRUnit_StatuteMile'
  };
}

/**
 * Build a query with custom filters and geographic bounds
 * @param filters - Array of filter conditions (e.g., ['park_size_acres>35', 'canopy_pct<50'])
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param radiusMiles - Search radius in miles
 * @returns Object with query parameters for ArcGIS API
 */
export function buildQueryWithFilters(
  filters: string[],
  latitude: number,
  longitude: number,
  radiusMiles: number
): { whereClause: string; geometryParams: any } {
  // Build WHERE clause from filters
  let whereClause = '1=1'; // Default to get all records

  if (filters && filters.length > 0) {
    whereClause = filters.join(' AND ');
  }

  const geometryParams = buildGeometryQuery(latitude, longitude, radiusMiles);

  return { whereClause, geometryParams };
}

/**
 * Process ArcGIS features to add park_lat and park_lon fields
 * @param features - Array of ArcGIS features
 * @returns Processed features with added coordinate fields
 */
export function processFeatures(features: any[]): any[] {
  return features.map((feature: any) => {
    if (feature.geometry && feature.geometry.rings && feature.geometry.rings[0] && feature.geometry.rings[0].length >= 2) {
      // Get the first coordinate pair from the first ring
      const [x, y] = feature.geometry.rings[0][0];
      
      // Convert Web Mercator coordinates to lat/lon using proj4
      const [lon, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
      
      // Add the new fields to attributes and remove geometry
      return {
        ...feature.attributes,
        park_lat: lat,
        park_lon: lon,
      };
    }
    
    // If no geometry, return feature as is
    return feature;
  });
}
