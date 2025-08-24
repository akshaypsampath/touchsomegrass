import { Test, TestingModule } from '@nestjs/testing';
import { WeatherForecastService } from './weather-forecast.service';
import { WeatherForecastClient } from './weather-forecast.client';

describe('WeatherForecastService', () => {
  let service: WeatherForecastService;
  let mockWeatherClient: jest.Mocked<WeatherForecastClient>;

  beforeEach(async () => {
    const mockClient = {
      getForecast: jest.fn(),
      getGridPoints: jest.fn(),
      getForecastForGridPoint: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherForecastService,
        {
          provide: WeatherForecastClient,
          useValue: mockClient,
        },
      ],
    }).compile();

    service = module.get<WeatherForecastService>(WeatherForecastService);
    mockWeatherClient = module.get(WeatherForecastClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have weather client injected', () => {
    expect(mockWeatherClient).toBeDefined();
  });

  describe('parseLocationString', () => {
    it('should return empty array for undefined input', () => {
      const result = service.parseLocationString(undefined);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      const result = service.parseLocationString('');
      expect(result).toEqual([]);
    });

    it('should parse single coordinate pair', () => {
      const result = service.parseLocationString('38.4664,-82.6441');
      expect(result).toEqual(['38.4664,-82.6441']);
    });

    it('should parse multiple coordinate pairs separated by semicolons', () => {
      const result = service.parseLocationString('38.4664,-82.6441;40.7128,-74.0060');
      expect(result).toEqual(['38.4664,-82.6441', '40.7128,-74.0060']);
    });

    it('should filter out invalid coordinates', () => {
      const result = service.parseLocationString('38.4664,-82.6441;invalid;40.7128,-74.0060');
      expect(result).toEqual(['38.4664,-82.6441', '40.7128,-74.0060']);
    });

    it('should handle whitespace around coordinates', () => {
      const result = service.parseLocationString(' 38.4664 , -82.6441 ');
      expect(result).toEqual(['38.4664,-82.6441']);
    });
  });

  describe('getWeatherForecastForOneLocation', () => {
    it('should return success response with formatted data', async () => {
      const mockForecastData = {
        success: true,
        location: {
          name: 'Ashland, KY',
          lat: 38.4664,
          long: -82.6441,
        },
        data: {
          properties: {
            periods: [
              {
                startTime: '2025-08-23T12:00:00-04:00',
                temperature: { value: 28.333333333333332 },
                shortForecast: 'Mostly Sunny',
                windSpeed: { value: 4.82803 },
                relativeHumidity: { value: 67 },
                dewpoint: { value: 21.666666666666668 },
                probabilityOfPrecipitation: { value: 5 },
                windGust: null,
              },
            ],
          },
        },
      };

      mockWeatherClient.getForecast.mockResolvedValue(mockForecastData);

      const result = await service.getWeatherForecastForOneLocation('38.4664,-82.6441');

      expect(result.success).toBe(true);
      expect(result.location.name).toBe('Ashland, KY');
      expect(result.data).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].temperature_f).toBe(83);
      expect(result.data![0].condition).toBe('Mostly Sunny');
    });

    it('should return error response when client fails', async () => {
      mockWeatherClient.getForecast.mockRejectedValue(new Error('API Error'));

      const result = await service.getWeatherForecastForOneLocation('38.4664,-82.6441');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
      expect(result.location.name).toBe('38.4664,-82.6441');
    });
  });

  describe('getWeatherForecastForManyLocations', () => {
    it('should return array of forecasts for multiple locations', async () => {
      const mockForecastData = {
        success: true,
        location: { name: 'Test Location', lat: 0, long: 0 },
        data: []
      };

      mockWeatherClient.getForecast.mockResolvedValue(mockForecastData);

      const result = await service.getWeatherForecastForManyLocations(['38.4664,-82.6441', '40.7128,-74.0060']);

      expect(result).toHaveLength(2);
      expect(result[0].success).toBe(true);
      expect(result[1].success).toBe(true);
    });

    it('should return error response when processing fails', async () => {
      const result = await service.getWeatherForecastForManyLocations(['bad lat/lon']);

      expect(result).toHaveLength(1);
      expect(result[0].success).toBe(false);
      expect(result[0].error).toBeDefined();
    });
  });
});
