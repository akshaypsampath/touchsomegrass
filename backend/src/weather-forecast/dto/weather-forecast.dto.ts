import { ApiProperty } from '@nestjs/swagger';


export class WeatherForecastRequestDto {
  @ApiProperty({
    description: 'Location for weather forecast (zip code, city name, or coordinates)',
    example: '11221',
    required: false,
    default: '11221'
  })
  location?: string;

  @ApiProperty({
    description: 'Number of days for forecast (1-14)',
    example: 14,
    required: false,
    default: 14,
    minimum: 1,
    maximum: 14
  })
  days?: number;
}

export class WeatherForecastDataDto {
    @ApiProperty({
        description: 'date and time of the forecast',
        example: '2025-08-22 12:00:00'
    })
    datetime: string;

    @ApiProperty({
        description: 'Temperature in Fahrenheit',
        example: 72.5
    })
    temperature_f: number;

    @ApiProperty({
        description: 'Wind speed in miles per hour',
        example: 10.2
    })
    wind_speed_mph: number;

    @ApiProperty({
        description: 'Gust speed in miles per hour',
        example: 25.3
    })
    gust_speed_mph: number;

    @ApiProperty({
        description: 'Precipitation in inches',
        example: 0.05
    })
    precipitation_in: number;

    @ApiProperty({
        description: 'Relative humidity in percent',
        example: 65
    })
    humidity: number;

    @ApiProperty({
        description: 'Dew point in Fahrenheit',
        example: 55.4
    })
    dew_point_f: number;

    @ApiProperty({
        description: 'Whether it will rain (0 = no, 1 = yes)',
        example: 1
    })
    will_it_rain: number;

    @ApiProperty({
        description: 'Chance of rain in percent',
        example: 80
    })
    chance_of_rain: number;

    @ApiProperty({
        description: 'Air quality index (US EPA AQI scale)',
        example: 2
    })
    air_quality_index: number;
}

export class WeatherForecastLocationDto {
    @ApiProperty({
        description: 'Name of the location',
        example: 'New York'
    })
    name: string;

    @ApiProperty({
        description: 'Latitude of the location',
        example: 40.7128
    })
    lat: number;

    @ApiProperty({
        description: 'Longitude of the location',
        example: -74.0060
    })
    long: number;
}


export class WeatherForecastResponseDto {
  @ApiProperty({
    description: 'Whether the request was successful',
    example: true
  })
  success: boolean;

@ApiProperty({
    description: 'Location used for the forecast',
    example: {
      name: 'McCarren Park',
      lat: 40.7210405,
      long:-73.9539237
    }
  })
  location: WeatherForecastLocationDto;

  @ApiProperty({
    description: 'Weather forecast data from the API',
    example: {
      datetime: '2025-08-22 12:00:00',
      temperature_f: 68,
      wind_speed_mph: 10.2,
      gust_speed_mph: 25.3,
      precipitation_in: 0.05,
      humidity: 65,
      dew_point_f: 55.4,
      will_it_rain: 1,
      chance_of_rain: 80,
      air_quality_index: 2
    },
    required: false
  })
  data?: WeatherForecastDataDto[];

    @ApiProperty({
    description: 'Error message if request failed',
    example: null,
    required: false
  })
  error?: string;

}

