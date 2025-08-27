import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { parseLocation, buildQueryWithFilters, processFeatures } from './parks-map.utils';

@Injectable()
export class ParksMapClient {
  private readonly baseUrl = 'https://server7.tplgis.org/arcgis7/rest/services/ParkServe/ParkServe_ProdNew/MapServer';
  private readonly queryUrl = `${this.baseUrl}/2/query`;
  private readonly userAgent = 'perfecttimeto.com/touchsomegrass, contact@perfecttimeto.com';

  constructor(private readonly http: HttpService) {}

 

  /**
   * Get parks with custom filters and geographic bounds
   * @param filters - Array of filter conditions
   * @param location - Location string (lat,lon or zip code)
   * @param radiusMeters - Search radius in meters
   * @returns Promise with filtered park data
   */
  async getParksWithFilters(
    filters: string[],
    location: string,
    radiusMiles: number
  ): Promise<any> {
    try {
      const {latitude, longitude} = parseLocation(location);

      const queryParams = buildQueryWithFilters(filters, latitude, longitude, radiusMiles);
      
      // Build query string with all parameters
      const queryString = new URLSearchParams({
        f: 'json',
        where: queryParams.whereClause,
        geometryType: queryParams.geometryParams.geometryType,
        geometry: JSON.stringify(queryParams.geometryParams.geometry),
        inSR: queryParams.geometryParams.inSR,
        spatialRel: queryParams.geometryParams.spatialRel,
        distance: queryParams.geometryParams.distance,
        units: queryParams.geometryParams.units,
        outFields: 'park_name,park_address_1,park_size_acres,canopy_pct',
      }).toString();

      const fullUrl = `${this.queryUrl}?${queryString}`;

      const response = await firstValueFrom(
        this.http.get(fullUrl, {
          headers: {
            'User-Agent': this.userAgent
          }
        })
      );

      // Check if ArcGIS API returned an error in the response body
      if (response.data.error) {
        throw new Error(`ArcGIS API Error: ${response.data.error.message} (Code: ${response.data.error.code})`);
      }

      // Process features to add park_lat and park_lon fields
      const processedFeatures = processFeatures(response.data.features);

      return {
        success: true,
        data: processedFeatures,
      };
    } catch (error) {
      throw new Error(`Failed to get parks with filters: ${error.message}`);
    }
  }
}
