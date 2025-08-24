import { Injectable } from '@nestjs/common';
import { WeatherForecastClient } from './weather-forecast.client';
import { WeatherForecastDataDto, WeatherForecastLocationDto, WeatherForecastResponseDto } from './dto/weather-forecast.dto';

@Injectable()
export class WeatherForecastService {
  constructor(private readonly weatherClient: WeatherForecastClient) {}

  async getWeatherForecastForOneLocation(location: string = '38.4664,-82.6441'): Promise<WeatherForecastResponseDto> {
    try {
      const report = await this.weatherClient.getForecast(location);
      
      // Extract location information from the client response
      const formattedLocation: WeatherForecastLocationDto = {
        name: report.location?.name || location,
        lat: report.location?.lat || 0,
        long: report.location?.long || 0
      };
      
      // Transform NWS API response to our standardized format
      // The forecast data is in report.data.properties.periods
      const nwsResponse = report.data as any; // Type assertion for NWS API response
      const formattedForecast: WeatherForecastDataDto[] = nwsResponse?.properties?.periods?.map(period => ({
        datetime: period.startTime,
        temperature_f: this.celsiusToFahrenheit(period.temperature?.value || 0),
        condition: period.shortForecast,
        wind_speed_mph: period.windSpeed.value * 0.621371, //convert kmh to mph
        precipitation_in: -1, // NWS doesn't provide this in hourly forecast
        humidity: period.relativeHumidity?.value || 0,
        dew_point_f: this.celsiusToFahrenheit(period.dewpoint?.value || 0),
        will_it_rain: period.probabilityOfPrecipitation?.value > 0 ? 1 : 0,
        chance_of_rain: period.probabilityOfPrecipitation?.value || 0,
        gust_speed_mph: period.windGust, // NWS doesn't provide gust speed in hourly forecast
        air_quality_index: -1, // NWS doesn't provide AQI in hourly forecast
      })) || [];

      return {
        success: true,
        location: formattedLocation,
        data: formattedForecast,
      };
    } catch (error) {
      return {
        success: false,
        location: { name: location, lat: 0, long: 0 },
        error: error.message,
      };
    }
  }

  async getWeatherForecastForManyLocations (locations: string[]): Promise<WeatherForecastResponseDto[]> {
    try {
      const promises = locations.map(location => this.getWeatherForecastForOneLocation(location));
      const results = await Promise.all(promises);
      return results;
    }
    catch (error) {
      return [{
        success: false,
        location: { name: locations[0] || 'unknown', lat: 0, long: 0 },
        error: error.message,
      }];
    }
  }

  parseLocationString(locationString?: string): string[] {
    if (!locationString) return [];
    
    // Split by semicolon to separate different location types
    const locationParts = locationString.split(';');
    
    return locationParts.map(part => {
      const trimmed = part.trim();
      // If it contains a comma, it's likely lat,lon
      if (trimmed.includes(',')) {
        const [lat, lon] = trimmed.split(',').map(coord => coord.trim());
        // Validate lat/lon format
        if (this.isValidLatLon(lat, lon)) {
          return `${lat},${lon}`;
        }
      }
      // Otherwise remove invalid term from list
      // Location mapping should be handled by location service. Weather service should assume that it will be receiving lat/longs
      return null;
    }).filter(loc => loc !== null);
  }

  private isValidLatLon(lat: string, lon: string): boolean {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return !isNaN(latNum) && !isNaN(lonNum) && 
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180;
  }


  private celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }
}
