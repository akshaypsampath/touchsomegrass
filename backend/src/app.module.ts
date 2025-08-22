import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherForecastModule } from './weather-forecast/weather-forecast.module';

@Module({
  imports: [ConfigModule.forRoot(), WeatherForecastModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
