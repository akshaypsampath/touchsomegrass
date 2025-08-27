import { Module } from '@nestjs/common';
import { PerfectTimesController } from './perfect-times.controller';
import { PerfectTimesService } from './perfect-times.service';
import { ParksMapModule } from '../parks-map/parks-map.module';
import { WeatherForecastModule } from '../weather-forecast/weather-forecast.module';

@Module({
  imports: [ParksMapModule, WeatherForecastModule],
  controllers: [PerfectTimesController],
  providers: [PerfectTimesService],
  exports: [PerfectTimesService], // makes it available to other modules
})
export class PerfectTimesModule {}
