import { Test, TestingModule } from '@nestjs/testing';
import { WeatherForecastService } from './weather-forecast.service';

describe('WeatherForecastService', () => {
  let service: WeatherForecastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeatherForecastService],
    }).compile();

    service = module.get<WeatherForecastService>(WeatherForecastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
