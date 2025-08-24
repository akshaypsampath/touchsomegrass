import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { WeatherForecastService } from './weather-forecast.service';
import { WeatherForecastResponseDto } from './dto/weather-forecast.dto';

@ApiTags('activities')
@Controller('weather')
export class WeatherForecastController {
  constructor(private readonly weatherService: WeatherForecastService) {}

  @Get('forecastOneLocation')
  @ApiOperation({ summary: 'Get weather forecast for outdoor activities using coordinates' })
  @ApiQuery({ name: 'location', required: false, description: 'Coordinates in format "lat,lon"', example: '38.4664,-82.6441' })
  @ApiResponse({ 
    status: 200, 
    description: 'Weather forecast retrieved successfully',
    type: WeatherForecastResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getWeatherForecast(
    @Query('location') location?: string
  ): Promise<WeatherForecastResponseDto> {
    return this.weatherService.getWeatherForecastForOneLocation(location);
  }

  @Get('forecastManyLocations')
  @ApiOperation({ summary: 'Get weather forecast for multiple locations using coordinates' })
  @ApiQuery({ 
    name: 'location', 
    required: true, 
    description: 'Coordinates in format "lat1,lon1;lat2,lon2"', 
    example: '38.4664,-82.6441;40.7128,-74.0060' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Weather forecast for multiple locations retrieved successfully',
    type: [WeatherForecastResponseDto]
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCurrentWeather(
    @Query('location') locationString?: string
  ): Promise<WeatherForecastResponseDto[]> {
    const locations = this.weatherService.parseLocationString(locationString);
    return this.weatherService.getWeatherForecastForManyLocations(locations);
  }
}
