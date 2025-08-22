import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { WeatherForecastService } from './weather-forecast.service';
import { WeatherForecastResponseDto } from './dto/weather-forecast.dto';

@ApiTags('activities')
@Controller('weather')
export class WeatherForecastController {
  constructor(private readonly weatherService: WeatherForecastService) {}

  @Get('forecastOneLocation')
  @ApiOperation({ summary: 'Get weather forecast for outdoor activities' })
  @ApiQuery({ name: 'location', required: false, description: 'Location (zip code, city, or coordinates)', example: '11221' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (1-14)', example: 14 })
  @ApiResponse({ 
    status: 200, 
    description: 'Weather forecast retrieved successfully',
    type: WeatherForecastResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWeatherForecast(
    @Query('location') location?: string,
    @Query('days') days?: number
  ): Promise<WeatherForecastResponseDto> {
    return this.weatherService.getWeatherForecastForOneLocation(location, days);
  }

  @Get('forecastManyLocations')
  @ApiOperation({ summary: 'Get weather forecast for outdoor activities' })
  @ApiQuery({ 
    name: 'location', 
    required: true, 
    description: 'Locations in format: "name1,name2" or "lat1,lon1;lat2,lon2" or mixed "name1;lat1,lon1"', 
    example: '11221;40.7128,-74.0060;Los Angeles' 
  })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days (1-14)', example: 14 })
  @ApiResponse({ 
    status: 200, 
    description: 'Weather forecast for multiple locations retrieved successfully',
    type: [WeatherForecastResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCurrentWeather(
    @Query('location') locationString?: string,
    @Query('days') days?: number
  ): Promise<WeatherForecastResponseDto[]> {
    const locations = this.weatherService.parseLocationString(locationString);
    return this.weatherService.getWeatherForecastForManyLocations(locations, days);
  }
}
