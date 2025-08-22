import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WeatherForecastService } from './weather-forecast.service';
import { WeatherForecastClient } from './weather-forecast.client';
import { WeatherForecastController } from './weather-forecast.controller';

@Module({
  imports: [HttpModule],
  controllers: [WeatherForecastController],
  providers: [WeatherForecastService, WeatherForecastClient],
  exports: [WeatherForecastService], // makes it available to other modules
})
export class WeatherForecastModule {}
