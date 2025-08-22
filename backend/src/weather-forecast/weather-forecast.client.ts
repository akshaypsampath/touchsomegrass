import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WeatherForecastClient {
  private readonly baseUrl = 'https://api.weatherapi.com/v1';

  constructor(private readonly http: HttpService) {}

  async getForecast(location: string, days: number = 14): Promise<any> {    
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/forecast.json`, {
        params: {
          key: process.env.WEATHER_API_KEY,
          q: location,
          days: days,
          aqi: 'yes',
          alerts: 'no'
        }
      })
    );
    return response.data;
  }
}
