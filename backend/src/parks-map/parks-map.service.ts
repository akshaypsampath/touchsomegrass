import { Injectable } from '@nestjs/common';
import { ParksMapClient } from './parks-map.client';
import { ActivityMapping } from './dto/parks-map.dto';

@Injectable()
export class ParksMapService {
  // Activity mapping configuration
  private readonly activityMappings: ActivityMapping[] = [
    {
      activity: 'kite',
      filter: ['canopy_pct<50', 'park_size_acres>35']
    },
    {
      activity: '',
      filter: []
    }
  ];

  constructor(private readonly parksMapClient: ParksMapClient) {}

  /**
   * Get nearby locations filtered by activity
   * @param activity - Activity type to search for
   * @param location - Location string (lat,lon or zip code)
   * @param radius - Search radius in miles
   * @returns Promise with filtered location data
   */
  async getNearbyLocationsByActivity(
    activity: string, 
    location: string,
    radius: number
  ): Promise<any> {
    try {
      // Find the activity mapping
      if (!activity) {
        activity = '';
      }

      const activityMapping = this.activityMappings.find(mapping => 
        mapping.activity === activity
      );

      if (!activityMapping) {
        throw new Error(`Activity '${activity}' not supported`);
      }

      // Use the client to get parks filtered by activity
      const results = await this.parksMapClient.getParksWithFilters(
        activityMapping.filter,
        location,
        radius
      );

      return {
        success: true,
        activity: activity,
        location: location,
        radius: radius,
        total: results.data.length,
        results: results.data,
        filter: activityMapping.filter
      };
    } catch (error) {
      return {
        success: false,
        activity: activity,
        location: location,
        radius: radius,
        error: error.message
      };
    }
  }

  /**
   * Get all supported activities
   * @returns Array of supported activity names
   */
  getSupportedActivities(): string[] {
    return this.activityMappings.map(mapping => mapping.activity);
  }

  /**
   * Get activity mapping configuration
   * @param activity - Activity name
   * @returns Activity mapping or undefined if not found
   */
  getActivityMapping(activity: string): ActivityMapping | undefined {
    return this.activityMappings.find(mapping => mapping.activity === activity);
  }
}
