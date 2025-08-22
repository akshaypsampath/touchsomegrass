import { Injectable } from '@nestjs/common';
import { WeatherForecastClient } from './weather-forecast.client';
import { WeatherForecastDataDto, WeatherForecastLocationDto, WeatherForecastResponseDto } from './dto/weather-forecast.dto';

@Injectable()
export class WeatherForecastService {
  constructor(private readonly weatherClient: WeatherForecastClient) {}

  async getWeatherForecastForOneLocation(location: string = '11221', days: number = 14): Promise<WeatherForecastResponseDto> {
    try {
      const report = await this.weatherClient.getForecast(location, days);
      console.log(report.location)
      //format forecast to only include the data we need
      const formattedLocation: WeatherForecastLocationDto = {
        name: report.location.name,
        lat: report.location.lat,
        long: report.location.lon
      };
      const formattedForecast: WeatherForecastDataDto[] = await report.forecast.forecastday.flatMap(day =>
        day.hour.map(h => ({
          datetime: h.time,
          temperature_f: h.temp_f,
          condition: h.condition.text,
          wind_speed_mph: h.wind_mph,
          precipitation_in: h.precip_in,
          humidity: h.humidity,
          dew_point_f: h.dewpoint_f,
          will_it_rain: h.will_it_rain,
          chance_of_rain: h.chance_of_rain,
          gust_speed_mph: h.gust_mph,
          air_quality_index: h.air_quality.us_epa_index,
        }))
      );
      

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

  async getWeatherForecastForManyLocations (locations: string[], days: number = 14): Promise<WeatherForecastResponseDto[]> {
    try {
      const promises = locations.map(location => this.getWeatherForecastForOneLocation(location, days));
      const results = await Promise.all(promises);
      return results;
    }
    catch (error) {
      return [{
        success: false,
        error: error.message,
        location: { name: locations[0], lat: 0, long: 0 },
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
      // Otherwise treat as location name/zip
      return trimmed;
    }).filter(loc => loc.length > 0);
  }

  private isValidLatLon(lat: string, lon: string): boolean {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    return !isNaN(latNum) && !isNaN(lonNum) && 
           latNum >= -90 && latNum <= 90 && 
           lonNum >= -180 && lonNum <= 180;
  }
}
