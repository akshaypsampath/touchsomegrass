import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherForecastModule } from './weather-forecast/weather-forecast.module';
import { ParksMapModule } from './parks-map/parks-map.module';

@Module({
  imports: [ConfigModule.forRoot(), WeatherForecastModule, ParksMapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
