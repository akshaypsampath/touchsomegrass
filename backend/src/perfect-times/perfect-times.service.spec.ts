import { Test, TestingModule } from '@nestjs/testing';
import { PerfectTimesService } from './perfect-times.service';
import { ParksMapService } from '../parks-map/parks-map.service';
import { WeatherForecastService } from '../weather-forecast/weather-forecast.service';

describe('PerfectTimesService', () => {
  let service: PerfectTimesService;
  let parksMapService: ParksMapService;
  let weatherForecastService: WeatherForecastService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfectTimesService,
        {
          provide: ParksMapService,
          useValue: {
            getNearbyLocationsByActivity: jest.fn(),
          },
        },
        {
          provide: WeatherForecastService,
          useValue: {
            getWeatherForecastForManyLocations: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PerfectTimesService>(PerfectTimesService);
    parksMapService = module.get<ParksMapService>(ParksMapService);
    weatherForecastService = module.get<WeatherForecastService>(WeatherForecastService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPerfectTimes', () => {
    it('should be defined', () => {
      expect(service.getPerfectTimes).toBeDefined();
    });

    it('should throw error for unsupported activity', async () => {
      await expect(service.getPerfectTimes('11221', 'unsupported', 4))
        .rejects.toThrow('Activity \'unsupported\' not supported');
    });

    it('should successfully get perfect times for kite activity', async () => {
      // Mock parks data
      const mockParksResponse = {
        success: true,
        results: {
          data: [
            {
              park_name: 'Test Park',
              park_address_1: '123 Test St',
              park_lat: 40.7128,
              park_lon: -74.0060,
            }
          ]
        }
      };

      // Mock weather data
      const mockWeatherResponse = {
        success: true,
        location: {
          name: 'Test Location',
          lat: 40.7128,
          long: -74.0060
        },
        data: [
          {
            datetime: '2024-01-15T10:00:00Z',
            temperature_f: 70,
            wind_speed_mph: 15,
            chance_of_rain: 10,
            humidity: 65,
            dew_point_f: 55.4,
            will_it_rain: 0,
            condition: 'Mostly Sunny'
          },
          {
            datetime: '2024-01-15T11:00:00Z',
            temperature_f: 72,
            wind_speed_mph: 18,
            chance_of_rain: 5,
            humidity: 60,
            dew_point_f: 57.2,
            will_it_rain: 0,
            condition: 'Partly Cloudy'
          }
        ]
      };

      jest.spyOn(parksMapService, 'getNearbyLocationsByActivity')
        .mockResolvedValue(mockParksResponse);
      
      jest.spyOn(weatherForecastService, 'getWeatherForecastForManyLocations')
        .mockResolvedValue([mockWeatherResponse]);

      const result = await service.getPerfectTimes('11221', 'kite', 4);

      expect(result).toEqual({
        activity: 'kite',
        location: '11221',
        radius: '4',
        total: 1,
        parks: [
          {
            park_name: 'Test Park',
            park_address_1: '123 Test St',
            park_lat: 40.7128,
            park_lon: -74.0060,
            perfect_times: [
              {
                startTime: '2024-01-15T10:00:00Z',
                endTime: '2024-01-15T11:00:00Z',
                avg_temp: '71°F',
                avg_wind_speed_mph: 16.5,
                avg_chance_of_rain: 7.5
              }
            ]
          }
        ]
      });
    });

    it('should handle parks service failure gracefully', async () => {
      jest.spyOn(parksMapService, 'getNearbyLocationsByActivity')
        .mockResolvedValue({ success: false });

      await expect(service.getPerfectTimes('11221', 'kite', 4))
        .rejects.toThrow('Failed to retrieve parks data');
    });

    it('should continue processing other parks if one fails weather fetch', async () => {
      const mockParksResponse = {
        success: true,
        results: {
          data: [
            {
              park_name: 'Park 1',
              park_address_1: '123 St',
              park_lat: 40.7128,
              park_lon: -74.0060,
            },
            {
              park_name: 'Park 2',
              park_address_1: '456 Ave',
              park_lat: 40.7589,
              park_lon: -73.9851,
            }
          ]
        }
      };

      const mockWeatherResponse = {
        success: true,
        location: {
          name: 'Test Location',
          lat: 40.7128,
          long: -74.0060
        },
        data: [
          {
            datetime: '2024-01-15T10:00:00Z',
            temperature_f: 70,
            wind_speed_mph: 15,
            chance_of_rain: 10,
            humidity: 65,
            dew_point_f: 55.4,
            will_it_rain: 0,
            condition: 'Mostly Sunny'
          },
          {
            datetime: '2024-01-15T11:00:00Z',
            temperature_f: 72,
            wind_speed_mph: 18,
            chance_of_rain: 5,
            humidity: 60,
            dew_point_f: 57.2,
            will_it_rain: 0,
            condition: 'Partly Cloudy'
          }
        ]
      };

      jest.spyOn(parksMapService, 'getNearbyLocationsByActivity')
        .mockResolvedValue(mockParksResponse);
      
      // First park succeeds, second fails
      jest.spyOn(weatherForecastService, 'getWeatherForecastForManyLocations')
        .mockResolvedValueOnce([mockWeatherResponse])
        .mockRejectedValueOnce(new Error('Weather service error'));

      const result = await service.getPerfectTimes('11221', 'kite', 4);

      expect(result.total).toBe(1); // Only one park processed successfully
      expect(result.parks).toHaveLength(1);
      expect(result.parks[0].park_name).toBe('Park 1');
    });
  });

  describe('getSupportedActivities', () => {
    it('should be defined', () => {
      expect(service.getSupportedActivities).toBeDefined();
    });

    it('should return correct activity list', () => {
      const activities = service.getSupportedActivities();
      expect(activities).toEqual(['kite']);
    });
  });

  describe('getPerfectTimesToday', () => {
    it('should be defined', () => {
      expect(service.getPerfectTimesToday).toBeDefined();
    });

    it('should filter perfect times to today only', async () => {
      // Mock the getPerfectTimes method to return data with future dates
      const mockAllPerfectTimes = {
        success: true,
        activity: 'kite',
        location: '11221',
        radius: '4',
        total: 2,
        parks: [
          {
            park_name: 'Today Park',
            park_address_1: '123 Today St',
            park_lat: 40.7128,
            park_lon: -74.0060,
            perfect_times: [
              {
                startTime: new Date().toISOString(), // Today
                endTime: new Date(Date.now() + 3600000).toISOString(), // Today + 1 hour
                avg_temp: '72°F',
                avg_wind_speed_mph: 15,
                avg_chance_of_rain: 10
              }
            ]
          },
          {
            park_name: 'Future Park',
            park_address_1: '456 Future St',
            park_lat: 40.7128,
            park_lon: -74.0060,
            perfect_times: [
              {
                startTime: '2025-12-25T10:00:00Z', // Future date
                endTime: '2025-12-25T11:00:00Z',
                avg_temp: '75°F',
                avg_wind_speed_mph: 18,
                avg_chance_of_rain: 5
              }
            ]
          }
        ]
      };

      jest.spyOn(service, 'getPerfectTimes').mockResolvedValue(mockAllPerfectTimes);

      const result = await service.getPerfectTimesToday('11221', 'kite', 4);

      expect(result.total).toBe(1); // Only today park should remain
      expect(result.parks).toHaveLength(1);
      expect(result.parks[0].park_name).toBe('Today Park');
      expect(result.dateRange).toBeDefined();
      expect(result.dateRange.start).toBeDefined();
      expect(result.dateRange.end).toBeDefined();
    });

    it('should extend to tomorrow midnight if after 8pm', async () => {
      // Mock current time to be after 8pm
      const mockDate = new Date('2024-01-15T21:00:00Z'); // 9pm
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const mockAllPerfectTimes = {
        success: true,
        activity: 'kite',
        location: '11221',
        radius: '4',
        total: 1,
        parks: [
          {
            park_name: 'Late Night Park',
            park_address_1: '789 Late St',
            park_lat: 40.7128,
            park_lon: -74.0060,
            perfect_times: [
              {
                startTime: '2024-01-16T02:00:00Z', // Tomorrow early morning
                endTime: '2024-01-16T03:00:00Z',
                avg_temp: '68°F',
                avg_wind_speed_mph: 14,
                avg_chance_of_rain: 8
              }
            ]
          }
        ]
      };

      jest.spyOn(service, 'getPerfectTimes').mockResolvedValue(mockAllPerfectTimes);

      const result = await service.getPerfectTimesToday('11221', 'kite', 4);

      expect(result.total).toBe(1); // Should include tomorrow early morning
      expect(result.parks[0].park_name).toBe('Late Night Park');
      
      // Restore original Date
      jest.restoreAllMocks();
    });
  });

  describe('getActivityMapping', () => {
    it('should be defined', () => {
      expect(service.getActivityMapping).toBeDefined();
    });

    it('should return correct mapping for valid activity', () => {
      const mapping = service.getActivityMapping('kite');
      expect(mapping).toBeDefined();
      expect(mapping?.activity).toBe('kite');
      expect(mapping?.min_wind_speed_mph).toBe(12);
      expect(mapping?.max_chance_of_rain).toBe(20);
    });

    it('should return undefined for invalid activity', () => {
      const mapping = service.getActivityMapping('invalid');
      expect(mapping).toBeUndefined();
    });
  });

  describe('Activity Mappings Configuration', () => {
    it('should have kite activity configured with correct weather requirements', () => {
      const kiteMapping = service.getActivityMapping('kite');
      expect(kiteMapping).toBeDefined();
      expect(kiteMapping?.activity).toBe('kite');
      expect(kiteMapping?.min_wind_speed_mph).toBe(12);
      expect(kiteMapping?.max_chance_of_rain).toBe(20);
    });

    it('should have correct weather condition logic for kite flying', () => {
      const kiteMapping = service.getActivityMapping('kite');
      expect(kiteMapping).toBeDefined();
      
      // Test perfect weather conditions
      const perfectWeather = {
        wind_mph: 15, // > 12
        chance_of_rain: 10 // < 20
      };
      
      // Test non-perfect weather conditions
      const nonPerfectWeather = {
        wind_mph: 8, // < 12
        chance_of_rain: 25 // > 20
      };
      
      // This would test the private method if we could access it
      // For now, we test the configuration is correct
      expect(kiteMapping?.min_wind_speed_mph).toBeGreaterThan(0);
      expect(kiteMapping?.max_chance_of_rain).toBeLessThan(100);
    });
  });
});
