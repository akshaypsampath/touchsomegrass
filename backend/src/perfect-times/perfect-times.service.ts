import { Injectable } from '@nestjs/common';
import { ParksMapService } from '../parks-map/parks-map.service';
import { WeatherForecastService } from '../weather-forecast/weather-forecast.service';

// Activity mapping interface for weather conditions
interface ActivityWeatherMapping {
  activity: string;
  min_wind_speed_mph: number;
  max_chance_of_rain: number;
}

@Injectable()
export class PerfectTimesService {
  // Activity mapping configuration
  private readonly activityMappings: ActivityWeatherMapping[] = [
    {
      activity: 'kite',
      min_wind_speed_mph: 12,
      max_chance_of_rain: 20
    },
    {
      activity: '',
      min_wind_speed_mph: 0,
      max_chance_of_rain: 10
    }
  ];

  constructor(
    private readonly parksMapService: ParksMapService,
    private readonly weatherForecastService: WeatherForecastService
  ) {}

  /**
   * Get perfect times for an activity at a location
   * @param location - Location string (lat,lon or zip code)
   * @param activity - Activity type to search for
   * @param radius - Search radius in miles
   * @returns Promise with perfect times data
   */
  async getPerfectTimes(location: string, activity: string, radius: number): Promise<any> {
    try {
      // Find the activity mapping
      const activityMapping = this.activityMappings.find(mapping => 
        mapping.activity === activity
      );

      if (!activityMapping) {
        throw new Error(`Activity '${activity}' not supported`);
      }

      // Step 1: Get parks within the radius of the location
      const parksResponse = await this.parksMapService.getNearbyLocationsByActivity(
        activity,
        location,
        radius      
      );

      if (!parksResponse.success || !parksResponse?.results) {
        throw new Error('Failed to retrieve parks data');
      }

      const parks = parksResponse.results;
      
      // Step 2: Get weather forecast for all parks at once
      const latLonPairs = parks.map(park => `${park.park_lat},${park.park_lon}`);
      const weatherResponses = await this.weatherForecastService.getWeatherForecastForManyLocations(latLonPairs);
      
      if (!weatherResponses || weatherResponses.length === 0) {
        throw new Error('Failed to retrieve weather data');
      }

      // Step 3: Process each park with its weather data
      const parksWithPerfectTimes: any[] = [];
      for (let i = 0; i < parks.length; i++) {
        const park = parks[i];
        const parkWeather = weatherResponses[i];
        
        if (parkWeather && parkWeather.success && parkWeather.data) {
          
          // Filter weather forecast for perfect conditions
          const perfectTimes = this.filterPerfectTimes(
            parkWeather.data,
            activityMapping
          );

          // Only add parks that have perfect times
          if (perfectTimes && Array.isArray(perfectTimes) && perfectTimes.length > 0) {
            parksWithPerfectTimes.push({
              park_name: park.park_name,
              park_address_1: park.park_address_1,
              park_lat: park.park_lat,
              park_lon: park.park_lon,
              perfect_times: perfectTimes
            });
          }
        }
      }

      // Step 4: Return the formatted response
      return {
        activity: activity,
        location: location,
        radius: radius.toString(),
        total: parksWithPerfectTimes.length,
        parks: parksWithPerfectTimes
      };

    } catch (error) {
      throw new Error(`Failed to get perfect times: ${error.message}`);
    }
  }

  /**
   * Get perfect times for today (or until tomorrow midnight if after 8pm)
   * @param location - Location string (lat,lon or zip code)
   * @param activity - Activity type to search for
   * @param radius - Search radius in miles
   * @returns Promise with perfect times data for today only
   */
  async getPerfectTimesToday(location: string, activity: string, radius: number): Promise<any> {
    try {
      // Get all perfect times first
      const allPerfectTimes = await this.getPerfectTimes(location, activity, radius);
      
      if (!allPerfectTimes.success && !allPerfectTimes.parks) {
        return allPerfectTimes; // Return error response as-is
      }

      const today = new Date();
      const currentHour = today.getHours();
      
      // If it's after 8pm, extend search to tomorrow midnight
      const endDate = new Date(today);
      if (currentHour >= 20) {
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      
      // Start time is beginning of today
      const startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      
      // Filter parks to only include perfect times within today's range
      const filteredParks = allPerfectTimes.parks.map(park => {
        const filteredPerfectTimes = park.perfect_times.filter(timeSlot => {
          const startTime = new Date(timeSlot.startTime);
          return startTime >= startDate && startTime <= endDate;
        });
        
        // Only return parks that still have perfect times after filtering
        if (filteredPerfectTimes.length > 0) {
          return {
            ...park,
            perfect_times: filteredPerfectTimes
          };
        }
        return null;
      }).filter(park => park !== null);
      
      return {
        activity: allPerfectTimes.activity,
        location: allPerfectTimes.location,
        radius: allPerfectTimes.radius,
        total: filteredParks.length,
        parks: filteredParks,
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      };

    } catch (error) {
      throw new Error(`Failed to get perfect times for today: ${error.message}`);
    }
  }

  /**
   * Filter weather forecast data for perfect conditions based on activity mapping
   * @param weatherData - Weather forecast data
   * @param activityMapping - Activity weather requirements
   * @returns Array of perfect time periods
   */
  private filterPerfectTimes(weatherData: any, activityMapping: ActivityWeatherMapping): any[] {
    const perfectTimes: any[] = [];
    
    // Process each weather period in the forecast data
    if (weatherData && Array.isArray(weatherData)) {
      const perfectPeriods: any[] = [];
      
      // First, collect all periods that meet perfect conditions
      for (const weatherPeriod of weatherData) {
        if (this.isPerfectWeather(weatherPeriod, activityMapping)) {
          perfectPeriods.push({
            startTime: weatherPeriod.datetime,
            endTime: this.addOneHour(weatherPeriod.datetime),
            temp: weatherPeriod.temperature_f,
            wind_speed: weatherPeriod.wind_speed_mph,
            chance_of_rain: weatherPeriod.chance_of_rain
          });
        }
      }
      
      // Then, concatenate adjacent periods
      if (perfectPeriods.length > 0) {
        let currentBlock = {
          ...perfectPeriods[0],
          temps: [perfectPeriods[0].temp],
          wind_speeds: [perfectPeriods[0].wind_speed],
          chances_of_rain: [perfectPeriods[0].chance_of_rain]
        };
        
        for (let i = 1; i < perfectPeriods.length; i++) {
          const nextPeriod = perfectPeriods[i];
          
          // Check if this period is adjacent to the current block
          if (this.arePeriodsAdjacent(currentBlock.endTime, nextPeriod.startTime)) {
            // Extend the current block
            currentBlock.endTime = nextPeriod.endTime;
            currentBlock.temps.push(nextPeriod.temp);
            currentBlock.wind_speeds.push(nextPeriod.wind_speed);
            currentBlock.chances_of_rain.push(nextPeriod.chance_of_rain);
          } else {
            // End current block and start a new one
            perfectTimes.push({
              startTime: currentBlock.startTime,
              endTime: currentBlock.endTime,
              avg_temp: `${Math.round(this.calculateAverage(currentBlock.temps))}°F`,
              avg_wind_speed_mph: Math.round(this.calculateAverage(currentBlock.wind_speeds) * 1000000) / 1000000,
              avg_chance_of_rain: Math.round(this.calculateAverage(currentBlock.chances_of_rain))
            });
            currentBlock = {
              ...nextPeriod,
              temps: [nextPeriod.temp],
              wind_speeds: [nextPeriod.wind_speed],
              chances_of_rain: [nextPeriod.chance_of_rain]
            };
          }
        }
        
        // Don't forget to add the last block
        perfectTimes.push({
          startTime: currentBlock.startTime,
          endTime: currentBlock.endTime,
          avg_temp: `${Math.round(this.calculateAverage(currentBlock.temps))}°F`,
          avg_wind_speed_mph: Math.round(this.calculateAverage(currentBlock.wind_speeds) * 1000000) / 1000000,
          avg_chance_of_rain: Math.round(this.calculateAverage(currentBlock.chances_of_rain))
        });
      }
    }
    
    return perfectTimes;
  }

  /**
   * Add one hour to a datetime string
   * @param datetime - Datetime string
   * @returns Datetime string with one hour added
   */
  private addOneHour(datetime: string): string {
    const dateTime = new Date(datetime);
    dateTime.setHours(dateTime.getHours() + 1);
    
    // Format to match startTime format (with timezone offset)
    return dateTime.toLocaleString('sv-SE', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(' ', 'T') + '-04:00';
  }

  /**
   * Check if two time periods are adjacent
   * @param endTime1 - End time of first period
   * @param startTime2 - Start time of second period
   * @returns Boolean indicating if periods are adjacent
   */
  private arePeriodsAdjacent(endTime1: string, startTime2: string): boolean {
    return endTime1 === startTime2;
  }

  /**
   * Check if weather conditions are perfect for an activity
   * @param weatherHour - Weather data for a specific hour
   * @param activityMapping - Activity weather requirements
   * @returns Boolean indicating if conditions are perfect
   */
  private isPerfectWeather(weatherPeriod: any, activityMapping: ActivityWeatherMapping): boolean {
    return (
      weatherPeriod.wind_speed_mph > activityMapping.min_wind_speed_mph &&
      weatherPeriod.chance_of_rain < activityMapping.max_chance_of_rain
    );
  }

  /**
   * Calculate average of an array of numbers
   * @param numbers - Array of numbers
   * @returns Average of all numbers
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return Math.round((sum / numbers.length) * 100) / 100;
  }

  /**
   * Calculate average temperature and format as string
   * @param temp1 - First temperature
   * @param temp2 - Second temperature
   * @returns Formatted temperature string
   */
  private calculateAverageTemp(temp1: number, temp2: number): string {
    const avgTemp = this.calculateAverage([temp1, temp2]);
    return `${avgTemp}°F`;
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
  getActivityMapping(activity: string): ActivityWeatherMapping | undefined {
    return this.activityMappings.find(mapping => mapping.activity === activity);
  }
}
