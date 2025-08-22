import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { WeatherForecastRequestDto, WeatherForecastResponseDto } from './weather-forecast/dto/weather-forecast.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRootMessage(): string {
    return this.appService.getHello();
  }
}
