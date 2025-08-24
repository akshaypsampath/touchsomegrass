import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherForecastPointRequestDto, WeatherForecastPointResponseDto, WeatherForecastResponseDto } from './dto/weather-forecast.dto';

@Injectable()
export class WeatherForecastClient {
  private readonly baseUrl = 'https://api.weather.gov';
  private readonly userAgent = 'perfecttimeto.com/touchsomegrass, contact@perfecttimeto.com';

  constructor(private readonly http: HttpService) {}

  async getGridPoint({latitude, longitude}: WeatherForecastPointRequestDto): Promise<WeatherForecastPointResponseDto> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/points/${latitude},${longitude}`, {
          headers: {
            'User-Agent': this.userAgent
          }
        })
      );
      
      // Extract city and state from relativeLocation
      const city = response.data.properties.relativeLocation?.properties?.city || '';
      const state = response.data.properties.relativeLocation?.properties?.state || '';
      const cityState = city && state ? `${city}, ${state}` : `${latitude},${longitude}`;
      
      // Extract timezone
      const timezone = response.data.properties.timeZone || 'UTC';
      
      return {
        forecastOffice: response.data.properties.gridId,
        gridX: response.data.properties.gridX,
        gridY: response.data.properties.gridY,
        city: cityState,
        timezone: timezone
      };
    } catch (error) {
      throw new Error(`Failed to get grid points: ${error.message}`);
    }
  }

  async getForecastForGridPoint(forecastOffice: string, x: number, y: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.baseUrl}/gridpoints/${forecastOffice}/${x},${y}/forecast/hourly?units=us`, {
          headers: {
            'User-Agent': this.userAgent,
            'Feature-Flags':'forecast_temperature_qv,forecast_wind_speed_qv'
          }
        })
      );
      console.log('response.data')
      console.log(response.data.properties.periods)
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get hourly forecast: ${error.message}`);
    }
  }

  async getForecast(location: string): Promise<WeatherForecastResponseDto> {
    try {
      // Parse location - could be coordinates or location name
      let latitude: number, longitude: number;
      
      if (location.includes(',')) {
        // Location is coordinates
        [latitude, longitude] = location.split(',').map(coord => parseFloat(coord.trim()));
      } else {
        // For now, we'll need to geocode location names to coordinates
        // This is a simplified approach - in production you might want a geocoding service
        throw new Error('Location names not yet supported. Please use coordinates in format "latitude,longitude"');
      }

      // First get the grid points
      const { forecastOffice, gridX, gridY, city } = await this.getGridPoint({latitude, longitude});

      // Then get the hourly forecast
      const forecast = await this.getForecastForGridPoint(forecastOffice, gridX, gridY);

      return {
        success: true,
        location: {
          name: city,
          lat: latitude,
          long: longitude
        },
        data: forecast,
      };
    } catch (error) {
      return {
        success: false,
        location: { name: location, lat: 0, long: 0 },
        error: `Failed to get forecast: ${error.message}`,
      };
    }
  }
}
